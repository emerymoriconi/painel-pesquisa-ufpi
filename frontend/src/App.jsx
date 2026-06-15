import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import ProjetosPDI from './pages/ProjetosPDI'
import ProjetosFinep from './pages/ProjetosFinep'
import ProducaoIntelectual from './pages/ProducaoIntelectual'
import Bolsistas from './pages/Bolsistas'
import NucleosPesquisa from './pages/NucleosPesquisa'
import GruposPesquisa from './pages/GruposPesquisa'
import EmpresasIncubadas from './pages/EmpresasIncubadas'
import PosGraduacao from './pages/PosGraduacao'
import Laboratorios from './pages/Laboratorios'

function RotaProtegida({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RotaProtegida>
              <Layout />
            </RotaProtegida>
          }
        >
          <Route index element={<Home />} />
          <Route path="projetos-pdi" element={<ProjetosPDI />} />
          <Route path="projetos-finep" element={<ProjetosFinep />} />
          <Route path="producao-intelectual" element={<ProducaoIntelectual />} />
          <Route path="bolsistas" element={<Bolsistas />} />
          <Route path="nucleos" element={<NucleosPesquisa />} />
          <Route path="grupos" element={<GruposPesquisa />} />
          <Route path="incubadas" element={<EmpresasIncubadas />} />
          <Route path="pos-graduacao" element={<PosGraduacao />} />
          <Route path="laboratorios" element={<Laboratorios />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
