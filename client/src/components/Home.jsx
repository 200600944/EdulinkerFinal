import { useState, useEffect, useRef } from 'react';
import { isAdmin, isProfessor, isStudent } from '../services/auth.Service';
import Register from './Register';
import ProfessorChat from './ProfessorChat';
import StudentChat from './StudentChat';
import Lobby from './Loby';
import FileManager from './FileManager';

function Home() {
  // Estados para controlo de navegação e permissões de acesso
  const [activeTab, setActiveTab] = useState('welcome');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isProfessorUser, setIsProfessorUser] = useState(false);
  const [isStudentUser, setIsStudentUser] = useState(false);

  // Armazenamento dos dados do utilizador logado
  const [userData, setUserData] = useState({ nome: 'U', email: '', role: '' });
  const hasAlerted = useRef(false);

  // Mapeamento de etiquetas para exibição visual dos cargos
  const roleLabels = {
    admin: 'Administrador',
    professor: 'Professor',
    aluno: 'Aluno'
  };

  useEffect(() => {
    // Verificação de segurança para detetar fecho de aba ou expiração de sessão
    const lastExit = localStorage.getItem('last_exit_time');
    const now = Date.now();
    const storedUser = localStorage.getItem('user');

    // Se o utilizador saiu há mais de 2 segundos, limpamos a sessão (evita persistência indevida)
    if (lastExit) {
      const timePassed = now - parseInt(lastExit);
      if (timePassed > 2000) {
        localStorage.clear();
        window.location.href = '/views/index.html';
        return;
      }
    }

    // Redireciona para o login caso não existam dados de utilizador no storage
    if (!storedUser && !hasAlerted.current) {
      hasAlerted.current = true;
      alert("Sessão expirada. Por favor, faça login.");
      window.location.href = '/views/index.html';
      return;
    }

    // Carregamento dos dados do utilizador e definição das permissões de interface
    const user = JSON.parse(storedUser);
    setUserData(user);
    setIsAdminUser(isAdmin());
    setIsProfessorUser(isProfessor());
    setIsStudentUser(isStudent());

    // Regista o momento exato em que o utilizador sai ou refresca a página
    const handleUnload = () => {
      if (localStorage.getItem('user')) {
        localStorage.setItem('last_exit_time', Date.now().toString());
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  // Limpa o armazenamento local e redireciona para a página de login
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/views/index.html';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* Sidebar: Menu de navegação lateral com permissões dinâmicas */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold border-b border-blue-700 text-center tracking-tight">
          EduLinker
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* Botão padrão de boas-vindas */}
          <button
            onClick={() => setActiveTab('welcome')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'welcome' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl">🏠</span> Bem Vindo
          </button>

          {/* Acesso a salas e ficheiros para Professores e Alunos */}
          {(isProfessorUser || isStudentUser) && (
            <>
              <button
                onClick={() => setActiveTab('lobby')}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'lobby' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
              >
                <span className="mr-3 text-xl">🏫</span> Salas de aula
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'files' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
              >
                <span className="mr-3 text-xl">📂</span> Gestão de Ficheiros
              </button>
            </>
          )}

          {/* Gestão de utilizadores restrita a administradores */}
          {isAdminUser && (
            <button
              onClick={() => setActiveTab('register')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'register' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">👤</span> Gestão de Utilizadores
            </button>
          )}

          {/* Interface de chat específica para Alunos */}
          {isStudentUser && (
            <button
              onClick={() => setActiveTab('studentChat')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'studentChat' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">🙋‍♂️</span> Dúvidas
            </button>
          )}

          {/* Interface de chat específica para Professores */}
          {isProfessorUser && (
            <button
              onClick={() => setActiveTab('professorChat')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'professorChat' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">🙋‍♂️</span> Responder a Dúvidas
            </button>
          )}
        </nav>

        {/* Botão de saída no rodapé da sidebar */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-300 hover:text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <span className="mr-3 text-xl">🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Main Content: Cabeçalho e Área de Exibição Dinâmica */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header: Indica a localização atual e dados do perfil */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center px-8 z-10">
          <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center">
            <span className="mr-2 text-blue-600">|</span>
            {activeTab === 'welcome' && 'Bem vindo'}
            {activeTab === 'lobby' && 'Salas de Aula'}
            {activeTab === 'files' && 'Gestão de Ficheiros'}
            {activeTab === 'register' && 'Registo de Novo Utilizador'}
            {activeTab === 'studentChat' && 'As minhas Duvidas'}
            {activeTab === 'professorChat' && 'Responder a Dúvidas'}
          </h1>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">{userData.nome}</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                isAdminUser ? 'bg-red-100 text-red-700' :
                isProfessorUser ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {roleLabels[userData.role] || 'Utilizador'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">
              {userData.nome.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Área de Conteúdo: Renderiza o componente correspondente à tab ativa */}
        <section className="flex-1 p-8 overflow-auto bg-gray-50">

          {/* Conteúdo da aba Bem-Vindo */}
          {activeTab === 'welcome' && (
            <div className="w-full h-fit flex flex-col gap-6 animate-in fade-in duration-700">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-black mb-2">Olá, {userData.nome}! 👋</h2>
                <p className="text-blue-100 text-lg">
                  Bem-vindo ao EduLinker. Estás ligado como <span className="font-bold underline">{roleLabels[userData.role]}</span>.
                </p>
              </div>

                 {/* Grelha de Informações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Info 1: Salas */}
                {(isProfessorUser || isStudentUser) && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">🏫</div>
                    <h3 className="font-bold text-gray-800 mb-1">Salas de Aula</h3>
                    <p className="text-sm text-gray-500">Acede ao átrio para entrar em sessões ao vivo ou criar a tua própria aula.</p>
                  </div>
                )}

                {/* Info 2: Ficheiros */}
                {(isProfessorUser || isStudentUser) && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">📂</div>
                    <h3 className="font-bold text-gray-800 mb-1">Gestão de Ficheiros da Aula</h3>
                    <p className="text-sm text-gray-500">Gere os teus ficheiros e materiais de apoio na aba de documentos.</p>
                  </div>
                )}

                {/* Info 3: Dúvidas doa Alunos*/}
                {isStudentUser && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">🙋‍♂️</div>
                    <h3 className="font-bold text-gray-800 mb-1">As minhas Duvidas</h3>
                    <p className="text-sm text-gray-500">Utiliza o chat em tempo real para tirar dúvidas com professores.</p>
                  </div>
                )}

                {/* Info 4: Responder a Dúvidas dos Alunos */}
                {isProfessorUser && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">🙋‍♂️</div>
                    <h3 className="font-bold text-gray-800 mb-1">Gestão de dúvidas em tempo real.</h3>
                    <p className="text-sm text-gray-500">Utiliza o chat em tempo real para Responder a duvidas dos alunos.</p>
                  </div>
                )}

                {/* Info 5: Registar Utilizadores */}
                {isAdminUser && (
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="text-3xl mb-3">👤</div>
                    <h3 className="font-bold text-gray-800 mb-1">Registo de Novo Utilizador</h3>
                    <p className="text-sm text-gray-500">Registar um novo utilizxador no sistema.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Renderização condicional dos componentes de negócio */}
          {activeTab === 'lobby' && (isProfessorUser || isStudentUser) && <Lobby />}
          {activeTab === 'files' && <FileManager />}
          {activeTab === 'register' && isAdminUser && <Register />}
          {activeTab === 'professorChat' && isProfessorUser && <ProfessorChat />}
          {activeTab === 'studentChat' && isStudentUser && <StudentChat />}

        </section>
      </main>
    </div>
  );
}

export default Home;