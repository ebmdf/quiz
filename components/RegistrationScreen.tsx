

import React, { useState, useEffect, useMemo } from 'react';
import { useSite } from '../context/SiteContext';
import type { User, Address, Order } from '../types';

// Helper for password strength
const getPasswordStrength = (password: string): { score: number; feedback: string } => {
    let score = 0;
    let feedback = 'Muito Fraca';
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) feedback = 'Fraca';
    else if (score === 3) feedback = 'Média';
    else if (score === 4) feedback = 'Forte';
    else if (score === 5) feedback = 'Muito Forte';
    
    return { score, feedback };
};

const isPasswordStrong = (password: string): { strong: boolean; message: string } => {
    const { score } = getPasswordStrength(password);
    if (score < 5) { // Require all 5 criteria to be met
        let messages = [];
        if (password.length < 8) messages.push('mínimo 8 caracteres');
        if (!/[A-Z]/.test(password)) messages.push('uma letra maiúscula');
        if (!/[a-z]/.test(password)) messages.push('uma letra minúscula');
        if (!/[0-9]/.test(password)) messages.push('um número');
        if (!/[^A-Za-z0-9]/.test(password)) messages.push('um caractere especial');
        return { strong: false, message: `A senha deve conter: ${messages.join(', ')}.` };
    }
    return { strong: true, message: '' };
};

// Helper for masking
const maskCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
const maskPhone = (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
const maskCEP = (value: string) => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);

// Strict CPF Validation
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

