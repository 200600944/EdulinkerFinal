import { useRef, useEffect } from 'react';
import { useRegister } from '../hooks/useRegister';
import { authService } from '../services/auth.Service';

function Register() {
    const {
        roles, setRoles,
        loading, setLoading,
        authorized, setAuthorized,
        status, setStatus,
        formData, setFormData,
        submitting, handleSubmit,
        users,      
        loadUsers   
    } = useRegister();

    const hasAlerted = useRef(false);

    // Inicialização da página e validação de permissões administrativas
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isAdmin,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setRoles,
            setStatus,
            setLoading
        });
        
        loadUsers();
    }, [setAuthorized, setRoles, setStatus, setLoading]); 

    // Renderização do estado de carregamento
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Bloqueia a renderização se o utilizador não for administrador
    if (!authorized) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* SECÇÃO: Formulário de Criação de Utilizador */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Novo Utilizador</h2>

                    {/* Feedback de Status: Sucesso ou Erro */}
                    {status.message && (
                        <div className={`mb-6 p-3 rounded-lg text-sm font-medium border animate-pulse ${
                            status.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-700' 
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                            <label className="text-sm font-semibold text-gray-600">Nome Completo</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">Endereço de Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border rounded-xl bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">Palavra-passe</label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                minLength={6}
                                onInvalid={(e) => e.target.setCustomValidity('A password tem de ter pelo menos 6 caracteres')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-600">Perfil de Acesso (Role)</label>
                            <select
                                className="w-full p-3 border rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.role_id}
                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            >
                                <option value="">Selecione o cargo...</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            disabled={submitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg mt-2 active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'A processar...' : 'Criar Utilizador'}
                        </button>
                    </form>
                </div>
            </div>

            {/* SECÇÃO: Gestão de Utilizadores Registados */}
            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Utilizadores na Plataforma</h2>
                    </div>

                    {/* Grelha de Utilizadores: Lista todos os registos atuais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map((userItem) => (
                            <div key={userItem.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50 flex items-center gap-4">
                                {/* Avatar Dinâmico baseado na Role */}
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                                    userItem.role?.name?.toLowerCase() === 'admin' ? 'bg-red-500' : 'bg-blue-500'
                                }`}>
                                    {userItem.nome.charAt(0).toUpperCase()}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{userItem.nome}</p>
                                    <p className="text-xs text-gray-500 truncate">{userItem.email}</p>
                                    <span className={`text-[10px] font-black uppercase mt-1 block ${
                                        userItem.role?.name?.toLowerCase() === 'admin' ? 'text-red-600' : 'text-blue-600'
                                    }`}>
                                        {userItem.role?.name || 'Sem cargo'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;