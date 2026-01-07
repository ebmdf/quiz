
import React, { useState, useMemo, useEffect } from 'react';
import { useSite } from '../context/SiteContext';
import RegistrationScreen from './RegistrationScreen';
import type { Order } from '../types';
import { VisaIcon, MastercardIcon, AmexIcon, GenericCardIcon, DownloadIcon } from './Icons';

type CheckoutStep = 'identification' | 'shipping' | 'payment' | 'confirmation' | 'post-payment-action';

declare const html2pdf: any;

// --- Sub-components for post-payment actions ---

const BoletoDisplay: React.FC<{ order: Order, onBackToStore: () => void }> = ({ order, onBackToStore }) => {
    const { siteConfig, currentUser } = useSite();
    const { boletoConfig } = siteConfig.storeConfig;
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (boletoConfig.dueDateDays || 5));

    // Simple fake barcode generator
    const Barcode: React.FC<{ className?: string }> = ({ className }) => (
        <div className={`flex h-16 items-stretch overflow-hidden ${className}`}>
            {Array.from({ length: 80 }).map((_, i) => (
                <div key={i} className="bg-black" style={{ width: `${Math.random() > 0.4 ? '1px' : '2px'}` }}></div>
            ))}
        </div>
    );
    const digitableLine = useMemo(() => {
        const totalString = order.total.toFixed(2).replace('.', '').padStart(10, '0');
        return `${boletoConfig.bankCode}99 91234.567890 12345.678901 2 ${totalString}`;
    }, [order.total, boletoConfig.bankCode]);
    
    const handlePrint = () => {
        setIsGeneratingPdf(true);
        
        setTimeout(() => {
            const element = document.getElementById('boleto-pdf-container');
            if (!element) {
                setIsGeneratingPdf(false);
                return;
            }

            const opt = {
              margin: 0,
              filename: `boleto_pedido_${order.id.slice(-6)}.pdf`,
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
        }, 1000); // Wait for overlay render
    };


    const BoletoContent = () => (
        <div className="boleto-container bg-white text-black" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '9pt', border: '1px solid #000', width: '100%', backgroundColor: '#ffffff', color: '#000000' }}>
            {/* --- Recibo do Pagador --- */}
            <div className="boleto-section" style={{ padding: '0.5rem', borderBottom: '1px solid #000' }}>
                <div className="boleto-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div className="boleto-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="boleto-bank-code" style={{ fontWeight: 'bold', fontSize: '1.5rem', borderRight: '2px solid #000', paddingRight: '0.5rem' }}>{boletoConfig.bankCode}-X</div>
                        <div className="boleto-bank-name" style={{ fontWeight: 'bold', fontSize: '1.6rem' }}>{boletoConfig.bankName}</div>
                    </div>
                    <div className="boleto-digitable-line" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{digitableLine}</div>
                </div>
                <div className="boleto-field-group" style={{ display: 'flex' }}>
                    <div className="boleto-field w-3-5" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 3 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Beneficiário</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{boletoConfig.beneficiaryName}</span></div>
                    <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Agência / Código Beneficiário</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{boletoConfig.agency} / {boletoConfig.account}</span></div>
                    <div className="boleto-field align-right" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Vencimento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>{dueDate.toLocaleDateString('pt-BR')}</span></div>
                </div>
                 <div className="boleto-field-group" style={{ display: 'flex' }}>
                    <div className="boleto-field w-3-5" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 3 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Pagador</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{currentUser?.name}</span></div>
                    <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Nosso Número</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{order.id.slice(-8)}</span></div>
                    <div className="boleto-field align-right" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Valor do Documento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>R$ {order.total.toFixed(2).replace('.', ',')}</span></div>
                </div>
            </div>
            <div className="boleto-cut-line" style={{ borderTop: '1px dashed #000', textAlign: 'right', padding: '2px 5px', fontSize: '8pt' }}>Recorte na linha pontilhada</div>
            <div className="boleto-section" style={{ padding: '0.5rem' }}>
                <div className="boleto-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <div className="boleto-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div className="boleto-bank-code" style={{ fontWeight: 'bold', fontSize: '1.5rem', borderRight: '2px solid #000', paddingRight: '0.5rem' }}>{boletoConfig.bankCode}-X</div><div className="boleto-bank-name" style={{ fontWeight: 'bold', fontSize: '1.6rem' }}>{boletoConfig.bankName}</div></div>
                    <div className="boleto-digitable-line" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{digitableLine}</div>
                </div>
                <div className="flex">
                    <div className="w-4/5 pr-4 border-r border-black">
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Local de Pagamento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>Pagável em qualquer banco até o vencimento.</span></div>
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Beneficiário</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{boletoConfig.beneficiaryName} - CNPJ: {boletoConfig.beneficiaryDocument}</span></div>
                        <div className="boleto-field-group" style={{ display: 'flex' }}>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Data do Documento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{new Date(order.date).toLocaleDateString('pt-BR')}</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Nº do Documento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{order.id.slice(-8)}</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Espécie Doc.</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>DM</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Aceite</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>N</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Data Processamento</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{new Date(order.date).toLocaleDateString('pt-BR')}</span></div>
                        </div>
                        <div className="boleto-field-group" style={{ display: 'flex' }}>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Uso do Banco</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}></span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Carteira</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{boletoConfig.wallet}</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Espécie</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>R$</span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Quantidade</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}></span></div>
                            <div className="boleto-field" style={{ borderLeft: '1px solid #000', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', flexGrow: 1 }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Valor</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}></span></div>
                        </div>
                         <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Instruções (Texto de responsabilidade do beneficiário)</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{boletoConfig.instructions}</span></div>
                    </div>
                    <div className="w-1/5 pl-4 flex flex-col justify-between">
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Vencimento</label><span className="font-bold text-base text-right" style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>{dueDate.toLocaleDateString('pt-BR')}</span></div>
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Agência/Código Beneficiário</label><span className="text-right" style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>{boletoConfig.agency} / {boletoConfig.account}</span></div>
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Nosso Número</label><span className="text-right" style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>{order.id.slice(-8)}</span></div>
                        <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>(=) Valor do Documento</label><span className="font-bold text-base text-right" style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em', textAlign: 'right' }}>R$ {order.total.toFixed(2).replace('.', ',')}</span></div>
                    </div>
                </div>
                 <div className="boleto-field" style={{ padding: '0.25rem 0.5rem', marginBottom: '0.5rem' }}><label style={{ display: 'block', fontSize: '7pt', color: '#333', marginBottom: '2px' }}>Pagador</label><span style={{ fontWeight: 'bold', display: 'block', minHeight: '1.2em' }}>{currentUser?.name} - {currentUser?.cpf}<br/>{order.shippingAddress.logradouro}, {order.shippingAddress.numero}<br/>{order.shippingAddress.bairro} - {order.shippingAddress.localidade}/{order.shippingAddress.uf} - {order.shippingAddress.cep}</span></div>
            </div>
            <div className="boleto-barcode-container" style={{ padding: '1rem 0' }}><Barcode /></div>
        </div>
    );

    return (
        <div className="text-center p-4 dark:text-white">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">Boleto Gerado!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Pague o boleto para confirmar seu pedido.</p>
            <div className="rounded-lg overflow-hidden max-w-2xl mx-auto bg-white p-1">
                <BoletoContent />
            </div>
            
            {/* Hidden Overlay for PDF Generation */}
            {isGeneratingPdf && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, overflow: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '20px' }}>
                        <div className="text-white text-xl font-bold mb-4 animate-pulse">Gerando PDF... Aguarde.</div>
                        {/* Container sized for A4 with white background */}
                        <div id="boleto-pdf-container" style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#000000', padding: '20mm', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '100%' }}>
                                <BoletoContent />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-center gap-4">
                <button onClick={onBackToStore} className="px-6 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">Voltar para a Loja</button>
                <button onClick={handlePrint} disabled={isGeneratingPdf} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:bg-indigo-400">
                    <DownloadIcon className="h-5 w-5"/>
                    {isGeneratingPdf ? 'Gerando...' : 'Baixar PDF do Boleto'}
                </button>
            </div>
        </div>
    );
};