const useObjectURL = (file?: File | Blob | string) => {
    const [url, setUrl] = useState<string | undefined>();
    useEffect(() => {
        if (!file || typeof file === 'string') { setUrl(file as string); return; };
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
                    if (option && typeof option.priceModifier === 'number') price += option.priceModifier;
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
        <li className="flex items-center gap-3 text-sm py-2 border-b dark:border-gray-700 last:border-0">
            <img src={imageUrl} alt={item.productSnapshot.name} className="w-16 h-16 object-cover rounded border dark:border-gray-600" />
            <div className="flex-grow">
                <p className="font-medium text-gray-800 dark:text-gray-200">{item.productSnapshot.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity}x R$ {finalPrice.toFixed(2).replace('.', ',')}</p>
                {selectedOptionsText && <p className="text-xs text-gray-600 dark:text-gray-400">{selectedOptionsText}</p>}
            </div>
            <p className="font-semibold text-gray-800 dark:text-gray-200">R$ {(finalPrice * item.quantity).toFixed(2).replace('.', ',')}</p>
        </li>
    );
};

// Simple Input Field (Standard placeholder style, dark mode supported)
const SimpleInputField: React.FC<{ 
    name: string; 
    label: string; 
    type?: string; 
    value: string; 
    error?: string; 
    required?: boolean; 
    readOnly?: boolean; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
}> = ({ name, label, type = "text", value, error, required = false, readOnly = false, onChange, onBlur, onFocus }) => (
    <div className="relative">
        <input 
            type={type} 
            id={name} 
            name={name} 
            value={value} 
            onChange={onChange} 
            onBlur={onBlur}
            onFocus={onFocus}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all 
                bg-gray-50 dark:bg-gray-700 
                border-gray-200 dark:border-gray-600 
                text-gray-900 dark:text-white 
                placeholder-gray-500 dark:placeholder-gray-400
                ${error ? 'border-red-500 dark:border-red-500' : ''} 
                ${readOnly ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : ''}`} 
            placeholder={label} 
            required={required} 
            readOnly={readOnly} 
        />
        {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 font-medium">{error}</p>}
    </div>
);

const OrderStatusTracker: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const steps = [
        { key: 'pending', label: 'Pendente', color: 'amber' },
        { key: 'paid', label: 'Pago', color: 'sky' },
        { key: 'shipped', label: 'Enviado', color: 'emerald' },
        { key: 'delivered', label: 'Entregue', color: 'slate' }
    ];
    if (status === 'cancelled') return <div className="flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/50 rounded-md"><p className="font-semibold text-red-700 dark:text-red-300">Pedido Cancelado</p></div>;
    const currentStepIndex = steps.findIndex(step => step.key === status);
    
    return (
        <div className="flex items-center justify-between w-full text-xs text-center px-2 pt-2">
            {steps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isLineActive = index < currentStepIndex;

                const colorClasses = {
                    amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400' },
                    sky: { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-600 dark:text-sky-400' },
                    emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                    slate: { bg: 'bg-slate-500', border: 'border-slate-500', text: 'text-slate-600 dark:text-slate-400' }
                }[step.color as 'amber' | 'sky' | 'emerald' | 'slate'] || { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-600 dark:text-gray-400' };

                const nextStepColorClass = (index + 1 < steps.length) 
                    ? ({
                        amber: 'bg-amber-500',
                        sky: 'bg-sky-500',
                        emerald: 'bg-emerald-500',
                        slate: 'bg-slate-500'
                    }[steps[index+1].color as 'amber' | 'sky' | 'emerald' | 'slate'] || 'bg-gray-200 dark:bg-gray-600')
                    : 'bg-gray-200 dark:bg-gray-600';

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center z-10 w-1/4">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${isActive ? `${colorClasses.bg} ${colorClasses.border} text-white` : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}>
                                {isActive && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <p className={`mt-1 font-medium transition-colors duration-300 text-center ${isActive ? colorClasses.text : 'text-gray-500 dark:text-gray-500'}`}>{step.label}</p>
                        </div>
                        {index < steps.length - 1 && <div className={`flex-1 h-1 -mx-2 transition-colors duration-300 ${isLineActive ? nextStepColorClass : 'bg-gray-200 dark:bg-gray-600'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm transition-colors">
        <div className="flex flex-wrap justify-between items-start mb-4 gap-2">
            <div>
                <p className="font-bold text-gray-800 dark:text-white">Pedido #{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Realizado em: {new Date(order.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-bold text-lg text-indigo-700 dark:text-indigo-400">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                {order.paymentMethod === 'credit-card' && order.installments.count > 1 && <p className="text-xs text-gray-600 dark:text-gray-400">em {order.installments.count}x de R$ {order.installments.value.toFixed(2).replace('.', ',')}</p>}
            </div>
        </div>
        <div className="mb-4"><OrderStatusTracker status={order.status} /></div>
        {(order.status === 'shipped' || order.status === 'delivered') && order.trackingCode && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                <p className="font-semibold">Rastreamento:</p>
                <div className="flex justify-between items-center gap-2">
                    <p className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{order.trackingCode}</p>
                    <a href={`https://www2.correios.com.br/sistemas/rastreamento/resultado.cfm?objetos=${order.trackingCode}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-semibold rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50">Rastrear</a>
                </div>
            </div>
        )}
        <details className="text-sm mt-4 text-gray-700 dark:text-gray-300">
            <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline">Ver detalhes do pedido</summary>
            <ul className="mt-2 divide-y bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md dark:divide-gray-700">
                {order.items.map(item => <OrderItemWithImage key={item.id} item={item} />)}
            </ul>
        </details>
    </div>
);

const PasswordCriteria: React.FC<{ password?: string }> = ({ password = '' }) => {
    const criteria = [
        { label: 'Pelo menos 8 caracteres', regex: /.{8,}/ },
        { label: 'Pelo menos uma letra maiúscula (A-Z)', regex: /[A-Z]/ },
        { label: 'Pelo menos uma letra minúscula (a-z)', regex: /[a-z]/ },
        { label: 'Pelo menos um número (0-9)', regex: /[0-9]/ },
        { label: 'Pelo menos um caractere especial (!@#$...)', regex: /[^A-Za-z0-9]/ },
    ];

    const CheckIcon: React.FC<{ isValid: boolean }> = ({ isValid }) => (
         <div className={`w-4 h-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${isValid ? 'border-green-500 bg-green-500' : 'border-gray-400 dark:border-gray-600'}`}>
            {isValid && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
        </div>
    );

    return (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <ul className="space-y-1">
                {criteria.map((item, index) => {
                    const isValid = item.regex.test(password);
                    return (
                        <li key={index} className={`flex items-center text-xs transition-colors ${isValid ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-300'}`}>
                            <CheckIcon isValid={isValid} />
                            {item.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


const LoginForm: React.FC<{ setView: (v: any) => void, onLoginSuccess?: () => void, message?: string }> = ({ setView, onLoginSuccess, message }) => {
    const { users, setCurrentUser } = useSite();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) { setCurrentUser(user); if (onLoginSuccess) onLoginSuccess(); }
        else { setError('Email ou senha inválidos.'); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400">Acessar Conta</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                {message && <p className="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 p-3 rounded-md text-sm text-center">{message}</p>}
                <SimpleInputField name="email" label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <SimpleInputField name="password" label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                <div className="text-center"><button type="submit" className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Entrar</button></div>
                <div className="text-sm text-center"><button type="button" onClick={() => setView('recover')} className="text-indigo-600 dark:text-indigo-400 hover:underline">Esqueceu a senha?</button></div>
                <div className="text-center text-sm pt-2 text-gray-600 dark:text-gray-300"><p>Não tem uma conta? <button type="button" onClick={() => setView('register')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Cadastre-se</button></p></div>
            </form>
        </div>
    );
};

const RecoverForm: React.FC<{ setView: (v: any) => void }> = ({ setView }) => {
    const { users, setUsers } = useSite();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(''); setLink(''); setError('');
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            const token = Date.now().toString(36) + Math.random().toString(36).substring(2);
            const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
            const updatedUsers = [...users];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], recoveryToken: token, recoveryTokenExpiry: expiry };
            await setUsers(updatedUsers);
            setLink(`/reset-password?token=${token}&email=${encodeURIComponent(email)}`);
            setMessage(`Simulação de e-mail: Se uma conta com este e-mail existir, um link de recuperação foi "enviado". Clique no link abaixo para redefinir sua senha (válido por 15 minutos).`);
        } else {
            // To prevent email enumeration, show a generic message.
            setMessage('Se uma conta com este e-mail existir, um link de recuperação foi "enviado".');
        }
    };
    
    return (
         <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400">Recuperar Senha</h2>
            <form onSubmit={handleRecover} className="space-y-6">
                 <p className="text-sm text-center text-gray-600 dark:text-gray-300">Insira seu e-mail para receber o link de recuperação.</p>
                <SimpleInputField name="email" label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                {message && <p className="text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 text-sm text-center p-3 rounded-md">{message}</p>}
                {link && (
                    <div className="text-center">
                        <a href={link} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline break-all">
                            {window.location.origin}{link}
                        </a>
                    </div>
                )}
                <div className="text-center"><button type="submit" className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Enviar Link</button></div>
                <div className="text-center text-sm"><button type="button" onClick={() => setView('login')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Voltar para o Login</button></div>
            </form>
        </div>
    );
};

const ResetPasswordForm: React.FC<{ onResetSuccess: (msg: string) => void }> = ({ onResetSuccess }) => {
    const { users, setUsers } = useSite();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isValidToken, setIsValidToken] = useState(false);
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        if (!token || !email) { setError('Link de recuperação inválido ou expirado.'); return; }
        
        const user = users.find(u => u.email === email);
        if (user && user.recoveryToken === token && user.recoveryTokenExpiry && user.recoveryTokenExpiry > Date.now()) {
            setIsValidToken(true);
            setMessage(`Crie uma nova senha para a conta: ${email}`);
        } else {
            setError('Link de recuperação inválido ou expirado.');
        }
    }, [users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        const passwordCheck = isPasswordStrong(password);
        if (!passwordCheck.strong) { setError(passwordCheck.message); return; }
        if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
        
        const params = new URLSearchParams(window.location.search);
        const email = params.get('email');

        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex > -1) {
            const updatedUsers = [...users];
            updatedUsers[userIndex] = { ...updatedUsers[userIndex], password, recoveryToken: null, recoveryTokenExpiry: null };
            await setUsers(updatedUsers);
            onResetSuccess('Sua senha foi redefinida com sucesso! Faça o login com a nova senha.');
        } else {
            setError('Ocorreu um erro. Usuário não encontrado.');
        }
    };

    if (!isValidToken) {
        return <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md text-center">{error}</div>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400">Redefinir Senha</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-center text-gray-600 dark:text-gray-300">{message}</p>
                <SimpleInputField name="password" label="Nova Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <PasswordCriteria password={password} />
                <SimpleInputField name="confirmPassword" label="Confirmar Nova Senha" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
                <div className="text-center"><button type="submit" className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">Salvar Nova Senha</button></div>
            </form>
        </div>
    );
};

const RegisterForm: React.FC<{ setView: (v: any) => void; onRegisterSuccess?: () => void; }> = ({ setView, onRegisterSuccess }) => {
    const { users, setUsers, setCurrentUser } = useSite();
    const [formData, setFormData] = useState({ name: '', dob: '', cpf: '', phone: '', email: '', password: '', confirmPassword: '', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', localidade: '', uf: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dobInputType, setDobInputType] = useState('text');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let maskedValue = value;
        if (name === 'cpf') maskedValue = maskCPF(value);
        if (name === 'phone') maskedValue = maskPhone(value);
        if (name === 'cep') maskedValue = maskCEP(value);
        setFormData(prev => ({ ...prev, [name]: maskedValue }));
        
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateAge = (dateString: string) => {
        if (!dateString) return null;
        const birthDate = new Date(dateString);
        const today = new Date();
        const minAgeDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
        
        // Check future date
        if (birthDate > today) return "Data não pode ser futura.";
        
        // Check age (must be at least 17)
        // Logic: If birthDate is after minAgeDate (e.g., today is 2023, minAge is 2006. If born 2007, 2007 > 2006, error)
        if (birthDate > minAgeDate) return "Você deve ter pelo menos 17 anos.";
        
        return null;
    };

    const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Name Validation (Full Name for Fraud Prevention)
        if (name === 'name' && value) {
            const parts = value.trim().split(/\s+/);
            // Allow shortened names like 'Eugenio B' or 'Eugenio B Morais'
            // Only require at least 2 parts
            if (parts.length < 2) {
                 setErrors(prev => ({ ...prev, name: 'Por favor, digite seu nome completo.' }));
            } else {
                 setErrors(prev => { const newErrors = { ...prev }; delete newErrors.name; return newErrors; });
            }
        }

        // Strict CPF Validation on Blur (Only if provided)
        if (name === 'cpf' && value) {
            if (!validateCPF(value)) {
                setErrors(prev => ({ ...prev, cpf: 'CPF inválido.' }));
            } else {
                setErrors(prev => { const newErrors = { ...prev }; delete newErrors.cpf; return newErrors; });
            }
        }
        
        // DOB Validation
        if (name === 'dob' && value) {
            const ageError = validateAge(value);
            if (ageError) {
                setErrors(prev => ({ ...prev, dob: ageError }));
            } else {
                setErrors(prev => { const newErrors = { ...prev }; delete newErrors.dob; return newErrors; });
            }
        }

        if (name === 'cep') {
            handleCepBlur();
        }
    };

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;
        setIsCepLoading(true); setErrors(prev => ({...prev, cep: ''}));
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (response.ok) {
                const data = await response.json();
                if (data.erro) { setErrors(prev => ({...prev, cep: 'CEP não encontrado.'})); }
                else { setFormData(prev => ({ ...prev, logradouro: data.logradouro, bairro: data.bairro, localidade: data.localidade, uf: data.uf })); document.getElementById('numero')?.focus(); }
            }
        } catch (error) { setErrors(prev => ({...prev, cep: 'Erro ao buscar CEP.'})); }
        finally { setIsCepLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newErrors: Record<string, string> = {};
        
        // Full Name Check
        const nameParts = formData.name.trim().split(/\s+/);
        if (nameParts.length < 2) {
            newErrors.name = 'Nome completo é obrigatório.';
        }

        // Strict CPF Check (Only if provided)
        if (formData.cpf && !validateCPF(formData.cpf)) {
            newErrors.cpf = 'CPF inválido.';
        }
        
        // Age Check
        const ageError = validateAge(formData.dob);
        if (ageError) newErrors.dob = ageError;

        if (users.some(user => user.email === formData.email)) newErrors.email = 'Este e-mail já está cadastrado.';
        if (formData.cpf && users.some(user => user.cpf === formData.cpf)) newErrors.cpf = 'Este CPF já está cadastrado.';
        
        const passwordCheck = isPasswordStrong(formData.password);
        if (!passwordCheck.strong) newErrors.password = passwordCheck.message;
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem.';
        
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); setIsSubmitting(false); return; }
        setErrors({});

        const address: Address = { cep: formData.cep, logradouro: formData.logradouro, numero: formData.numero, complemento: formData.complemento, bairro: formData.bairro, localidade: formData.localidade, uf: formData.uf };
        const newUser: User = { id: formData.email, name: formData.name, dob: formData.dob, cpf: formData.cpf, phone: formData.phone, email: formData.email, password: formData.password, address };
        try { await setUsers(prev => [...prev, newUser]); setCurrentUser(newUser); if (onRegisterSuccess) onRegisterSuccess(); }
        catch (error) { setErrors({ form: 'Ocorreu um erro ao salvar o cadastro. Tente novamente.' }); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-400">Crie sua Conta</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SimpleInputField 
                        name="name" 
                        label="Nome Completo" 
                        value={formData.name} 
                        error={errors.name} 
                        required 
                        onChange={handleChange}
                        onBlur={handleFieldBlur}
                    />
                    <SimpleInputField 
                        name="dob" 
                        label="Data de Nascimento" 
                        type={dobInputType} 
                        value={formData.dob} 
                        error={errors.dob} 
                        required 
                        onChange={handleChange}
                        onFocus={() => setDobInputType('date')}
                        onBlur={(e) => {
                            handleFieldBlur(e);
                            if (!formData.dob) setDobInputType('text');
                        }} 
                    />
                    <SimpleInputField name="cpf" label="CPF (Opcional)" value={formData.cpf} error={errors.cpf} onChange={handleChange} onBlur={handleFieldBlur} />
                    <SimpleInputField name="phone" label="Telefone" type="tel" value={formData.phone} error={errors.phone} required onChange={handleChange} />
                </div>
                <SimpleInputField name="email" label="E-mail" type="email" value={formData.email} error={errors.email} required onChange={handleChange} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2 pt-4">Crie sua Senha</h3>
                <SimpleInputField name="password" label="Senha" type="password" value={formData.password} error={errors.password} required onChange={handleChange} />
                <PasswordCriteria password={formData.password} />
                <SimpleInputField name="confirmPassword" label="Confirmar Senha" type="password" value={formData.confirmPassword} error={errors.confirmPassword} required onChange={handleChange} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2 pt-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="relative md:col-span-1"><SimpleInputField name="cep" label="CEP" value={formData.cep} error={errors.cep} required onChange={handleChange} onBlur={handleCepBlur} />{isCepLoading && <div className="absolute top-3 right-3 h-5 w-5 animate-spin rounded-full border-b-2 border-indigo-500"></div>}</div><div className="md:col-span-2"><SimpleInputField name="logradouro" label="Logradouro" value={formData.logradouro} error={errors.logradouro} required onChange={handleChange} /></div></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SimpleInputField name="numero" label="Número" value={formData.numero} error={errors.numero} required onChange={handleChange} /><div className="md:col-span-2"><SimpleInputField name="complemento" label="Complemento (Opcional)" value={formData.complemento} error={errors.complemento} onChange={handleChange} /></div></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><SimpleInputField name="bairro" label="Bairro" value={formData.bairro} error={errors.bairro} required onChange={handleChange} /><SimpleInputField name="localidade" label="Cidade" value={formData.localidade} error={errors.localidade} required onChange={handleChange} /><SimpleInputField name="uf" label="Estado (UF)" value={formData.uf} error={errors.uf} required onChange={handleChange} /></div>
                {errors.form && <p className="text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300 p-3 rounded-md">{errors.form}</p>}
                <div className="text-center pt-4"><button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">{isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}</button></div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-300"><p>Já tem uma conta? <button type="button" onClick={() => setView('login')} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Faça login</button></p></div>
            </form>
        </div>
    );
};

