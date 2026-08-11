import { Link, Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { AntesDeJugarPage } from './pages/AntesDeJugarPage'
import { DespuesDeJugarPage } from './pages/DespuesDeJugarPage'
import { HistoryPage } from './pages/HistoryPage'
import { ShopPage } from './pages/ShopPage'
import { AdminPage } from './pages/AdminPage'
import { FederatedHandicapPage } from './pages/FederatedHandicapPage'
import { ContactPage } from './pages/ContactPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 md:flex-row">
      <Sidebar />

      <div className="flex-1 pb-16 md:pb-0">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/antes-de-jugar" element={<AntesDeJugarPage />} />
            <Route path="/despues-de-jugar" element={<DespuesDeJugarPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/handicap-federado" element={<FederatedHandicapPage />} />
            <Route path="/contacto" element={<ContactPage />} />
          </Routes>
        </main>

        <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-fairway-500">
          Cálculos basados en el World Handicap System (WHS) / RFEG. Todos los
          datos se guardan solo en tu navegador. ·{' '}
          <Link to="/contacto" className="underline-offset-2 hover:underline">
            Contacto
          </Link>
        </footer>
      </div>
    </div>
  )
}

export default App
