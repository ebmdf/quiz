
import React, { useState, useEffect, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { XIcon } from '../Icons';
import type { Order, User, SiteConfig } from '../../types';

declare const html2pdf: any;

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

const OrderItemWithImage: React.FC<{ item: Order['items'][0] }> = ({ item }) => {
    const imageUrl = useObjectURL(item.productSnapshot.image);
    
    const finalPrice = useMemo(() => {
        let price = item.productSnapshot.price || 0;
        if (item.productSnapshot.variants) {
            for (const variant of item.productSnapshot.variants) {
                const selectedOptionId = item.selectedOptions[variant.id];
                if (selectedOptionId) {
                    const option = variant.options.find(o => o.id === selectedOptionId);
                    if (option && typeof option.priceModifier === 'number') {
                        price += option.priceModifier;
                    }
                }
            }
        }
        return price;
    }, [item]);
    
    const selectedOptionsText = item.productSnapshot.variants?.map(variant => {
        const optionId = item.selectedOptions[variant.id];
        const option = variant.options.find(o => o.id === optionId);
        return option ? `${variant.name}: ${option.value}` : '';
    }).filter(Boolean).join(' / ');

    return (
        <li className="py-3 flex items-start gap-4 border-b dark:border-gray-600 last:border-0">
            <img src={imageUrl} alt={item.productSnapshot.name} className="w-20 h-20 object-cover rounded-md border dark:border-gray-600" />
            <div className="flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{item.productSnapshot.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity} unidade(s)</p>
                {selectedOptionsText && <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded inline-block">{selectedOptionsText}</p>}
                {item.couponCode && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Cupom: {item.couponCode}</p>
                )}
            </div>
            <p className="font-semibold text-right text-gray-800 dark:text-gray-200">R$ {(finalPrice * item.quantity).toFixed(2).replace('.',',')}</p>
        </li>
    );
};

const OrderDetailsModal: React.FC<{ order: Order, onClose: () => void, customer?: User, siteConfig: SiteConfig }> = ({ order, onClose, customer, siteConfig }) => {
    
    const statusLabels: Record<Order['status'], string> = {
        pending: 'Pendente',
        paid: 'Pago',
        shipped: 'Enviado',
        delivered: 'Entregue',
        cancelled: 'Cancelado',
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Detalhes do Pedido #{order.id.slice(-6)}</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400"><XIcon /></button>
                    </div>
                    <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2 text-gray-700 dark:text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><p><strong>Cliente:</strong> {customer?.name || order.userId}</p></div>
                            <div><p><strong>Data:</strong> {new Date(order.date).toLocaleString('pt-BR')}</p></div>
                            {customer?.cpf && <div><p><strong>CPF:</strong> {customer.cpf}</p></div>}
                        </div>
                        <div>
                            <h4 className="font-semibold mt-2 border-t dark:border-gray-600 pt-2">Endereço de Entrega</h4>
                            <p>{order.shippingAddress.logradouro}, {order.shippingAddress.numero} {order.shippingAddress.complemento && `- ${order.shippingAddress.complemento}`}</p>
                            <p>{order.shippingAddress.bairro} - {order.shippingAddress.localidade}/{order.shippingAddress.uf} (CEP: {order.shippingAddress.cep})</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mt-2 border-t dark:border-gray-600 pt-2">Itens do Pedido</h4>
                            <ul className="divide-y dark:divide-gray-600">
                                {order.items.map(item => (
                                <OrderItemWithImage key={item.id} item={item} />
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mt-2 border-t dark:border-gray-600 pt-2">Pagamento</h4>
                            <p><strong>Subtotal:</strong> R$ {order.subtotal.toFixed(2).replace('.', ',')}</p>
                            <p><strong>Frete:</strong> R$ {order.shippingCost.toFixed(2).replace('.', ',')}</p>
                            <p><strong>Total:</strong> R$ {order.total.toFixed(2).replace('.', ',')}</p>
                            {order.paymentMethod === 'credit-card' && (
                                <p><strong>Parcelamento:</strong> {order.installments.count}x de R$ {order.installments.value.toFixed(2).replace('.', ',')}</p>
                            )}
                            <p><strong>Método:</strong> {order.paymentMethod}</p>
                        </div>
                         <div>
                            <h4 className="font-semibold mt-2 border-t dark:border-gray-600 pt-2">Envio</h4>
                            <p><strong>Status:</strong> {statusLabels[order.status]}</p>
                            <p><strong>Código de Rastreio:</strong> {order.trackingCode || 'Não informado'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 flex gap-4 justify-end rounded-b-lg border-t dark:border-gray-600">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Fechar</button>
                </div>
            </div>
        </div>
    );
};

const PrintableOrder: React.FC<{ order: Order, customer?: User, siteConfig: SiteConfig }> = ({ order, customer, siteConfig }) => {
    const logoUrl = useObjectURL(siteConfig.logo);

    return (
        <div className="font-sans text-xs text-black bg-white p-0 m-0 box-border" style={{ color: '#000000', backgroundColor: '#ffffff', width: '100%' }}>
            {/* Page 1: Shipping Label */}
            <div className="w-full h-[296mm] p-8 box-border border-2 border-black flex flex-col bg-white relative">
                <div className="text-center border-b-2 border-black pb-4 mb-4">
                    {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-2 object-contain" />}
                    <h1 className="text-xl font-bold text-black uppercase">{siteConfig.siteTitle}</h1>
                </div>
                <div className="grid grid-cols-1 gap-6 flex-grow content-start">
                    <div className="border-2 border-black p-6">
                        <h2 className="font-bold text-lg border-b-2 border-black pb-2 mb-3 text-black uppercase">Remetente</h2>
                        <p className="font-semibold text-base text-black">{siteConfig.storeConfig.storeName}</p>
                        <p className="text-base text-black">{siteConfig.storeConfig.shippingConfig.storeAddress || 'Endereço da Loja não configurado'}</p>
                        <p className="text-base text-black">CEP: {siteConfig.storeConfig.shippingConfig.correiosConfig.originCep || 'CEP não configurado'}</p>
                    </div>
                    <div className="border-2 border-black p-6 bg-gray-50">
                        <h2 className="font-bold text-lg border-b-2 border-black pb-2 mb-3 text-black uppercase">Destinatário</h2>
                        <p className="font-bold text-xl text-black mb-1">{customer?.name}</p>
                        <p className="text-lg text-black">{order.shippingAddress.logradouro}, {order.shippingAddress.numero}</p>
                        {order.shippingAddress.complemento && <p className="text-lg text-black">{order.shippingAddress.complemento}</p>}
                        <p className="text-lg text-black">{order.shippingAddress.bairro}</p>
                        <p className="text-lg text-black">{order.shippingAddress.localidade} - {order.shippingAddress.uf}</p>
                        <p className="font-bold text-xl text-black mt-2">CEP: {order.shippingAddress.cep}</p>
                    </div>
                </div>
                <div className="border-2 border-black p-6 mt-auto text-center">
                    <p className="text-black text-lg">Pedido Nº: <span className="font-bold text-2xl">{order.id.slice(-8)}</span></p>
                    <div className="h-20 w-full flex items-center justify-center text-gray-400 font-mono text-lg my-4 bg-gray-100 border border-gray-300">
                        ||| || ||| || |||| || ||| ||| ||| (Cód. Barras Simulado)
                    </div>
                    <p className="text-xs">Volume 1/1</p>
                </div>
            </div>

            <div className="page-break" style={{ height: '10px' }}></div>

            {/* Page 2: Order Receipt */}
            <div className="w-full h-[296mm] p-8 box-border flex flex-col bg-white border-2 border-black">
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                    <div>
                        {logoUrl && <img src={logoUrl} alt="Logo" className="h-12 mb-2 object-contain" />}
                        <h1 className="text-2xl font-bold text-black">{siteConfig.siteTitle}</h1>
                        <p className="text-black text-sm uppercase tracking-wide">Comprovante de Venda</p>
                    </div>
                    <div className="text-right">
                        <p className="text-black text-lg"><strong>Pedido:</strong> #{order.id.slice(-8)}</p>
                        <p className="text-black"><strong>Data:</strong> {new Date(order.date).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div className="bg-gray-50 p-4 border border-gray-300">
                        <h3 className="font-bold border-b border-gray-400 mb-2 text-black uppercase text-sm">Dados de Entrega</h3>
                        <p className="text-black text-sm"><strong>Nome:</strong> {customer?.name}</p>
                        <p className="text-black text-sm">{order.shippingAddress.logradouro}, {order.shippingAddress.numero}</p>
                        <p className="text-black text-sm">{order.shippingAddress.bairro}</p>
                        <p className="text-black text-sm">{order.shippingAddress.localidade} - {order.shippingAddress.uf}</p>
                        <p className="text-black text-sm">CEP: {order.shippingAddress.cep}</p>
                    </div>
                    <div className="bg-gray-50 p-4 border border-gray-300">
                        <h3 className="font-bold border-b border-gray-400 mb-2 text-black uppercase text-sm">Dados do Cliente</h3>
                        <p className="text-black text-sm"><strong>Nome:</strong> {customer?.name}</p>
                        <p className="text-black text-sm"><strong>Email:</strong> {customer?.email}</p>
                        <p className="text-black text-sm"><strong>CPF:</strong> {customer?.cpf}</p>
                        <p className="text-black text-sm"><strong>Tel:</strong> {customer?.phone}</p>
                    </div>
                </div>

                <div className="flex-grow">
                    <h3 className="font-bold mb-2 text-black text-lg">Itens do Pedido</h3>
                    <table className="w-full text-left border-collapse border border-black mb-4">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border border-black text-black font-bold">Produto</th>
                                <th className="p-2 border border-black text-center text-black font-bold">Qtd</th>
                                <th className="p-2 border border-black text-right text-black font-bold">Unitário</th>
                                <th className="p-2 border border-black text-right text-black font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => {
                                const finalPrice = (item.productSnapshot.price || 0) + Object.values(item.selectedOptions).reduce((acc, optionId) => {
                                    const variant = item.productSnapshot.variants?.flatMap(v => v.options).find(o => o.id === optionId);
                                    return acc + (variant?.priceModifier || 0);
                                }, 0);

                                return (
                                    <tr key={item.id}>
                                        <td className="p-2 border border-black text-black">
                                            <span className="font-semibold">{item.productSnapshot.name}</span>
                                            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {item.productSnapshot.variants?.map(v => {
                                                        const opt = v.options.find(o => o.id === item.selectedOptions[v.id]);
                                                        return opt ? `${v.name}: ${opt.value}` : null;
                                                    }).filter(Boolean).join(' | ')}
                                                </div>
                                            )}
                                            {item.couponCode && <div className="text-[10px] italic text-green-700">Cupom: {item.couponCode}</div>}
                                        </td>
                                        <td className="p-2 border border-black text-center text-black">{item.quantity}</td>
                                        <td className="p-2 border border-black text-right text-black">R$ {finalPrice.toFixed(2).replace('.', ',')}</td>
                                        <td className="p-2 border border-black text-right text-black">R$ {(finalPrice * item.quantity).toFixed(2).replace('.', ',')}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    
                    <div className="flex justify-end">
                        <div className="w-1/2">
                            <div className="flex justify-between border-b border-gray-300 py-1">
                                <span className="text-black">Subtotal:</span>
                                <span className="text-black font-medium">R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-300 py-1">
                                <span className="text-black">Frete:</span>
                                <span className="text-black font-medium">R$ {order.shippingCost.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-1 bg-black text-white px-2 font-bold text-lg">
                                <span>Total:</span>
                                <span>R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="mt-2 text-right text-xs text-gray-600">
                                Método de Pagamento: {order.paymentMethod === 'credit-card' ? 'Cartão de Crédito' : order.paymentMethod === 'boleto' ? 'Boleto Bancário' : 'PIX'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-auto border-t-2 border-black pt-4 text-center">
                    <p className="font-bold text-lg text-black mb-1">Obrigado pela preferência!</p>
                    <p className="text-sm text-black">{siteConfig.siteTitle} - {siteConfig.siteSubtitle}</p>
                    <p className="text-xs text-gray-500 mt-2">Este documento não é um documento fiscal.</p>
                </div>
            </div>
        </div>
    );
};

const OrderManager: React.FC = () => {
    const { orders, setOrders, users, siteConfig } = useSite();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };
    
    const handleTrackingChange = (orderId: string, trackingCode: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, trackingCode } : o));
    };

    const handleDelete = (orderId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
        }
    };

    const handlePrint = (order: Order) => {
        setPrintingOrder(order);
        // Wait for overlay render then print
        setTimeout(() => {
             const element = document.getElementById('printable-order-content');
             if (element) {
                const opt = {
                  margin: 0, // Reset margins, let the content padding handle it
                  filename: `pedido_${order.id.slice(-6)}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { 
                      scale: 2, 
                      useCORS: true, 
                      logging: false,
                      // Removed fixed windowWidth to allow auto-detection
                  },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                
                html2pdf().set(opt).from(element).save().then(() => {
                    setPrintingOrder(null);
                }).catch((err: any) => {
                    console.error("PDF Error:", err);
                    setPrintingOrder(null);
                });
             } else {
                 console.error("Printable element not found");
                 setPrintingOrder(null);
             }
        }, 1000);
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => filterStatus === 'all' || order.status === filterStatus)
            .filter(order => 
                order.id.includes(searchTerm) || 
                order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                users.find(u => u.id === order.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders, filterStatus, searchTerm, users]);

    const statusOptions: { value: Order['status'], label: string }[] = [
        { value: 'pending', label: 'Pendente' },
        { value: 'paid', label: 'Pago' },
        { value: 'shipped', label: 'Enviado' },
        { value: 'delivered', label: 'Entregue' },
        { value: 'cancelled', label: 'Cancelado' },
    ];

    return (
        <div>
            {selectedOrder && (
                <OrderDetailsModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                    customer={users.find(u => u.id === selectedOrder.userId)}
                    siteConfig={siteConfig}
                />
            )}
            
            {/* Visible Overlay for PDF Generation */}
            {printingOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, overflow: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '20px' }}>
                        <div className="text-white text-xl font-bold mb-4 animate-pulse">Gerando PDF... Aguarde.</div>
                        {/* Ensure the container has the exact A4 dimensions and white bg */}
                        <div id="printable-order-content" style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#ffffff', color: '#000000', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                            <PrintableOrder 
                                order={printingOrder} 
                                customer={users.find(u => u.id === printingOrder.userId)}
                                siteConfig={siteConfig}
                            />
                        </div>
                    </div>
                </div>
            )}

            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Gerenciar Pedidos</h3>
            
            <div className="flex flex-wrap gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Buscar por ID, Email ou Nome..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
                />
                <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white"
                >
                    <option value="all">Todos os Status</option>
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pedido</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredOrders.map(order => {
                            const customer = users.find(u => u.id === order.userId);
                            return (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">#{order.id.slice(-6)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="font-medium text-gray-900 dark:text-white">{customer?.name || 'Desconhecido'}</div>
                                        <div className="text-xs">{order.userId}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">R$ {order.total.toFixed(2).replace('.', ',')}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <select 
                                            value={order.status} 
                                            onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                                            className={`border rounded px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                                                ${order.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 
                                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                  order.status === 'delivered' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                                  'bg-red-100 text-red-800 border-red-200'}`}
                                        >
                                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        {(order.status === 'shipped' || order.status === 'delivered') && (
                                            <input 
                                                type="text" 
                                                placeholder="Cód. Rastreio" 
                                                value={order.trackingCode || ''}
                                                onChange={e => handleTrackingChange(order.id, e.target.value)}
                                                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs dark:bg-gray-800 dark:text-white"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium space-x-2">
                                        <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Ver</button>
                                        <button onClick={() => handlePrint(order)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">Imprimir</button>
                                        <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">Nenhum pedido encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderManager;
