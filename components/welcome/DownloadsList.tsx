
import React, { useState, useEffect } from 'react';
import type { DownloadableFile } from '../../types';
import { useSite } from '../../context/SiteContext';
import { DownloadIcon, FileIcon } from '../Icons';
import CommentsSection from '../CommentsSection';

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


const DownloadItem: React.FC<{file: DownloadableFile}> = ({ file }) => {
    const iconUrl = useObjectURL(file.icon);
    const { logAnalyticsEvent } = useSite();

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between gap-4 border border-transparent dark:border-gray-700">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {iconUrl ? (
                    <img src={iconUrl} alt="ícone" className="h-8 w-8 object-contain flex-shrink-0" />
                ) : (
                    <FileIcon className="h-8 w-8 text-indigo-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 dark:text-white truncate">{file.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{file.description}</p>
                </div>
            </div>
            <a 
                href={file.downloadUrl} 
                download={file.fileName}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => logAnalyticsEvent('download_click', { fileName: file.name })}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex-shrink-0"
            >
                Download
            </a>
        </div>
    );
}

interface DownloadsListProps {
    downloads: DownloadableFile[];
}

const DownloadsList: React.FC<DownloadsListProps> = ({ downloads }) => {
    const { siteConfig } = useSite();

    if (downloads.length === 0) {
        return (
            <div className="mt-10 p-6 rounded-2xl text-center dark:!bg-gray-900" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
                 <h2 className="text-2xl font-bold text-center mb-6" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                    <DownloadIcon className="h-6 w-6 inline-block mr-2" />
                    {siteConfig.downloadsTitle}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Nenhum arquivo disponível para download no momento.</p>
            </div>
        )
    }

    return (
        <div className="mt-10 p-6 rounded-2xl slide-in dark:!bg-gray-900" style={{ backgroundColor: siteConfig.storeConfig.themeBgColor }}>
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2" style={{ color: siteConfig.storeConfig.themePrimaryColor }}>
                <DownloadIcon className="h-6 w-6" />
                {siteConfig.downloadsTitle}
            </h2>
            <div className="space-y-4">
                {downloads.map(file => <DownloadItem key={file.id} file={file} />)}
            </div>
            {siteConfig.commentsConfig.enabled && siteConfig.commentsConfig.enableOnDownloads && (
                <div className="mt-8 pt-6 border-t dark:border-gray-700">
                    <CommentsSection 
                        targetId="downloads_page"
                        targetType="download" 
                    />
                </div>
            )}
        </div>
    );
};

export default DownloadsList;
