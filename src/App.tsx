import { Link, Route, Routes } from 'react-router-dom'
import { PasswordRecoveryGate } from './components/PasswordRecoveryGate'
import { PageViewTracker } from './components/PageViewTracker'
import { Sidebar } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { AntesDeJugarPage } from './pages/AntesDeJugarPage'
import { DespuesDeJugarPage } from './pages/DespuesDeJugarPage'
import { HistoryPage } from './pages/HistoryPage'
import { ShopPage } from './pages/ShopPage'
import { AdminPage } from './pages/AdminPage'
import { FederatedHandicapPage } from './pages/FederatedHandicapPage'
import { ContactPage } from './pages/ContactPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 md:flex-row">
      <PasswordRecoveryGate />
      <PageViewTracker />
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
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/privacidad" element={<PrivacyPage />} />
          </Routes>
        </main>

        <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-fairway-500">
          Cálculos basados en el World Handicap System (WHS) / RFEG. ·{' '}
          <Link to="/contacto" className="underline-offset-2 hover:underline">
            Contacto
          </Link>{' '}
          ·{' '}
          <Link to="/terminos" className="underline-offset-2 hover:underline">
            Términos y condiciones
          </Link>{' '}
          ·{' '}
          <Link to="/privacidad" className="underline-offset-2 hover:underline">
            Privacidad
          </Link>
        </footer>
      </div>
    </div>
  )
}

export default App
