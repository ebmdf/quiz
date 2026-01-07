
import React, { useState, useMemo } from 'react';
import { useSite } from '../../context/SiteContext';
import { TrashIcon, XIcon } from '../Icons';
import type { User, Order } from '../../types';

const getPasswordStrength = (password: string): { score: number; feedback: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return { score, feedback: '' };
};

const isPasswordStrong = (password: string): { strong: boolean; message: string } => {
    const { score } = getPasswordStrength(password);
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

const UserEditModal: React.FC<{
    user: User;
    allUsers: User[];
    onClose: () => void;
    onSave: (updatedUser: User, originalEmail: string) => Promise<{success: boolean; message?: string}>;
}> = ({ user, allUsers, onClose, onSave }) => {
    const [formData, setFormData] = useState(user);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setError('');
        const updatedUser = { ...formData };
        if (newPassword) {
            const passwordCheck = isPasswordStrong(newPassword);
            if (!passwordCheck.strong) {
                setError(passwordCheck.message);
                return;
            }
            updatedUser.password = newPassword;
        }

        if (updatedUser.email !== user.email && allUsers.some(u => u.email === updatedUser.email)) {
            setError('Este e-mail já está em uso por outro usuário.');
            return;
        }

        const result = await onSave(updatedUser, user.email);
        if (result.success) {
            onClose();
        } else {
            setError(result.message || 'Ocorreu um erro desconhecido.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150]" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Editar Usuário</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400"><XIcon /></button>
                    </div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border-gray-300 rounded-md shadow-sm" /></div>
                        </div>
                        <div className="pt-4 mt-4 border-t dark:border-gray-700">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Redefinir Senha (Opcional)</h4>
                            <input type="password" placeholder="Nova Senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-2 w-full border-gray-300 rounded-md shadow-sm" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 flex gap-4 justify-end rounded-b-lg border-t dark:border-gray-600">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};

const UserManager: React.FC = () => {
    const { users, setUsers, orders, setOrders } = useSite();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (userId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const handleSaveUser = async (updatedUser: User, originalEmail: string): Promise<{success: boolean; message?: string}> => {
        try {
            if (updatedUser.email !== originalEmail) {
                // Email (which is the ID) has changed
                const newId = updatedUser.email;
                if (users.some(u => u.id === newId)) {
                    return { success: false, message: 'O novo email já está em uso.' };
                }
                
                await setUsers(prev => {
                    const filtered = prev.filter(u => u.id !== originalEmail);
                    return [...filtered, { ...updatedUser, id: newId }];
                });
                await setOrders(prev => prev.map(o => o.userId === originalEmail ? { ...o, userId: newId } : o));

            } else {
                // Only data has changed, not the ID
                await setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }
            return { success: true };
        } catch (error) {
            return { success: false, message: 'Falha ao salvar. Tente novamente.' };
        }
    };

     const handleSendRecovery = async (user: User) => {
        if (!window.confirm(`Deseja gerar um link de recuperação de senha para ${user.name}?`)) return;

        const token = Date.now().toString(36) + Math.random().toString(36).substring(2);
        const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, recoveryToken: token, recoveryTokenExpiry: expiry } : u
        ));
        
        const recoveryLink = `${window.location.origin}${window.location.pathname}?token=${token}&email=${encodeURIComponent(user.email)}`;
        
        prompt(
            "Link de recuperação gerado. Copie e envie para o usuário (válido por 15 minutos):",
            recoveryLink
        );
    };

    const filteredUsers = useMemo(() => {
        const uniqueUsers = [...new Map(users.map(user => [user.id, user])).values()];
        if (!searchTerm) {
            return uniqueUsers;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return uniqueUsers.filter(user =>
            user.name.toLowerCase().includes(lowercasedFilter) ||
            user.email.toLowerCase().includes(lowercasedFilter) ||
            user.cpf.includes(searchTerm)
        );
    }, [users, searchTerm]);

    return (
        <div>
            {editingUser && <UserEditModal user={editingUser} allUsers={users} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Clientes Cadastrados ({filteredUsers.length})</h3>
                <div className="w-full sm:w-auto sm:max-w-xs">
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou CPF..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Telefone</th>
                                <th scope="col" className="px-6 py-3 relative">
                                    <span className="sr-only">Ações</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.cpf}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.phone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => setEditingUser(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
                                        <button onClick={() => handleSendRecovery(user)} className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">Recuperar Senha</button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManager;
