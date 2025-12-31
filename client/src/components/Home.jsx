import { useState, useEffect, useRef } from 'react';
import { isAdmin, isProfessor, isStudent } from '../services/auth.Service';
import Register from './Register';
import ProfessorChat from './ProfessorChat';
import StudentChat from './StudentChat';
import Lobby from './Loby';
import FileManager from './FileManager';

function Home() {
  const [activeTab, setActiveTab] = useState('welcome');
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
            onClick={() => setActiveTab('welcome')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'welcome' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl"></span> Bem Vindo
          </button>

          {/* BOTÃO DE Loby - Só visível para Alunos e Professores */}
          {(userProfessor || userStudent) && (
            <button
              onClick={() => setActiveTab('loby')}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'loby' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
            >
              <span className="mr-3 text-xl">🏫</span> Salas de aula
            </button>
          )}

          {/* BOTÃO DE Ficheiros - Só visível para Alunos e Professores */}
          {(userProfessor || userStudent) && (
          <button
            onClick={() => setActiveTab('shared_file')}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 ${activeTab === 'files' ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-700'}`}
          >
            <span className="mr-3 text-xl">📂</span> Gestão de Ficheiros da Aula
          </button>
          )}

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
            {activeTab === 'welcome' && 'Bem vindo'}
            {activeTab === 'loby' && 'Salas de Aula'}
            {activeTab === 'canvas' && 'Quadro Interativo'}
            {activeTab === 'shared_file' && 'Gestão de Ficheiros da Aula'}
            {activeTab === 'chat' && 'Comunicação em Tempo Real'}
            {activeTab === 'register' && 'Registo de Novo Utilizador'}
            {activeTab === 'studentchat' && 'As minhas Duvidas'}
            {activeTab === 'professorchat' && 'Gestão de dúvidas em tempo real.'}
          </h1>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-700">{userData.nome}</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${userAdmin ? 'bg-red-100 text-red-700' :
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

          {/* Aba: Bem Vindo */}
          {activeTab === 'welcome' && (
            <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-700">

              {/* Card Principal de Boas-Vindas */}
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-lg">
                <h2 className="text-3xl font-black mb-2">Olá, {userData.nome}! 👋</h2>
                <p className="text-blue-100 text-lg">
                  Bem-vindo ao EduLinker. Estás ligado como <span className="font-bold underline">{roleLabels[userData.role]}</span>.
                </p>
              </div>

              {/* Grelha de Informações Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Info 1: Salas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">🏫</div>
                  <h3 className="font-bold text-gray-800 mb-1">Salas de Aula</h3>
                  <p className="text-sm text-gray-500">Acede ao átrio para entrar em sessões ao vivo ou criar a tua própria aula.</p>
                </div>

                {/* Info 2: Dúvidas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">💬</div>
                  <h3 className="font-bold text-gray-800 mb-1">Comunicação</h3>
                  <p className="text-sm text-gray-500">Utiliza o chat em tempo real para tirar dúvidas com professores e colegas.</p>
                </div>

                {/* Info 3: Ficheiros */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="text-3xl mb-3">📂</div>
                  <h3 className="font-bold text-gray-800 mb-1">Recursos</h3>
                  <p className="text-sm text-gray-500">Gere os teus ficheiros e materiais de apoio na aba de documentos.</p>
                </div>

              </div>


            </div>
          )}
          {/* Aba: Loby */}
          {activeTab === 'loby' && (userProfessor || userStudent) && (
            <Lobby />
          )}

          {/* Aba: Files */}
          {activeTab === 'shared_file' && (
           <FileManager/>
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