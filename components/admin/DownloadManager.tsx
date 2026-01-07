import React, { useState, useEffect } from 'react';
import type { DownloadableFile } from '../../types';
import { useSite } from '../../context/SiteContext';
import { UploadIcon, TrashIcon, PlusIcon } from '../Icons';

const useObjectURL = (file?: File | Blob) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const DownloadItem: React.FC<{file: DownloadableFile, onRemove: (id: string) => void}> = ({ file, onRemove }) => {
    const iconUrl = useObjectURL(file.icon);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex-1 min-w-0 flex items-center gap-3">
                {iconUrl ? <img src={iconUrl} alt="ícone" className="w-10 h-10 object-contain rounded-md" /> : <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0"><UploadIcon className="h-5 w-5 text-gray-500 dark:text-gray-400"/></div>}
                <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{file.description}</p>
                    <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline truncate block">{file.fileName || file.downloadUrl}</a>
                </div>
            </div>
            <button onClick={() => onRemove(file.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 ml-4"><TrashIcon /></button>
        </div>
    )
}

const DownloadManager: React.FC = () => {
    const { downloads, setDownloads } = useSite();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sourceType, setSourceType] = useState<'url' | 'upload'>('url');
    const [downloadUrl, setDownloadUrl] = useState('');
    
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string|null>(null);

    const [fileDataUrl, setFileDataUrl] = useState<string|null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [formKey, setFormKey] = useState(Date.now());

    useEffect(() => {
        return () => {
            if (iconPreview) URL.revokeObjectURL(iconPreview);
            if (fileDataUrl && fileDataUrl.startsWith('blob:')) URL.revokeObjectURL(fileDataUrl);
        }
    }, [iconPreview, fileDataUrl]);

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIconFile(file);
            if(iconPreview) URL.revokeObjectURL(iconPreview);
            setIconPreview(URL.createObjectURL(file));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const fileUrl = URL.createObjectURL(file);
            setFileDataUrl(fileUrl);
            setFileName(file.name);
            setDownloadUrl(fileUrl);
        }
    };

    const handleAddDownload = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUrl = sourceType === 'upload' ? fileDataUrl : downloadUrl;
        if (!finalUrl) {
            alert('Por favor, forneça um arquivo ou URL.');
            return;
        }

        const newDownload: DownloadableFile = {
            id: new Date().toISOString(),
            name,
            description,
            downloadUrl: finalUrl,
            icon: iconFile || undefined,
            fileName: sourceType === 'upload' ? fileName : undefined,
        };
        setDownloads([...downloads, newDownload]);
        
        setName('');
        setDescription('');
        setDownloadUrl('');
        setIconFile(null);
        setIconPreview(null);
        setFileDataUrl(null);
        setFileName('');
        setFormKey(Date.now());
    };

    const handleRemoveDownload = (id: string) => {
        setDownloads(downloads.filter(d => d.id !== id));
    };
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Uploads</h3>
            <form key={formKey} onSubmit={handleAddDownload} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4 mb-6">
                <div>
                    <label htmlFor="download-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Arquivo</label>
                    <input type="text" id="download-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                    <label htmlFor="download-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                    <input type="text" id="download-desc" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fonte do Arquivo</label>
                    <div className="mt-2 flex gap-4 text-gray-900 dark:text-gray-200">
                        <label className="flex items-center"><input type="radio" value="url" checked={sourceType === 'url'} onChange={() => setSourceType('url')} className="mr-1" /> URL Externa</label>
                        <label className="flex items-center"><input type="radio" value="upload" checked={sourceType === 'upload'} onChange={() => setSourceType('upload')} className="mr-1"/> Upload de Arquivo</label>
                    </div>
                </div>
                {sourceType === 'url' ? (
                    <div>
                        <label htmlFor="download-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL para Download</label>
                        <input type="url" id="download-url" value={downloadUrl} onChange={e => setDownloadUrl(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" placeholder="https://..." />
                    </div>
                ) : (
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload de Arquivo</label>
                        <input id="file-upload" type="file" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                        {fileName && <p className="text-sm text-green-700 dark:text-green-400 mt-2">Arquivo selecionado: {fileName}</p>}
                    </div>
                )}
                <div>
                    <label htmlFor="icon-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ícone (Opcional)</label>
                    <div className="mt-1 flex items-center gap-4">
                        <span className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                            {iconPreview ? <img src={iconPreview} alt="Preview" className="h-full w-full object-contain" /> : <UploadIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </span>
                        <input id="icon-upload" type="file" accept="image/*" onChange={handleIconChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><PlusIcon /> Adicionar Arquivo</button>
                </div>
            </form>
            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-2">Arquivos Adicionados</h4>
            <div className="space-y-2">
                {downloads.map(file => (
                    <DownloadItem key={file.id} file={file} onRemove={handleRemoveDownload} />
                ))}
                {downloads.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhum arquivo adicionado.</p>}
            </div>
        </div>
    );
};

export default DownloadManager;