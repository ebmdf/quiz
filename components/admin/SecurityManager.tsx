import React, { useState } from 'react';
import { useSite } from '../../context/SiteContext';

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
         <div className={`w-4 h-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center border-2 transition-all ${isValid ? 'border-green-500 bg-green-500' : 'border-gray-400 dark:border-gray-600'}`}>
            {isValid && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
        </div>
    );

    return (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md transition-colors">
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

interface SecurityManagerProps {
    onLogout: () => void;
}

const SecurityManager: React.FC<SecurityManagerProps> = ({ onLogout }) => {
    const { siteConfig, setSiteConfig } = useSite();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newEmail, setNewEmail] = useState(siteConfig.adminCredentials.email);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (currentPassword !== siteConfig.adminCredentials.password) {
            setError('Senha atual incorreta.');
            return;
        }

        const updates: { email?: string; password?: string } = {};

        if (newEmail.trim() && newEmail !== siteConfig.adminCredentials.email) {
            if (!newEmail.includes('@')) {
                setError('Novo e-mail inválido.');
                return;
            }
            updates.email = newEmail.trim();
        }

        if (newPassword) {
             const passwordCheck = isPasswordStrong(newPassword);
            if (!passwordCheck.strong) {
                setError(passwordCheck.message);
                return;
            }
            if (newPassword !== confirmPassword) {
                setError('As novas senhas não coincidem.');
                return;
            }
            updates.password = newPassword;
        }
        
        if (Object.keys(updates).length === 0) {
            setError('Nenhuma alteração foi feita.');
            return;
        }
        
        setSiteConfig(prev => ({
            ...prev,
            adminCredentials: {
                ...prev.adminCredentials,
                ...updates
            }
        }));
        
        setSuccess('Credenciais atualizadas com sucesso! Você será desconectado em 3 segundos para fazer login novamente.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
            onLogout();
        }, 3000);
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Segurança do Painel Admin</h3>
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700 space-y-6 max-w-lg">
                {error && <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-600 text-red-700 dark:text-red-200 p-4" role="alert"><p>{error}</p></div>}
                {success && <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 dark:border-green-600 text-green-700 dark:text-green-200 p-4" role="alert"><p>{success}</p></div>}

                <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail do Administrador</label>
                    <input type="email" id="newEmail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required />
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                    <label htmlFor="newPassword"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha (deixe em branco para não alterar)</label>
                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" />
                </div>
                
                {newPassword && (
                    <>
                        <PasswordCriteria password={newPassword} />
                        <div>
                            <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
                            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required={!!newPassword} />
                        </div>
                    </>
                )}

                <div className="border-t dark:border-gray-700 pt-4">
                    <label htmlFor="currentPassword"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha Atual</label>
                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white" required />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Para salvar qualquer alteração, você deve confirmar sua senha atual.</p>
                </div>
                
                <div className="text-right">
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors">Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
};

export default SecurityManager;