import { NavLink, Route, Routes } from 'react-router-dom'
import { CourseHandicapPage } from './pages/CourseHandicapPage'
import { PostRoundPage } from './pages/PostRoundPage'
import { HistoryPage } from './pages/HistoryPage'
import { CoursesPage } from './pages/CoursesPage'

const NAV_ITEMS = [
  { to: '/', label: 'Handicap de Juego', end: true },
  { to: '/post-ronda', label: 'Post-Ronda' },
  { to: '/historial', label: 'Historial' },
  { to: '/campos', label: 'Campos' },
]

function App() {
  return (
    <div className="min-h-screen bg-fairway-950">
      <header className="border-b border-fairway-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="text-xl font-semibold text-white">AfterGolf</span>
          </div>
          <nav className="mt-4 flex gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-fairway-500 text-white'
                      : 'text-fairway-300 hover:bg-fairway-900 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/" element={<CourseHandicapPage />} />
          <Route path="/post-ronda" element={<PostRoundPage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="/campos" element={<CoursesPage />} />
        </Routes>
      </main>

      <footer className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-fairway-500">
        Cálculos basados en el World Handicap System (WHS) / RFEG. Todos los
        datos se guardan solo en tu navegador.
      </footer>
    </div>
  )
}

export default App
