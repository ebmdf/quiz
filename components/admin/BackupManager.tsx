
import React, { useState } from 'react';
import { dataService, STORES, CollectionName } from '../../services/dataService';
import { DownloadIcon, UploadIcon } from '../Icons';

const BackupManager: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleExport = async () => {
        setIsProcessing(true);
        setMessage(null);
        try {
            const backupData: Record<string, any> = {
                version: 1,
                timestamp: new Date().toISOString(),
                data: {}
            };

            for (const store of STORES) {
                const items = await dataService.getAll(store as CollectionName);
                backupData.data[store] = items;
            }

            // Create blob and download
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-loja-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Backup gerado com sucesso!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erro ao gerar backup.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation of file type
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setMessage({ type: 'error', text: 'O arquivo selecionado não é um JSON válido.' });
            e.target.value = '';
            return;
        }

        if (!window.confirm("ATENÇÃO: Restaurar um backup irá SUBSTITUIR todos os dados atuais (produtos, configurações, pedidos, etc). Deseja continuar?")) {
            e.target.value = ''; // Reset input
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                let backupData;
                try {
                    backupData = JSON.parse(json);
                } catch (e) {
                    throw new Error("O arquivo não contém um JSON válido.");
                }

                // Validation
                if (!backupData || typeof backupData !== 'object') {
                    throw new Error("Formato de arquivo inválido (raiz).");
                }
                if (!backupData.data || typeof backupData.data !== 'object') {
                    throw new Error("Estrutura de dados inválida. Objeto 'data' ausente.");
                }

                // Check if at least one store matches
                const keys = Object.keys(backupData.data);
                const validStores = keys.filter(key => STORES.includes(key));

                if (validStores.length === 0) {
                    throw new Error("O arquivo não contém dados reconhecíveis para restauração.");
                }

                // Iterate over stores in the backup
                for (const storeName of Object.keys(backupData.data)) {
                    if (STORES.includes(storeName)) {
                        const collection = storeName as CollectionName;
                        const items = backupData.data[collection];

                        // Clear existing data
                        await dataService.clear(collection);

                        // Insert new data
                        if (Array.isArray(items)) {
                            await dataService.saveMany(collection, items);
                        }
                    }
                }

                setMessage({ type: 'success', text: 'Dados restaurados com sucesso! A página será recarregada em instantes...' });
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } catch (error: any) {
                console.error(error);
                setMessage({ type: 'error', text: error.message || 'Erro desconhecido ao restaurar backup.' });
            } finally {
                setIsProcessing(false);
                e.target.value = ''; // Reset input
            }
        };
        
        reader.onerror = () => {
            setMessage({ type: 'error', text: 'Erro ao ler o arquivo.' });
            setIsProcessing(false);
            e.target.value = '';
        };

        reader.readAsText(file);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Backup e Restauração</h3>
            
            {message && (
                <div className={`p-4 mb-4 rounded-md border ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-200' : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'}`}>
                    <p className="font-medium">{message.type === 'success' ? 'Sucesso' : 'Erro'}</p>
                    <p className="text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                    <h4 className="text-md font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <DownloadIcon className="h-5 w-5" /> Exportar Dados
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Baixe um arquivo JSON contendo todos os dados do site (produtos, configurações, pedidos, etc).
                        Guarde este arquivo em local seguro.
                    </p>
                    <button 
                        onClick={handleExport} 
                        disabled={isProcessing}
                        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {isProcessing ? 'Processando...' : 'Baixar Backup'}
                    </button>
                </div>

                {/* Import Section */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 shadow-sm">
                    <h4 className="text-md font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <UploadIcon className="h-5 w-5" /> Restaurar Dados
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Restaure o site a partir de um arquivo de backup anterior. 
                        <strong className="text-red-500 block mt-1">CUIDADO: Isso apagará todos os dados atuais!</strong>
                    </p>
                    <label className={`w-full py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer flex justify-center items-center gap-2 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
                        <span>{isProcessing ? 'Processando...' : 'Selecionar Arquivo JSON'}</span>
                        <input type="file" accept=".json,application/json" onChange={handleImport} className="hidden" disabled={isProcessing} />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default BackupManager;
