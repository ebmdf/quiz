
import React, { useState, useEffect } from 'react';
import type { StoreConfig, PaymentMethodImage } from '../../types';
import { useSite } from '../../context/SiteContext';
import { UploadIcon, TrashIcon, PlusIcon } from '../Icons';

const useObjectURL = (file?: File | Blob | string) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file || typeof file === 'string') {
            setUrl(file as string);
            return;
        };
        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);
    return url;
};

const PaymentImageItem: React.FC<{ item: PaymentMethodImage; onRemove: () => void }> = ({ item, onRemove }) => {
    const imageUrl = useObjectURL(item.image);
    return (
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded-md">
            <div className="flex items-center gap-3">
                <img src={imageUrl} alt={item.name} className="h-8 w-12 object-contain" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
            </div>
            <button onClick={onRemove} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full"><TrashIcon className="h-4 w-4" /></button>
        </div>
    );
};

const PaymentManager: React.FC = () => {
    const { siteConfig, setSiteConfig } = useSite();
    const { storeConfig } = siteConfig;

    const [paymentImageFile, setPaymentImageFile] = useState<File | null>(null);
    const [paymentImageName, setPaymentImageName] = useState('');
    const [paymentImagePreview, setPaymentImagePreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (paymentImagePreview) URL.revokeObjectURL(paymentImagePreview);
        }
    }, [paymentImagePreview]);

    const setStoreConfig = (cb: (prev: StoreConfig) => StoreConfig) => {
        setSiteConfig(prev => ({...prev, storeConfig: cb(prev.storeConfig)}));
    };

    const handleNestedConfigChange = (configName: 'installmentConfig' | 'boletoConfig' | 'pixConfig', key: string, value: any) => {
        setStoreConfig(prev => ({
            ...prev,
            [configName]: {
                ...(prev[configName] as object),
                [key]: value,
            },
        }));
    };

    const handleGatewayChange = (gateway: 'pagseguro' | 'mercadopago', key: string, value: string | boolean) => {
        setStoreConfig(prev => ({
            ...prev,
            paymentGateways: {
                ...prev.paymentGateways,
                [gateway]: {
                    ...prev.paymentGateways[gateway],
                    [key]: value
                }
            }
        }));
    };

    const handleSpecialInstallmentChange = (key: string, value: string | number | boolean) => {
        setStoreConfig(prev => ({
            ...prev,
            installmentConfig: {
                ...prev.installmentConfig,
                specialInstallmentRule: {
                    ...prev.installmentConfig.specialInstallmentRule!,
                    [key]: value,
                }
            }
        }));
    };

    const handlePaymentImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentImageFile(file);
            setPaymentImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddPaymentImage = () => {
        if (!paymentImageFile || !paymentImageName) {
            alert('Nome e imagem são obrigatórios.');
            return;
        }
        const newImage: PaymentMethodImage = {
            id: Date.now().toString(),
            name: paymentImageName,
            image: paymentImageFile,
        };
        setStoreConfig(prev => ({ ...prev, paymentMethodImages: [...(prev.paymentMethodImages || []), newImage] }));
        setPaymentImageFile(null);
        setPaymentImageName('');
        setPaymentImagePreview(null);
    };

    const handleRemovePaymentImage = (id: string) => {
        setStoreConfig(prev => ({ ...prev, paymentMethodImages: prev.paymentMethodImages.filter(img => img.id !== id) }));
    };

    return (
        <div className="space-y-6">
            <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Parcelamento</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">Opções de Parcelamento da Loja</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Estas configurações afetarão a exibição na vitrine e o cálculo final no checkout.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div>
                                <label htmlFor="maxInstallments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Parcelas</label>
                                <input type="number" id="maxInstallments" value={storeConfig.installmentConfig.maxInstallments} onChange={e => handleNestedConfigChange('installmentConfig', 'maxInstallments', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 12" />
                            </div>
                            <div>
                                <label htmlFor="interestFreeInstallments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sem Juros até (Parcelas)</label>
                                <input type="number" id="interestFreeInstallments" value={storeConfig.installmentConfig.interestFreeInstallments} onChange={e => handleNestedConfigChange('installmentConfig', 'interestFreeInstallments', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 3" />
                            </div>
                            <div>
                                <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Taxa de Juros (%)</label>
                                <input type="number" step="0.01" id="interestRate" value={storeConfig.installmentConfig.interestRate} onChange={e => handleNestedConfigChange('installmentConfig', 'interestRate', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Ex: 1.99" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t dark:border-gray-700">
                         <h4 className="font-semibold text-gray-800 dark:text-gray-200">Regra Especial de Parcelamento</h4>
                         <div className="mt-2 space-y-3">
                             <div className="flex items-center">
                                <input type="checkbox" id="special-installment-enabled" checked={storeConfig.installmentConfig.specialInstallmentRule?.enabled} onChange={e => handleSpecialInstallmentChange('enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <label htmlFor="special-installment-enabled" className="ml-2 text-sm text-gray-900 dark:text-gray-300">Ativar regra especial para compras de valor elevado</label>
                            </div>
                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${!storeConfig.installmentConfig.specialInstallmentRule?.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Valor Mínimo do Pedido (R$)</label>
                                    <input type="number" value={storeConfig.installmentConfig.specialInstallmentRule?.minTotal} onChange={e => handleSpecialInstallmentChange('minTotal', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Novo Máximo de Parcelas</label>
                                    <input type="number" value={storeConfig.installmentConfig.specialInstallmentRule?.maxInstallments} onChange={e => handleSpecialInstallmentChange('maxInstallments', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                 <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Sem Juros até (Parcelas)</label>
                                    <input type="number" value={storeConfig.installmentConfig.specialInstallmentRule?.interestFreeInstallments} onChange={e => handleSpecialInstallmentChange('interestFreeInstallments', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Métodos de Pagamento</h3>
                <div className="space-y-6">
                    {/* Credit Card Flags */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Bandeiras de Cartão (Informativo)</h4>
                        <div className="space-y-2 mb-4">
                            {(storeConfig.paymentMethodImages || []).map(item => (
                                <PaymentImageItem key={item.id} item={item} onRemove={() => handleRemovePaymentImage(item.id)} />
                            ))}
                        </div>
                        <div className="space-y-3 pt-3 border-t dark:border-gray-700">
                             <div className="flex items-center gap-4">
                                <span className="h-10 w-16 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                                    {paymentImagePreview ? <img src={paymentImagePreview} alt="Preview" className="h-full w-full object-contain" /> : <UploadIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />}
                                </span>
                                <input type="file" accept="image/*" onChange={handlePaymentImageUpload} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70"/>
                            </div>
                            <div className="flex gap-2">
                                <input type="text" value={paymentImageName} onChange={e => setPaymentImageName(e.target.value)} placeholder="Nome da Bandeira (ex: Visa)" className="flex-grow shadow-sm sm:text-sm border-gray-300 rounded-md" />
                                <button onClick={handleAddPaymentImage} className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"><PlusIcon className="h-4 w-4 inline"/> Adicionar</button>
                            </div>
                        </div>
                    </div>
                    
                    {/* PIX Config */}
                     <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Configuração PIX Próprio / Estático</h4>
                         <div className="space-y-4">
                            <div className="flex items-center">
                                <input type="checkbox" id="pix-enabled" checked={storeConfig.pixConfig.enabled} onChange={e => handleNestedConfigChange('pixConfig', 'enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                                <label htmlFor="pix-enabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Ativar Pagamento por PIX (Chave Manual)</label>
                            </div>
                            <div className={`space-y-3 ${!storeConfig.pixConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Beneficiário</label><input type="text" value={storeConfig.pixConfig.beneficiaryName} onChange={e => handleNestedConfigChange('pixConfig', 'beneficiaryName', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cidade do Beneficiário (sem acentos, ex: SAO PAULO)</label><input type="text" value={storeConfig.pixConfig.beneficiaryCity} onChange={e => handleNestedConfigChange('pixConfig', 'beneficiaryCity', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chave PIX (Email, Telefone, CPF/CNPJ)</label><input type="text" value={storeConfig.pixConfig.pixKey} onChange={e => handleNestedConfigChange('pixConfig', 'pixKey', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gateways de Pagamento</h3>
                <div className="space-y-6">
                    {/* PagSeguro */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">PagSeguro</h4>
                            <div className="flex items-center">
                                <label htmlFor="pagseguro-enabled" className="text-sm text-gray-700 dark:text-gray-300 mr-2">Ativar</label>
                                <button onClick={() => handleGatewayChange('pagseguro', 'enabled', !storeConfig.paymentGateways.pagseguro.enabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${storeConfig.paymentGateways.pagseguro.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}><span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${storeConfig.paymentGateways.pagseguro.enabled ? 'translate-x-5' : 'translate-x-0'}`}/></button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Habilita o pagamento por Cartão de Crédito e PIX via PagSeguro.</p>
                        <div className={`mt-4 space-y-3 ${!storeConfig.paymentGateways.pagseguro.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Modo</label>
                                <select value={storeConfig.paymentGateways.pagseguro.environment} onChange={e => handleGatewayChange('pagseguro', 'environment', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"><option value="sandbox">Sandbox (Teste)</option><option value="production">Produção (Real)</option></select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Email PagSeguro</label>
                                <input type="email" value={storeConfig.paymentGateways.pagseguro.email} onChange={e => handleGatewayChange('pagseguro', 'email', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Token (para ambiente de Produção)</label>
                                <input type="text" value={storeConfig.paymentGateways.pagseguro.token} onChange={e => handleGatewayChange('pagseguro', 'token', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>
                    </div>
                    {/* Mercado Pago */}
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Mercado Pago</h4>
                             <div className="flex items-center">
                                <label htmlFor="mercadopago-enabled" className="text-sm text-gray-700 dark:text-gray-300 mr-2">Ativar</label>
                                <button onClick={() => handleGatewayChange('mercadopago', 'enabled', !storeConfig.paymentGateways.mercadopago.enabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ${storeConfig.paymentGateways.mercadopago.enabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'}`}><span className={`inline-block w-5 h-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${storeConfig.paymentGateways.mercadopago.enabled ? 'translate-x-5' : 'translate-x-0'}`}/></button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Habilita o pagamento por Cartão de Crédito e PIX via Mercado Pago.</p>
                        <div className={`mt-4 space-y-3 ${!storeConfig.paymentGateways.mercadopago.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                             <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Modo</label>
                                <select value={storeConfig.paymentGateways.mercadopago.environment} onChange={e => handleGatewayChange('mercadopago', 'environment', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"><option value="sandbox">Sandbox (Teste)</option><option value="production">Produção (Real)</option></select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Public Key</label>
                                <input type="text" value={storeConfig.paymentGateways.mercadopago.publicKey} onChange={e => handleGatewayChange('mercadopago', 'publicKey', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">Access Token</label>
                                <input type="text" value={storeConfig.paymentGateways.mercadopago.accessToken} onChange={e => handleGatewayChange('mercadopago', 'accessToken', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             <div className="pt-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Configuração de Boleto</h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 space-y-4">
                    <div className="flex items-center">
                        <input type="checkbox" id="boleto-enabled" checked={storeConfig.boletoConfig.enabled} onChange={e => handleNestedConfigChange('boletoConfig', 'enabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                        <label htmlFor="boleto-enabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Ativar Pagamento por Boleto Bancário</label>
                    </div>
                    <div className={`space-y-4 ${!storeConfig.boletoConfig.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Beneficiário</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.beneficiaryName} onChange={e => handleNestedConfigChange('boletoConfig', 'beneficiaryName', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                             <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CPF/CNPJ do Beneficiário</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.beneficiaryDocument} onChange={e => handleNestedConfigChange('boletoConfig', 'beneficiaryDocument', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                        </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Banco</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.bankName} onChange={e => handleNestedConfigChange('boletoConfig', 'bankName', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Código Banco</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.bankCode} onChange={e => handleNestedConfigChange('boletoConfig', 'bankCode', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agência</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.agency} onChange={e => handleNestedConfigChange('boletoConfig', 'agency', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conta Corrente</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.account} onChange={e => handleNestedConfigChange('boletoConfig', 'account', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carteira</label><input type="text" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.wallet} onChange={e => handleNestedConfigChange('boletoConfig', 'wallet', e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dias para Vencimento</label><input type="number" disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.dueDateDays} onChange={e => handleNestedConfigChange('boletoConfig', 'dueDateDays', Number(e.target.value))} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" /></div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instruções</label>
                            <textarea disabled={!storeConfig.boletoConfig.enabled} value={storeConfig.boletoConfig.instructions} onChange={e => handleNestedConfigChange('boletoConfig', 'instructions', e.target.value)} rows={3} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentManager;
