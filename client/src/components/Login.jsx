import { useLogin } from '../hooks/useLogin';

function Login() {
  const { email, setEmail, password, setPassword, status, loading, handleLogin } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center transition-all"
      style={{ backgroundImage: "url('/placeholder-image.jpg')" }}>

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-blue-600">EduLinker</h2>
          <p className="text-gray-500 mt-2">Aceda à sua área de aprendizagem</p>
        </div>

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

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="email@exemplo.com"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              minLength={6}
              placeholder="password"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

         <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verificando...
              </span>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;