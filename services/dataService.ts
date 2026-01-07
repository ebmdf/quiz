
import { SiteConfig, Banner, Product, DownloadableFile, Review, ProductShowcase, ContentBanner, MusicTrack, User, CartItem, Order, Comment, AnalyticsEvent } from '../types';

// --- Configuration ---
const API_BASE_URL = 'api'; // Caminho relativo para a pasta api na hospedagem

const DB_NAME = 'QuizAppDB';
const DB_VERSION = 3;
export const STORES = ['banners', 'products', 'downloads', 'reviews', 'siteConfig', 'productShowcases', 'contentBanners', 'musicTracks', 'analyticsEvents', 'users', 'cart', 'orders', 'comments'];

// --- Types ---
export type CollectionName = 
    | 'banners' 
    | 'products' 
    | 'downloads' 
    | 'reviews' 
    | 'siteConfig' 
    | 'productShowcases' 
    | 'contentBanners' 
    | 'musicTracks' 
    | 'analyticsEvents' 
    | 'users' 
    | 'cart' 
    | 'orders' 
    | 'comments';

// --- Helper: Convert File/Blob to Base64 for API Transport ---
const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Recursively traverse object and convert Files to Base64 strings
const prepareDataForApi = async (data: any): Promise<any> => {
    if (data instanceof File || data instanceof Blob) {
        return await fileToBase64(data);
    }
    if (Array.isArray(data)) {
        return Promise.all(data.map(item => prepareDataForApi(item)));
    }
    if (typeof data === 'object' && data !== null) {
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = await prepareDataForApi(data[key]);
            }
        }
        return result;
    }
    return data;
};

// --- IndexedDB Implementation (Fallback/Offline) ---
let dbInstance: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject('IndexedDB error');
        request.onsuccess = () => { dbInstance = request.result; resolve(dbInstance); };
        request.onupgradeneeded = (event) => {
            const db = request.result;
            const oldVersion = event.oldVersion;
            STORES.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    if(storeName === 'analyticsEvents') {
                        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                    } else {
                        db.createObjectStore(storeName, { keyPath: 'id' });
                    }
                }
            });
            if (oldVersion < 1 && db.objectStoreNames.contains('interstitialBanners')) {
                db.deleteObjectStore('interstitialBanners');
            }
        };
    });
};

const localDB = {
    getAll: async <T>(storeName: CollectionName): Promise<T[]> => {
        try {
            const db = await initDB();
            return new Promise((resolve) => {
                const request = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
                request.onerror = () => { console.warn(`Local DB getAll error for ${storeName}`); resolve([]); };
                request.onsuccess = () => resolve(request.result as T[]);
            });
        } catch (e) {
            console.error("Local DB Init Error", e);
            return [];
        }
    },
    save: async <T>(storeName: CollectionName, item: T): Promise<T> => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, 'readwrite').objectStore(storeName).put(item);
            request.onerror = () => reject(`Error putting to ${storeName}`);
            request.onsuccess = () => resolve(item);
        });
    },
    remove: async (storeName: CollectionName, id: string | number): Promise<void> => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
            request.onerror = () => reject(`Error removing from ${storeName}`);
            request.onsuccess = () => resolve();
        });
    },
    clear: async (storeName: CollectionName): Promise<void> => {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const request = db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
            request.onerror = () => reject(`Error clearing ${storeName}`);
            request.onsuccess = () => resolve();
        });
    }
};

// --- Remote API Implementation (PHP) ---
const remoteAPI = {
    checkHealth: async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/index.php?endpoint=health`);
            return response.ok;
        } catch (e) {
            return false;
        }
    },
    getAll: async <T>(endpoint: CollectionName): Promise<T[]> => {
        const response = await fetch(`${API_BASE_URL}/index.php?endpoint=${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`Remote API error: ${response.statusText}`);
        return await response.json();
    },
    save: async <T extends { id?: string | number }>(endpoint: CollectionName, item: T): Promise<T> => {
        const payload = await prepareDataForApi(item);
        const response = await fetch(`${API_BASE_URL}/index.php?endpoint=${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Remote API error: ${response.statusText}`);
        return await response.json();
    },
    remove: async (endpoint: CollectionName, id: string | number): Promise<void> => {
        // PHP em servidores compartilhados as vezes bloqueia DELETE, usamos POST com query param ou method override se necessario
        // Aqui tentaremos DELETE padrao, se falhar, verifique o .htaccess
        const response = await fetch(`${API_BASE_URL}/index.php?endpoint=${endpoint}&id=${id}`, { 
            method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Remote API error: ${response.statusText}`);
    },
    clear: async (endpoint: CollectionName): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/index.php?endpoint=${endpoint}&action=clear`, { 
            method: 'POST',
        });
        if (!response.ok) throw new Error(`Remote API error: ${response.statusText}`);
    },
    saveMany: async <T extends { id?: string | number }>(endpoint: CollectionName, items: T[]) => {
        const payload = await prepareDataForApi(items);
        const response = await fetch(`${API_BASE_URL}/index.php?endpoint=${endpoint}&action=bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Remote API error: ${response.statusText}`);
    }
};

// --- Unified Data Service ---
let isRemoteAvailable = false;

export const dataService = {
    init: async () => {
        await initDB(); 
        
        console.log(`Checking PHP Backend connection...`);
        const online = await remoteAPI.checkHealth();
        if (online) {
            isRemoteAvailable = true;
            console.log(`%c Backend PHP Conectado `, 'background: #22c55e; color: #fff; border-radius: 4px; padding: 2px 4px;');
        } else {
            isRemoteAvailable = false;
            console.warn(`%c Backend PHP Indisponível. Usando IndexedDB Local. `, 'background: #f59e0b; color: #000; border-radius: 4px; padding: 2px 4px;');
        }
    },
    
    getAll: async <T>(collection: CollectionName): Promise<T[]> => {
        if (isRemoteAvailable) {
            try { return await remoteAPI.getAll<T>(collection); } 
            catch (e) { console.error("Remote Fetch Failed", e); }
        }
        return localDB.getAll<T>(collection);
    },
    
    save: async <T>(collection: CollectionName, item: T): Promise<T> => {
        if (isRemoteAvailable) {
            try { return await remoteAPI.save<T>(collection, item); } 
            catch (e) { console.error("Remote Save Failed", e); }
        }
        return localDB.save<T>(collection, item);
    },
    
    remove: async (collection: CollectionName, id: string | number): Promise<void> => {
        if (isRemoteAvailable) {
            try { await remoteAPI.remove(collection, id); return; } 
            catch (e) { console.error("Remote Delete Failed", e); }
        }
        return localDB.remove(collection, id);
    },
    
    clear: async (collection: CollectionName): Promise<void> => {
        if (isRemoteAvailable) {
            try { await remoteAPI.clear(collection); return; } 
            catch (e) { console.error("Remote Clear Failed", e); }
        }
        return localDB.clear(collection);
    },
    
    saveMany: async <T>(collection: CollectionName, items: T[]) => {
        if (isRemoteAvailable) {
            try { await remoteAPI.saveMany(collection, items); return; } 
            catch (e) { console.error("Remote Bulk Save Failed", e); }
        }
        const promises = items.map(item => localDB.save(collection, item));
        await Promise.all(promises);
    }
};