const PixDisplay: React.FC<{ order: Order, onBackToStore: () => void, onPaymentConfirmed: (orderId: string) => void }> = ({ order, onBackToStore, onPaymentConfirmed }) => {
    const [status, setStatus] = useState<'waiting' | 'confirmed'>(order.status === 'paid' ? 'confirmed' : 'waiting');
    const { siteConfig } = useSite();
    const { pixConfig } = siteConfig.storeConfig;

    const pixCopyPaste = useMemo(() => {
        const format = (id: string, value: string) => {
            const len = value.length.toString().padStart(2, '0');
            return `${id}${len}${value}`;
        };
        
        const merchantAccountInfo = format('00', 'BR.GOV.BCB.PIX') + format('01', pixConfig.pixKey);
        const amount = order.total.toFixed(2);
        const merchantName = (pixConfig.beneficiaryName || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 25);
        const merchantCity = (pixConfig.beneficiaryCity || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 15);

        let brCode = '000201' +
            format('26', merchantAccountInfo) +
            '52040000' + // Merchant Category Code (0000)
            '5303986' + // Transaction Currency (BRL)
            format('54', amount) +
            '5802BR' + // Country Code
            format('59', merchantName) +
            format('60', merchantCity) +
            format('62', format('05', '***')) + // Transaction ID (*** for user-editable)
            '6304';
        
        let crc = 0xFFFF;
        for (let c = 0; c < brCode.length; c++) {
            crc ^= brCode.charCodeAt(c) << 8;
            for (let i = 0; i < 8; i++) {
                if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
                else crc = crc << 1;
            }
        }
        crc = crc & 0xFFFF;
        
        return brCode + crc.toString(16).toUpperCase().padStart(4, '0');
    }, [order.total, pixConfig]);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCopyPaste)}`;

    useEffect(() => {
        if (order.status === 'paid' || status === 'confirmed') {
            return;
        }

        const timer = setTimeout(() => {
            setStatus('confirmed');
            onPaymentConfirmed(order.id);
        }, 8000); // Simulate payment after 8 seconds

        return () => clearTimeout(timer);
    }, [order.id, order.status, onPaymentConfirmed, status]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixCopyPaste).then(() => {
            alert('Chave PIX copiada para a área de transferência!');
        });
    };

    if (status === 'confirmed') {
        return (
             <div className="text-center p-8 dark:text-white">
                <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Pagamento Confirmado!</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">Obrigado pela sua compra! Seu pedido foi recebido.</p>
                <button onClick={onBackToStore} className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Voltar para a Loja</button>
            </div>
        );
    }
    
    return (
        <div className="text-center p-4 dark:text-white">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">Pague com PIX</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Use o QR Code ou a chave "copia e cola" para finalizar sua compra.</p>
            <div className="flex flex-col items-center gap-6">
                <div className="p-2 bg-white rounded-lg">
                    <img src={qrCodeUrl} alt="PIX QR Code" className="w-52 h-52"/>
                </div>
                <div className="w-full max-w-sm">
                    <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">PIX Copia e Cola</p>
                    <div className="relative">
                        <input type="text" readOnly value={pixCopyPaste} className="w-full bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 p-2 rounded-md text-xs pr-10 text-gray-800 dark:text-gray-200"/>
                        <button onClick={copyToClipboard} className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">
                           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
                 <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-amber-600 border-r-amber-600 border-b-amber-200 border-l-amber-200"></div>
                    <span>Aguardando confirmação do pagamento...</span>
                </div>
            </div>
        </div>
    );
};


// --- Main Checkout Component ---

// Luhn algorithm checker for credit card validation
const luhnCheck = (val: string): boolean => {
    const digits = val.replace(/\D/g, '');
    if (!/^\d+$/.test(digits) || digits.length < 13) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/[^\d]+/g,'');
  if(cleanCpf === '') return false;
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;
  let add = 0;
  for (let i=0; i < 9; i ++) add += parseInt(cleanCpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(9))) return false;
  add = 0;
  for (let i = 0; i < 10; i ++) add += parseInt(cleanCpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(10))) return false;
  return true;
}

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

const getCardBrand = (cardNumber: string): CardBrand => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    return 'unknown';
};


const CheckoutScreen: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
    const { currentUser, cart, products, siteConfig, setOrders, setCart, shippingDetails, consumeCoupon, selectedInstallmentCount } = useSite();
    const [step, setStep] = useState<CheckoutStep>('identification');
    const [selectedInstallments, setSelectedInstallments] = useState(selectedInstallmentCount || 1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit-card');
    const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Credit Card State
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', cpf: '' });
    const [cardBrand, setCardBrand] = useState<CardBrand>('unknown');
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedInstallmentCount && selectedInstallmentCount !== selectedInstallments) {
            setSelectedInstallments(selectedInstallmentCount);
        }
    }, [selectedInstallmentCount]);

    const handleCardDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'number') {
            value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
            setCardBrand(getCardBrand(value));
        }
        if (name === 'expiry') {
            value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substring(0, 5);
        }
        if (name === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }
        if (name === 'cpf') {
            // Simple masking for visual feedback in card form
            value = value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
        }
        setCardData(prev => ({ ...prev, [name]: value }));
        if (cardErrors[name]) {
            setCardErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    const validateCardForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (cardData.name.trim().split(' ').length < 2) errors.name = 'Insira o nome completo como no cartão.';
        if (!luhnCheck(cardData.number)) errors.number = 'Número de cartão de crédito inválido.';
        const expiryMatch = cardData.expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!expiryMatch) {
            errors.expiry = 'Data inválida (MM/AA).';
        } else {
            const [, month, year] = expiryMatch;
            const expiryDate = new Date(Number('20' + year), Number(month)); // Month is 1-12, new Date handles it correctly
            const today = new Date();
            today.setDate(1); today.setHours(0,0,0,0);
            if (expiryDate < today) {
                 errors.expiry = 'Cartão expirado.';
            }
        }
        if (cardData.cvv.length < 3) errors.cvv = 'CVV inválido.';
        if (!validateCPF(cardData.cpf)) errors.cpf = 'CPF do titular inválido.';
        
        setCardErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isCreditCardEnabled = useMemo(() => {
        const { pagseguro, mercadopago } = siteConfig.storeConfig.paymentGateways;
        const isPagSeguroReady = pagseguro.enabled && !!pagseguro.email && !!pagseguro.token;
        const isMercadoPagoReady = mercadopago.enabled && !!mercadopago.publicKey && !!mercadopago.accessToken;
        return isPagSeguroReady || isMercadoPagoReady;
    }, [siteConfig.storeConfig.paymentGateways]);

    const isPixEnabled = useMemo(() => {
        const { pixConfig } = siteConfig.storeConfig;
        return pixConfig.enabled && !!pixConfig.pixKey;
    }, [siteConfig.storeConfig.pixConfig]);
    
    const isBoletoEnabled = useMemo(() => {
        const { boletoConfig } = siteConfig.storeConfig;
        return boletoConfig.enabled;
    }, [siteConfig.storeConfig.boletoConfig]);

    useEffect(() => {
        // If credit card was selected but becomes disabled, switch to another available method
        if (selectedPaymentMethod === 'credit-card' && !isCreditCardEnabled) {
            if (isPixEnabled) {
                setSelectedPaymentMethod('pix');
            } else if (isBoletoEnabled) {
                setSelectedPaymentMethod('boleto');
            }
        }
    }, [isCreditCardEnabled, isPixEnabled, isBoletoEnabled, selectedPaymentMethod]);


    const subtotal = useMemo(() => {
         return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return total;
            let itemPrice = product.price || 0;
            if (product.variants) {
                product.variants.forEach(variant => {
                    const optionId = item.selectedOptions[variant.id];
                    const option = variant.options.find(o => o.id === optionId);
                    if(option?.priceModifier) itemPrice += option.priceModifier;
                });
            }
            
            // Apply coupon discount if enabled and exists
            if (item.couponCode && siteConfig.storeConfig.productDetailConfig.showCouponInfo) {
                 const coupon = siteConfig.storeConfig.coupons.find(c => c.code === item.couponCode && c.enabled);
                 if (coupon) {
                     if (coupon.type === 'percentage') {
                         itemPrice = itemPrice - (itemPrice * (coupon.value / 100));
                     } else {
                         itemPrice = Math.max(0, itemPrice - coupon.value);
                     }
                 }
            }

            return total + (itemPrice * item.quantity);
        }, 0);
    }, [cart, products, siteConfig.storeConfig.coupons, siteConfig.storeConfig.productDetailConfig.showCouponInfo]);
    
    const shippingCost = shippingDetails?.cost ?? 0;
    const total = subtotal + shippingCost;
    
    const installmentOptions = useMemo(() => {
        const { interestRate, specialInstallmentRule } = siteConfig.storeConfig.installmentConfig;
        
        let effectiveMaxInstallments = siteConfig.storeConfig.installmentConfig.maxInstallments;
        let effectiveInterestFreeInstallments = siteConfig.storeConfig.installmentConfig.interestFreeInstallments;

        if (specialInstallmentRule?.enabled && total >= specialInstallmentRule.minTotal) {
            effectiveMaxInstallments = specialInstallmentRule.maxInstallments;
            effectiveInterestFreeInstallments = specialInstallmentRule.interestFreeInstallments;
        }

        const options = [];
        for (let i = 1; i <= effectiveMaxInstallments; i++) {
            if (i <= effectiveInterestFreeInstallments) {
                options.push({ count: i, value: total / i, total: total, interest: 'sem juros' });
            } else {
                 const totalWithInterest = total * Math.pow(1 + (interestRate / 100), i - effectiveInterestFreeInstallments);
                options.push({ count: i, value: totalWithInterest / i, total: totalWithInterest, interest: 'c/ juros' });
            }
        }
        return options;
    }, [total, siteConfig.storeConfig.installmentConfig]);

    const handleLoginSuccess = () => {
        setStep('shipping');
    };

    const processPayment = async (): Promise<{ success: boolean; message?: string }> => {
        setIsProcessingPayment(true);
        setPaymentError('');

        if (!validateCardForm()) {
            setIsProcessingPayment(false);
            return { success: false, message: 'Por favor, corrija os erros no formulário.' };
        }
        
        const { pagseguro, mercadopago } = siteConfig.storeConfig.paymentGateways;

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (pagseguro.enabled) {
            console.log("Simulating payment with PagSeguro...", {
                environment: pagseguro.environment,
                card: '**** **** **** ' + cardData.number.slice(-5),
                total: total
            });
        } else if (mercadopago.enabled) {
            console.log("Simulating payment with Mercado Pago...", {
                environment: mercadopago.environment,
                card: '**** **** **** ' + cardData.number.slice(-5),
                total: total
            });
        } else {
            setIsProcessingPayment(false);
            return { success: false, message: 'Nenhum gateway de pagamento configurado.' };
        }
        
        // Simulate decline for a specific card number
        if (cardData.number.endsWith('1111 ')) { // Note the space to match formatting
            setIsProcessingPayment(false);
            return { success: false, message: 'Pagamento recusado pela operadora. Tente outro cartão.' };
        }
        
        setIsProcessingPayment(false);
        return { success: true };
    };
    
    const handlePixPaymentConfirmed = (orderId: string) => {
        setOrders(prevOrders =>
            prevOrders.map(o =>
                o.id === orderId ? { ...o, status: 'paid' } : o
            )
        );
    };

    const handleConfirmOrder = async () => {
        setPaymentError('');
        if (!currentUser || !shippingDetails) {
            alert("Detalhes do frete não encontrados. Por favor, calcule o frete novamente.");
            return;
        }

        if (selectedPaymentMethod === 'credit-card') {
            const paymentResult = await processPayment();
            if (!paymentResult.success) {
                setPaymentError(paymentResult.message || 'Ocorreu um erro desconhecido.');
                return;
            }
        }
        
        const orderItems = cart.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return { ...item, productSnapshot: { ...product } };
        });

        const selectedInstallment = installmentOptions.find(opt => opt.count === selectedInstallments)!;

        const newOrder: Order = {
            id: new Date().getTime().toString(),
            userId: currentUser.id,
            items: orderItems,
            shippingAddress: currentUser.address,
            shippingCost,
            subtotal,
            total: selectedPaymentMethod === 'credit-card' ? selectedInstallment.total : total,
            installments: {
                count: selectedPaymentMethod === 'credit-card' ? selectedInstallment.count : 1,
                value: selectedPaymentMethod === 'credit-card' ? selectedInstallment.value : total,
                total: selectedPaymentMethod === 'credit-card' ? selectedInstallment.total : total,
            },
            paymentMethod: selectedPaymentMethod as Order['paymentMethod'],
            status: selectedPaymentMethod === 'credit-card' ? 'paid' : 'pending',
            date: new Date().toISOString(),
        };
        
        // Identify unique coupons used in this order
        const usedCoupons = new Set<string>();
        cart.forEach(item => {
            if (item.couponCode) usedCoupons.add(item.couponCode);
        });
        
        // Consume the coupons (decrement usage count, disable if limit reached)
        for (const code of usedCoupons) {
            await consumeCoupon(code);
        }

        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        setConfirmedOrder(newOrder);

        if (selectedPaymentMethod === 'boleto' || selectedPaymentMethod === 'pix') {
            setStep('post-payment-action');
        } else {
            setStep('confirmation');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'identification':
                if (currentUser) {
                    setStep('shipping'); // Skip if already logged in
                    return null;
                }
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">1. Identificação</h2>
                        <RegistrationScreen onLoginSuccess={handleLoginSuccess} />
                    </div>
                );
            case 'shipping':
                 if (!currentUser) { setStep('identification'); return null; }
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">2. Endereço de Entrega</h2>
                         {shippingDetails ? (
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-gray-800 dark:text-gray-200">
                                <p className="font-semibold">{currentUser.name}</p>
                                <p>{shippingDetails.address}</p>
                                <p>CEP: {shippingDetails.cep}</p>
                            </div>
                        ) : (
                            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg text-red-700 dark:text-red-300">
                                <p>Nenhum endereço de entrega selecionado. Por favor, volte e calcule o frete para um item no seu carrinho.</p>
                            </div>
                        )}
                        <div className="flex justify-between mt-6">
                            <button onClick={() => setStep('identification')} className="text-sm text-indigo-600 dark:text-indigo-400">Trocar de conta</button>
                            <button onClick={() => setStep('payment')} disabled={!shippingDetails} className="px-6 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors">Continuar para Pagamento</button>
                        </div>
                    </div>
                );
            case 'payment':
                return (
                     <div>
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">3. Pagamento</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Método de Pagamento</h3>
                                 <div className="space-y-2">
                                     <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === 'credit-card' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'} ${!isCreditCardEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <input type="radio" name="payment" value="credit-card" checked={selectedPaymentMethod === 'credit-card'} onChange={e => setSelectedPaymentMethod(e.target.value)} className="mr-2 text-indigo-600" disabled={!isCreditCardEnabled}/> <span className="text-gray-800 dark:text-gray-200">Cartão de Crédito</span>
                                     </label>
                                     <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === 'boleto' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}  ${!isBoletoEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}><input type="radio" name="payment" value="boleto" checked={selectedPaymentMethod === 'boleto'} onChange={e => setSelectedPaymentMethod(e.target.value)} className="mr-2 text-indigo-600" disabled={!isBoletoEnabled} /> <span className="text-gray-800 dark:text-gray-200">Boleto Bancário</span></label>
                                     <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedPaymentMethod === 'pix' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'} ${!isPixEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}><input type="radio" name="payment" value="pix" checked={selectedPaymentMethod === 'pix'} onChange={e => setSelectedPaymentMethod(e.target.value)} className="mr-2 text-indigo-600" disabled={!isPixEnabled} /> <span className="text-gray-800 dark:text-gray-200">PIX</span></label>
                                 </div>
                                {selectedPaymentMethod === 'credit-card' && isCreditCardEnabled && (
                                    <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Dados do Cartão</h4>
                                        <div>
                                            <div className="relative">
                                                <input name="number" value={cardData.number} onChange={handleCardDataChange} placeholder="Número do Cartão" className={`w-full p-2 border rounded-md pr-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${cardErrors.number ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`} />
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2 h-6 flex items-center">
                                                    {cardBrand === 'visa' && <VisaIcon />}
                                                    {cardBrand === 'mastercard' && <MastercardIcon />}
                                                    {cardBrand === 'amex' && <AmexIcon />}
                                                    {cardBrand === 'unknown' && <GenericCardIcon className="h-6 w-6 text-gray-400" />}
                                                </div>
                                            </div>
                                            {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
                                        </div>
                                        <div>
                                            <input name="name" value={cardData.name} onChange={handleCardDataChange} placeholder="Nome Completo no Cartão" className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${cardErrors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`} />
                                            {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
                                        </div>
                                        <div>
                                            <input name="cpf" value={cardData.cpf} onChange={handleCardDataChange} placeholder="CPF do Titular" className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${cardErrors.cpf ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`} />
                                            {cardErrors.cpf && <p className="text-red-500 text-xs mt-1">{cardErrors.cpf}</p>}
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-1/2">
                                                <input name="expiry" value={cardData.expiry} onChange={handleCardDataChange} placeholder="Validade (MM/AA)" className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${cardErrors.expiry ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`} />
                                                {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                                            </div>
                                            <div className="w-1/2">
                                                <input name="cvv" value={cardData.cvv} onChange={handleCardDataChange} placeholder="CVV" className={`w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-500'}`} />
                                                {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Resumo do Pedido</h3>
                                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <div className="flex justify-between"><span>Subtotal:</span> <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span></div>
                                    <div className="flex justify-between"><span>Frete:</span> <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span></div>
                                    <div className="flex justify-between font-bold text-base border-t border-gray-300 dark:border-gray-600 pt-2"><span>Total:</span> <span>R$ {total.toFixed(2).replace('.', ',')}</span></div>
                                </div>
                                {selectedPaymentMethod === 'credit-card' && isCreditCardEnabled && (
                                    <>
                                        <h3 className="font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-200">Parcelamento</h3>
                                        <select value={selectedInstallments} onChange={e => setSelectedInstallments(Number(e.target.value))} className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                                            {installmentOptions.map(opt => (
                                                <option key={opt.count} value={opt.count}>
                                                    {opt.count}x de R$ {opt.value.toFixed(2).replace('.', ',')} {opt.interest !== 'sem juros' && `(Total: R$ ${opt.total.toFixed(2)})`}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>
                         <div className="mt-8">
                             {paymentError && <p className="text-red-600 dark:text-red-400 text-center mb-4">{paymentError}</p>}
                             <div className="flex justify-between items-center">
                                <button onClick={() => setStep('shipping')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Voltar para Endereço</button>
                                <button onClick={handleConfirmOrder} disabled={isProcessingPayment} className="px-6 py-3 bg-green-600 text-white font-bold rounded-md text-lg w-64 disabled:bg-green-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors">
                                    {isProcessingPayment ? 'Processando...' : 'Finalizar Compra'}
                                </button>
                            </div>
                         </div>
                    </div>
                );
            case 'post-payment-action':
                if (!confirmedOrder) return null;
                if (confirmedOrder.paymentMethod === 'boleto') {
                    return <BoletoDisplay order={confirmedOrder} onBackToStore={onBackToStore} />;
                }
                if (confirmedOrder.paymentMethod === 'pix') {
                    return <PixDisplay order={confirmedOrder} onBackToStore={onBackToStore} onPaymentConfirmed={handlePixPaymentConfirmed} />;
                }
                return null;
            case 'confirmation':
                return (
                    <div className="text-center p-8">
                        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">Pedido Realizado com Sucesso!</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Obrigado pela sua compra, {currentUser?.name.split(' ')[0]}!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Um resumo do seu pedido foi enviado para {currentUser?.email}.</p>
                        <button onClick={onBackToStore} className="mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Voltar para a Loja</button>
                    </div>
                );
        }
    };
    
    return (
        <div className="quiz-container glass-card rounded-2xl overflow-y-auto my-auto z-10 p-4 sm:p-8 bg-white/90 dark:bg-gray-800/95 border border-white/20 dark:border-gray-700">
            {step !== 'confirmation' && step !== 'post-payment-action' && (
                <button onClick={onBackToStore} className="text-sm text-indigo-600 dark:text-indigo-400 mb-4 hover:underline">&larr; Voltar para a loja</button>
            )}
            {renderStep()}
        </div>
    );
};

export default CheckoutScreen;