interface RegistrationScreenProps { onLoginSuccess?: () => void; }
type View = 'login' | 'register' | 'recover' | 'reset-password';

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onLoginSuccess }) => {
    const { currentUser, orders } = useSite();
    const [view, setView] = useState<View>('login');
    const [loginMessage, setLoginMessage] = useState('');

    useEffect(() => {
        // This effect checks if the URL is a password reset link
        const params = new URLSearchParams(window.location.search);
        if (params.has('token') && params.has('email')) {
            setView('reset-password');
        }
    }, []);

    if (currentUser) {
        const userOrders = useMemo(() => {
            const userOrdersFiltered = orders.filter(order => order.userId === currentUser.id);
            const uniqueUserOrders = [...new Map(userOrdersFiltered.map(order => [order.id, order])).values()];
            return uniqueUserOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [orders, currentUser]);
        
        const ongoingOrders = userOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
        const pastOrders = userOrders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

        return (
            <div className="p-0 sm:p-4 text-left">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 mb-8 shadow-sm border dark:border-gray-700">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-2">Meus Dados</h3>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Nome:</strong> {currentUser.name}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {currentUser.email}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Endereço:</strong> {currentUser.address.logradouro}, {currentUser.address.numero} - {currentUser.address.bairro}, {currentUser.address.localidade}/{currentUser.address.uf}</p>
                </div>
                <div className="space-y-8">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Pedidos em Andamento</h3>
                        {ongoingOrders.length > 0 ? <div className="space-y-6">{ongoingOrders.map(order => <OrderCard key={order.id} order={order} />)}</div> : <p className="text-gray-500 dark:text-gray-400 text-center py-4">Você não tem pedidos em andamento.</p>}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">Histórico de Pedidos</h3>
                        {pastOrders.length > 0 ? <div className="space-y-6">{pastOrders.map(order => <OrderCard key={order.id} order={order} />)}</div> : <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum pedido anterior encontrado.</p>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            {view === 'login' && <LoginForm setView={setView} onLoginSuccess={onLoginSuccess} message={loginMessage} />}
            {view === 'register' && <RegisterForm setView={setView} onRegisterSuccess={onLoginSuccess} />}
            {view === 'recover' && <RecoverForm setView={setView} />}
            {view === 'reset-password' && <ResetPasswordForm onResetSuccess={(msg) => { setLoginMessage(msg); setView('login'); window.history.replaceState({}, document.title, window.location.pathname); }} />}
        </div>
    );
};

export default RegistrationScreen;
