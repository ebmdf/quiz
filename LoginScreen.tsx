import React, { useState, useEffect } from 'react';
import { XIcon } from './Icons';
import { useSite } from '../context/SiteContext';

const isPasswordStrong = (password: string): { strong: boolean; message: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 5) {
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

const PasswordCriteria: React.FC<{ password?: string }> = ({ password = '' }) => {
    const criteria = [
        { label: 'Pelo menos 8 caracteres', regex: /.{8,}/ },
        { label: 'Pelo menos uma letra maiúscula (A-Z)', regex: /[A-Z]/ },
        { label: 'Pelo menos uma letra minúscula (a-z)', regex: /[a-z]/ },
        { label: 'Pelo menos um número (0-9)', regex: /[0-9]/ },
        { label: 'Pelo menos um caractere especial (!@#$...)', regex: /[^A-Za-z0-9]/ },
    ];

    const CheckIcon: React.FC<{ isValid: boolean }> = ({ isValid }) => (
         <div className={`w-4 h-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${isValid ? 'border-green-500 bg-green-500' : 'border-gray-400'}`}>
            {isValid && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
        </div>
    );

    return (
        <div className="p-3 bg-gray-100 rounded-md">
            <ul className="space-y-1">
                {criteria.map((item, index) => {
                    const isValid = item.regex.test(password);
                    return (
                        <li key={index} className={`flex items-center text-xs transition-colors ${isValid ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            <CheckIcon isValid={isValid} />
                            {item.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

interface LoginScreenProps {
    onLoginSuccess: () => void;
    onClose: () => void;
    initialView?: 'login' | 'recover' | 'reset';
    emailToReset?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onClose, initialView, emailToReset: emailFromProp }) => {
    const { siteConfig, setSiteConfig } = useSite();
    const [view, setView] = useState<'login' | 'recover' | 'reset'>(initialView || 'login');

    const [email, setEmail] = useState(siteConfig.adminCredentials.email || '');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emailToReset, setEmailToReset] = useState(emailFromProp || '');

    useEffect(() => {
        if (initialView) setView(initialView);
        if (emailFromProp) setEmailToReset(emailFromProp);
    }, [initialView, emailFromProp]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const { adminCredentials } = siteConfig;
        if (email === adminCredentials.email && password === adminCredentials.password) {
            onLoginSuccess();
        } else {
            setError('Credenciais inválidas. Tente novamente.');
        }
    };
    
    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (email === siteConfig.adminCredentials.email) {
            const token = Date.now().toString(36) + Math.random().toString(36).substring(2);
            const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

            await setSiteConfig(prev => ({
                ...prev,
                adminCredentials: {
                    ...prev.adminCredentials,
                    recoveryToken: token,
                    recoveryTokenExpiry: expiry,
                }
            }));
            
            setSuccess(`Simulação de envio de e-mail: Um link de recuperação foi gerado. Para prosseguir, copie e cole o link abaixo em seu navegador. O link é válido por 15 minutos.`);
        } else {
            // To prevent email enumeration, show a generic success message anyway.
            setSuccess('Se uma conta com este e-mail existir, um link de recuperação foi "enviado".');
        }
    };
    
    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const passwordCheck = isPasswordStrong(newPassword);
        if (!passwordCheck.strong) {
            setError(passwordCheck.message);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }

        setSiteConfig(prev => ({
            ...prev,
            adminCredentials: {
                ...prev.adminCredentials,
                password: newPassword,
                recoveryToken: null,
                recoveryTokenExpiry: null,
            }
        }));
        
        setSuccess('Senha redefinida com sucesso! Você já pode fazer login com a nova senha.');
        setView('login');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const renderContent = () => {
        switch(view) {
            case 'recover': {
                const recoveryLink = siteConfig.adminCredentials.recoveryToken 
                    ? `${window.location.origin}${window.location.pathname}?admin_token=${siteConfig.adminCredentials.recoveryToken}&admin_email=${encodeURIComponent(email)}`
                    : '';
                return (
                    <form onSubmit={handleRecover} className="space-y-6">
                        {success ? (
                            <div className="space-y-4 text-center">
                                <div className="text-green-700 bg-green-100 px-4 py-3 rounded text-sm" role="alert">{success}</div>
                                {siteConfig.adminCredentials.recoveryToken && recoveryLink && (
                                     <div>
                                        <label className="text-sm font-medium text-gray-700 block text-left mb-1">Link de Recuperação:</label>
                                        <input type="text" readOnly value={recoveryLink} className="w-full bg-gray-200 border border-gray-300 p-2 rounded text-xs" onFocus={(e) => e.target.select()}/>
                                    </div>
                                )}
                                 <div className="text-center text-sm"><button type="button" onClick={() => { setView('login'); setSuccess(''); setError(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">Voltar para o Login</button></div>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 text-center">Insira o e-mail de administrador para iniciar a recuperação.</p>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm" />
                                </div>
                                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Verificar E-mail</button>
                                </div>
                                <div className="text-center text-sm"><button type="button" onClick={() => setView('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Voltar para o Login</button></div>
                            </>
                        )}
                    </form>
                );
            }
            case 'reset':
                return (
                    <form onSubmit={handleReset} className="space-y-6">
                         <p className="text-sm text-gray-600 text-center">Crie uma nova senha para <strong className="text-gray-800">{emailToReset}</strong>.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm" />
                        </div>
                        <PasswordCriteria password={newPassword} />
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Redefinir Senha</button>
                        </div>
                    </form>
                );
            case 'login':
            default:
                return (
                     <form onSubmit={handleLogin} className="space-y-6">
                        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center" role="alert">{success}</div>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">Senha</label>
                            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm" />
                        </div>
                        <div className="text-sm text-right"><button type="button" onClick={() => { setView('recover'); setError(''); setSuccess(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">Esqueceu a senha?</button></div>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Entrar</button>
                        </div>
                    </form>
                );
        }
    };
    
    const titles = {
        login: 'Login - Painel Admin',
        recover: 'Recuperar Senha',
        reset: 'Redefinir Senha'
    }

    return (
        <div className="admin-overlay" onClick={onClose}>
            <div 
                className="admin-panel bg-gray-100 rounded-lg shadow-2xl flex flex-col overflow-hidden max-w-md !h-auto" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 bg-white border-b flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">{titles[view]}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <XIcon className="h-5 w-5 text-gray-600" />
                    </button>
                </header>
                <main className="p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default LoginScreen;
