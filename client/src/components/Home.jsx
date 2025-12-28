import { useState, useEffect, useRef } from 'react';
import { isAdmin, isProfessor, isStudent } from '../services/auth.Service';
import Register from './Register';
import ProfessorChat from './ProfessorChat';
import StudentChat from './StudentChat';

function Home() {
  const [activeTab, setActiveTab] = useState('canvas');
  const [userAdmin, setUserAdmin] = useState(false);
  const [userProfessor, setUserProfessor] = useState(false);
  const [userStudent, setUserStudent] = useState(false);

  const [userData, setUserData] = useState({ nome: 'U', email: '' });
  const hasAlerted = useRef(false);

  const roleLabels = {
    admin: 'Administrador',
    professor: 'Professor',
    aluno: 'Aluno'
  };

  useEffect(() => {
    // 1. VERIFICAÇÃO DE SEGURANÇA: Existe utilizador no LocalStorage?
    const storedUser = localStorage.getItem('user');

    if (!storedUser && !hasAlerted.current) {
      hasAlerted.current = true; // Marcamos que já avisámos
      alert("Sessão expirada ou não autorizada. Por favor, faça login.");
      window.location.href = '/views/index.html';
      return;
    }

    // Se existir, carrega os dados
    const user = JSON.parse(storedUser);
    setUserData(user);


    setUserAdmin(isAdmin());
    setUserProfessor(isProfessor());
    setUserStudent(isStudent());


  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/views/index.html';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar - Barra Lateral */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col shadow-lg">
        <div className="p-6 text-2xl font-bold border-b border-blue-700 text-center tracking-tight">
          EduLinker
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('canvas')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'canvas' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl">🎨</span> Quadro Branco
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'files' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl">📂</span> Meus Ficheiros
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'chat' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl">💬</span> Chat / Sockets
          </button>

          {/* BOTÃO DE REGISTO - Só visível para Admin */}
          {userAdmin && (
            <button
              onClick={() => setActiveTab('register')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'register' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">👤</span> Gestão de Utilizadores
            </button>
          )}
          {/* BOTÃO DE CHAT Professor - Só visível para Professor */}
          {userStudent && (
            <button
              onClick={() => setActiveTab('studentchat')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'register' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">🙋‍♂️</span> Dúvidas
            </button>
          )}
          {/* BOTÃO DE Chat Aluno - Só visível para Aluno */}
          {userProfessor && (
            <button
              onClick={() => setActiveTab('professorchat')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'register' ? 'bg-orange-500 shadow-md' : 'hover:bg-orange-600 text-orange-100'}`}
            >
              <span className="mr-3 text-xl">🙋‍♂️</span> Responder a Dúvidas de Alunos
            </button>
          )}

        </nav>

        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-300 hover:text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
          >
            <span className="mr-3 text-xl">🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* Main Content - Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md p-4 flex justify-between items-center px-8 z-10">
          <h1 className="text-xl font-bold text-gray-800 capitalize flex items-center">
            <span className="mr-2 text-blue-600">|</span>
            {activeTab === 'canvas' && 'Quadro Interativo'}
            {activeTab === 'files' && 'Gestor de Ficheiros'}
            {activeTab === 'chat' && 'Comunicação em Tempo Real'}
            {activeTab === 'register' && 'Registo de Novo Utilizador'}
            {activeTab === 'studentchat' && 'As minhas Duvidas'}
            {activeTab === 'professorchat' && 'Gestão de dúvidas em tempo real.'}
          </h1>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">{userData.nome}</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                  userAdmin ? 'bg-red-100 text-red-700' : 
                  userProfessor ? 'bg-green-100 text-green-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {roleLabels[userData.role] || 'Utilizador'}
                </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white">
              {userData.nome.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Área de Conteúdo Dinâmico */}
        <section className="flex-1 p-8 overflow-auto bg-gray-50">

          {/* Aba: Canvas */}
          {activeTab === 'canvas' && (
            <div className="w-full h-full bg-white rounded-2xl shadow-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative group hover:border-blue-300 transition-colors">
              <div className="text-center">
                <div className="text-6xl mb-4">✍️</div>
                <p className="text-gray-500 text-xl font-medium mb-6">Área do Canvas API Pronta</p>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all duration-200">
                  Iniciar Novo Desenho
                </button>
              </div>
            </div>
          )}

          {/* Aba: Files */}
          {activeTab === 'files' && (
            <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload de Ficheiros</h2>
              <div className="border-4 border-dashed border-blue-50 rounded-2xl p-16 text-center hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="text-5xl mb-4 group-hover:bounce animate-bounce">☁️</div>
                <p className="text-gray-600 font-medium text-lg">Arraste ficheiros para aqui ou clique para selecionar</p>
              </div>
            </div>
          )}

          {/* Aba: Chat */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                <div className="bg-blue-100 text-blue-700 p-4 rounded-xl rounded-tl-none max-w-xs shadow-sm">
                  Olá! Bem-vindo ao chat.
                </div>
              </div>
              <div className="p-4 bg-white border-t border-gray-100 flex space-x-3">
                <input type="text" className="flex-1 border border-gray-200 p-3 rounded-xl outline-none" placeholder="Mensagem..." />
                <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">Enviar</button>
              </div>
            </div>
          )}

          {/* Aba: REGISTO (Só para Admin) */}
          {activeTab === 'register' && userAdmin && (
           
              <Register />
           
          )}

           {/* Aba: para responder a duvidas dos alunos (Só para Professor)*/}
          {activeTab === 'professorchat' && userProfessor && (
            
              <ProfessorChat />
            
          )}

           {/* Aba: para fazer perguntas asos professores (Só para Alunos)*/}
          {activeTab === 'studentchat' && userStudent && (
           
              <StudentChat />
           
          )}

        </section>
      </main>
    </div>
  );
}

export default Home;