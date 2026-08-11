import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { HomePage } from './pages/HomePage'
import { CourseHandicapPage } from './pages/CourseHandicapPage'
import { PostRoundPage } from './pages/PostRoundPage'
import { HistoryPage } from './pages/HistoryPage'
import { CoursesPage } from './pages/CoursesPage'
import { ShopPage } from './pages/ShopPage'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-50 md:flex-row">
      <Sidebar />

      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/handicap-de-juego" element={<CourseHandicapPage />} />
            <Route path="/post-ronda" element={<PostRoundPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            <Route path="/campos" element={<CoursesPage />} />
            <Route path="/shop" element={<ShopPage />} />
          </Routes>
        </main>

        <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-fairway-500">
          Cálculos basados en el World Handicap System (WHS) / RFEG. Todos los
          datos se guardan solo en tu navegador.
        </footer>
      </div>
    </div>
  )
}

export default App
