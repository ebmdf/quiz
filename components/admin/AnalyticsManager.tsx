
import React, { useState, useEffect } from 'react';
import { useSite } from '../../context/SiteContext';
import type { AnalyticsEvent } from '../../types';
import { ChartBarIcon, MusicIcon, StoreIcon, DownloadIcon, WordSearchIcon, UsersIcon } from '../Icons'; 
import { RandomIcon as QuizIcon } from '../Icons';

declare const html2pdf: any;

interface Stats {
    totalVisits: number;
    quizStarts: number;
    wordSearchStarts: number;
    productClicks: number;
    downloadClicks: number;
    musicPlays: number;
}

const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode, color: string}> = ({ title, value, icon, color }) => {

    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300',
        sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
        rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
        teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300'
    };
    
    const cardColor = colorClasses[color] || colorClasses.indigo;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className={`p-3 rounded-full ${cardColor}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            </div>
        </div>
    );
};


const AnalyticsManager: React.FC = () => {
    const { getAnalyticsEvents, siteConfig } = useSite();
    const [filteredEvents, setFilteredEvents] = useState<AnalyticsEvent[]>([]);
    const [stats, setStats] = useState<Stats>({
        totalVisits: 0,
        quizStarts: 0,
        wordSearchStarts: 0,
        productClicks: 0,
        downloadClicks: 0,
        musicPlays: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');

    useEffect(() => {
        const fetchAndProcessData = async () => {
            setIsLoading(true);
            const events = await getAnalyticsEvents();

            let processedEvents = events;
            const now = new Date();
            if (timeFilter === 'week') {
                const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                processedEvents = events.filter(e => e.timestamp >= lastWeek.getTime());
            } else if (timeFilter === 'month') {
                processedEvents = events.filter(e => {
                    const eventDate = new Date(e.timestamp);
                    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
                });
            } else if (timeFilter === 'year') {
                processedEvents = events.filter(e => new Date(e.timestamp).getFullYear() === now.getFullYear());
            }
            
            const newStats: Stats = {
                totalVisits: processedEvents.filter(e => e.type === 'site_visit').length,
                quizStarts: processedEvents.filter(e => e.type === 'quiz_start').length,
                wordSearchStarts: processedEvents.filter(e => e.type === 'wordsearch_start').length,
                productClicks: processedEvents.filter(e => e.type === 'product_click').length,
                downloadClicks: processedEvents.filter(e => e.type === 'download_click').length,
                musicPlays: processedEvents.filter(e => e.type === 'music_play').length,
            };

            setStats(newStats);
            setFilteredEvents(processedEvents.sort((a,b) => b.timestamp - a.timestamp));
            setIsLoading(false);
        };

        fetchAndProcessData();
    }, [getAnalyticsEvents, timeFilter]);

    const handlePrintReport = () => {
        setIsGeneratingPdf(true);
        
        // Wait for the overlay to render
        setTimeout(() => {
            const element = document.getElementById('analytics-report-printable');
            if (element) {
                const opt = {
                  margin: 10,
                  filename: `relatorio_de_atividade.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true, logging: false },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                html2pdf().from(element).set(opt).save().then(() => {
                    setIsGeneratingPdf(false);
                }).catch((err: any) => {
                    console.error("PDF Error:", err);
                    setIsGeneratingPdf(false);
                });
            } else {
                setIsGeneratingPdf(false);
            }
        }, 1000);
    };

    const FilterButton: React.FC<{ period: typeof timeFilter, label: string }> = ({ period, label }) => (
        <button
            onClick={() => setTimeFilter(period)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === period ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600'}`}
        >
            {label}
        </button>
    );

    const timeFilterLabels = {
        all: 'Desde o início',
        week: 'Últimos 7 dias',
        month: 'Este Mês',
        year: 'Este Ano'
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Relatório de Atividade</h3>
                 <button onClick={handlePrintReport} disabled={isGeneratingPdf} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    {isGeneratingPdf ? 'Gerando PDF...' : 'Imprimir Relatório'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Estes dados são coletados anonimamente e armazenados localmente no seu navegador. Eles representam as suas ações neste dispositivo e não são agregados entre diferentes usuários ou sessões.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <FilterButton period="all" label="Desde o início" />
                <FilterButton period="week" label="Últimos 7 dias" />
                <FilterButton period="month" label="Este Mês" />
                <FilterButton period="year" label="Este Ano" />
            </div>

            {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Carregando estatísticas...</p>
            ) : (
                <>
                    <div id="analytics-report-content">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title="Visitantes Online" value={1} icon={<UsersIcon className="h-6 w-6" />} color="teal" />
                            <StatCard title="Visitas ao Site" value={stats.totalVisits} icon={<ChartBarIcon className="h-6 w-6" />} color="indigo" />
                            <StatCard title="Quizzes Iniciados" value={stats.quizStarts} icon={<QuizIcon className="h-6 w-6" />} color="sky" />
                            <StatCard title="Caça-Palavras Iniciados" value={stats.wordSearchStarts} icon={<WordSearchIcon className="h-6 w-6" />} color="purple" />
                            <StatCard title="Cliques em Produtos" value={stats.productClicks} icon={<StoreIcon className="h-6 w-6" />} color="amber" />
                            <StatCard title="Downloads Realizados" value={stats.downloadClicks} icon={<DownloadIcon className="h-6 w-6" />} color="emerald" />
                            <StatCard title="Músicas Tocadas" value={stats.musicPlays} icon={<MusicIcon className="h-6 w-6" />} color="rose" />
                        </div>

                        <div className="mt-8">
                            <h4 className="text-md font-semibold text-gray-600 dark:text-gray-300 mb-4">Log de Eventos Recentes</h4>
                            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Horário</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dados</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredEvents.map(event => (
                                            <tr key={event.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{event.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(event.timestamp).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded font-mono max-w-xs overflow-x-auto">{event.data ? JSON.stringify(event.data) : 'N/A'}</pre>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEvents.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">Nenhum evento registrado para este período.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Visible Overlay for PDF Generation - Ensures HTML2PDF captures it correctly */}
                    {isGeneratingPdf && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="text-white text-xl font-bold mb-4 animate-pulse">Gerando Relatório PDF... Aguarde.</div>
                            <div id="analytics-report-printable" style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#000000', padding: '20mm', boxShadow: '0 0 20px rgba(0,0,0,0.5)', margin: '20px auto' }}>
                                <div className="font-sans">
                                    <h1 className="text-3xl font-bold mb-2 text-black text-center">{siteConfig.siteTitle}</h1>
                                    <h2 className="text-xl font-semibold border-b-2 border-black pb-2 mb-6 text-black text-center">Relatório de Atividade</h2>
                                    
                                    <div className="flex justify-between text-sm text-gray-700 mb-8 bg-gray-100 p-2 rounded">
                                        <span><strong>Período:</strong> {timeFilterLabels[timeFilter]}</span>
                                        <span><strong>Data de Emissão:</strong> {new Date().toLocaleString('pt-BR')}</span>
                                    </div>

                                    <h3 className="text-lg font-bold mb-4 text-black border-b border-gray-300 pb-1">Visão Geral</h3>
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Visitas</p><p className="text-2xl font-bold text-black">{stats.totalVisits}</p></div>
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Quizzes</p><p className="text-2xl font-bold text-black">{stats.quizStarts}</p></div>
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Caça-Palavras</p><p className="text-2xl font-bold text-black">{stats.wordSearchStarts}</p></div>
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Cliques em Produtos</p><p className="text-2xl font-bold text-black">{stats.productClicks}</p></div>
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Downloads</p><p className="text-2xl font-bold text-black">{stats.downloadClicks}</p></div>
                                        <div className="p-3 border border-gray-300 rounded text-center"><p className="text-xs text-gray-600 uppercase">Músicas</p><p className="text-2xl font-bold text-black">{stats.musicPlays}</p></div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold mb-2 text-black border-b border-gray-300 pb-1">Log de Eventos (Últimos 100)</h3>
                                     <table className="w-full text-xs text-left border-collapse">
                                        <thead className="bg-gray-200 border-b border-gray-400">
                                            <tr>
                                                <th className="p-2 text-black font-bold">Tipo</th>
                                                <th className="p-2 text-black font-bold">Horário</th>
                                                <th className="p-2 text-black font-bold">Dados</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEvents.slice(0, 100).map(event => (
                                                <tr key={event.id} className="border-b border-gray-200">
                                                    <td className="p-2 text-black font-medium">{event.type}</td>
                                                    <td className="p-2 text-black">{new Date(event.timestamp).toLocaleString()}</td>
                                                    <td className="p-2 font-mono text-gray-600">{event.data ? JSON.stringify(event.data).slice(0, 100) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AnalyticsManager;
