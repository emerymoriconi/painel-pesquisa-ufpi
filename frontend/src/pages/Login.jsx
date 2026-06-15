import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const { entrar } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const resultado = await entrar(username, password)
    setLoading(false)
    if (resultado.sucesso) {
      navigate('/')
    } else {
      setErro('Usuário ou senha inválidos.')
    }
  }

  return (
    <div className="min-h-screen bg-azul-escuro flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Cabeçalho do card */}
        <div className="bg-azul-escuro px-8 py-7 text-center">
          <h1 className="text-white text-xl font-bold leading-tight">
            Painel de Pesquisa e Inovação
          </h1>
          <p className="text-white/60 text-sm mt-1">UFPI</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {erro}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-azul-medio"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-azul-medio"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-azul-btn text-white rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
