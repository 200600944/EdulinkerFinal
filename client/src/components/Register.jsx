import { useState, useEffect, useRef } from 'react';
import { useRegister } from '../hooks/useRegister';
import { authService } from '../services/auth.Service';

function Register() {
    const {
        roles, setRoles,        
        loading, setLoading,    
        authorized, setAuthorized, 
        status, setStatus,      
        formData, setFormData,
        submitting, handleSubmit
    } = useRegister();

    const hasAlerted = useRef(false);

   //Validação de acesso a pagina
    useEffect(() => {
        authService.initializePage({
            checkFunc: authService.isAdmin,
            hasAlertedRef: hasAlerted,
            setAuthorized,
            setRoles,
            setStatus,
            setLoading
        });
    }, [setAuthorized, setRoles, setStatus, setLoading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!authorized) return null;


    return (
        <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative group hover:border-blue-300 transition-colors">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Painel de Registo</h2>

                {status.message && (
                    <div className={`mb-6 p-3 rounded-lg text-sm font-medium border animate-bounce-short ${status.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <div className="flex items-center">
                            <span className="mr-2">{status.type === 'success' ? '✅' : '⚠️'}</span>
                            {status.message}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div>
                        <label className="text-sm font-semibold text-gray-600">Nome</label>
                        <input
                            type="text"
                            onInvalid={(e) => e.target.setCustomValidity('Por favor, introduza um nome válido.')}
                            onInput={(e) => e.target.setCustomValidity('')}
                            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}

                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600">Email</label>
                        <input
                            type="email"
                            className="w-full p-3 border rounded-xl bg-white text-black outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-600">Password</label>
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
                        <label className="text-sm font-semibold text-gray-600">Tipo de Perfil (Role)</label>
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
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg mt-2"
                    >
                        {submitting ? 'A criar...' : 'Criar Utilizador'}
                    </button>
                </form>

                <button
                    onClick={() => window.location.href = '/views/main.html'}
                    className="w-full mt-4 text-gray-400 text-sm hover:text-blue-600 transition-colors"
                >
                    Voltar
                </button>
            </div>
        </div>
    );
}

export default Register;