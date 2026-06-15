import { createContext, useContext, useState } from 'react'
import { login as apiLogin } from '../api/index.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  async function entrar(username, password) {
    try {
      const data = await apiLogin(username, password)
      const novoToken = data.access_token
      localStorage.setItem('token', novoToken)
      setToken(novoToken)
      return { sucesso: true }
    } catch (err) {
      const mensagem =
        err.response?.data?.detail ?? 'Erro ao conectar com o servidor.'
      return { sucesso: false, erro: mensagem }
    }
  }

  function sair() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
