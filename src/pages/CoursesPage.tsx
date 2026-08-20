import { useEffect, useMemo, useState } from 'react'
import { TEE_LABEL } from '../components/CourseTeeSelect'
import type { CourseRound, CourseTee, GolfCourse, TeeColor, TeeGender } from '../data/courses'
import {
  addCourse,
  addRecorrido,
  addTee,
  deleteCourse,
  deleteRecorrido,
  deleteTee,
  importGolfCourse,
  loadCourses,
  updateCourse,
  updateRecorrido,
  updateTee,
} from '../lib/courseStore'
import {
  getGolfCourse,
  searchGolfCourses,
  type GolfCourseApiSearchResult,
} from '../lib/golfCourseApi'

const TEE_COLORS: TeeColor[] = ['blanco', 'amarillo', 'azul', 'rojo', 'negro', 'naranja']
const TEE_GENDERS: TeeGender[] = ['hombres', 'mujeres', 'mixto']
const BLANK_TEE: CourseTee = { color: 'amarillo', gender: 'hombres', cr: 70, slope: 125, par: 72 }

function TeeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: CourseTee
  onSave: (tee: CourseTee) => void
  onCancel: () => void
}) {
  const [color, setColor] = useState<TeeColor>(initial.color)
  const [gender, setGender] = useState<TeeGender>(initial.gender)
  const [crInput, setCrInput] = useState(String(initial.cr))
  const [slopeInput, setSlopeInput] = useState(String(initial.slope))
  const [parInput, setParInput] = useState(String(initial.par))

  function handleSave() {
    onSave({
      color,
      gender,
      cr: Number(crInput) || 0,
      slope: Number(slopeInput) || 0,
      par: Number(parInput) || 0,
    })
  }

  return (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-fairway-300 bg-cream-50 p-3 sm:grid-cols-5">
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Color</label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value as TeeColor)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        >
          {TEE_COLORS.map((c) => (
            <option key={c} value={c}>
              {TEE_LABEL[c]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Género</label>
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value as TeeGender)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        >
          {TEE_GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">CR</label>
        <input
          type="number"
          step="0.1"
          value={crInput}
          onChange={(e) => setCrInput(e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Slope</label>
        <input
          type="number"
          value={slopeInput}
          onChange={(e) => setSlopeInput(e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-fairway-700 mb-1">Par</label>
        <input
          type="number"
          value={parInput}
          onChange={(e) => setParInput(e.target.value)}
          className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
        />
      </div>
      <div className="col-span-2 flex gap-2 sm:col-span-5">
        <button
          onClick={handleSave}
          className="rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800"
        >
          Guardar tee
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function RecorridoRow({
  recorrido,
  onUpdate,
  onDelete,
  onAddTee,
  onUpdateTee,
  onDeleteTee,
}: {
  recorrido: CourseRound
  onUpdate: (name: string) => void
  onDelete: () => void
  onAddTee: (tee: CourseTee) => void
  onUpdateTee: (index: number, tee: CourseTee) => void
  onDeleteTee: (index: number) => void
}) {
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(recorrido.name)
  const [addingTee, setAddingTee] = useState(false)
  const [editingTeeIndex, setEditingTeeIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2 rounded-lg border border-cream-300 bg-cream-50 p-3">
      <div className="flex items-center justify-between gap-2">
        {editingName ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
            />
            <button
              onClick={() => {
                if (!name.trim()) return
                onUpdate(name.trim())
                setEditingName(false)
              }}
              className="shrink-0 text-xs font-medium text-fairway-700 hover:underline"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setName(recorrido.name)
                setEditingName(false)
              }}
              className="shrink-0 text-xs text-fairway-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-fairway-800">{recorrido.name}</span>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => setEditingName(true)}
                className="text-xs font-medium text-fairway-700 hover:underline"
              >
                Editar nombre
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar el recorrido "${recorrido.name}"? Esta acción no se puede deshacer.`)) onDelete()
                }}
                className="text-xs text-fairway-500 hover:text-red-500"
              >
                Eliminar recorrido
              </button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2 pl-2">
        {recorrido.tees.map((t, idx) =>
          editingTeeIndex === idx ? (
            <TeeForm
              key={idx}
              initial={t}
              onSave={(tee) => {
                onUpdateTee(idx, tee)
                setEditingTeeIndex(null)
              }}
              onCancel={() => setEditingTeeIndex(null)}
            />
          ) : (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-800"
            >
              <span>
                {TEE_LABEL[t.color]} ({t.gender}) · CR {t.cr} · Slope {t.slope} · Par {t.par}
              </span>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() => setEditingTeeIndex(idx)}
                  className="text-xs font-medium text-fairway-700 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDeleteTee(idx)}
                  className="text-xs text-fairway-500 hover:text-red-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ),
        )}

        {addingTee ? (
          <TeeForm
            initial={BLANK_TEE}
            onSave={(tee) => {
              onAddTee(tee)
              setAddingTee(false)
            }}
            onCancel={() => setAddingTee(false)}
          />
        ) : (
          <button
            onClick={() => setAddingTee(true)}
            className="rounded-md border border-dashed border-cream-300 px-3 py-1.5 text-xs font-medium text-fairway-600 transition hover:border-fairway-400"
          >
            + Añadir tee
          </button>
        )}
      </div>
    </div>
  )
}

function CourseRow({
  course,
  onUpdate,
  onDelete,
  onAddRecorrido,
  onUpdateRecorrido,
  onDeleteRecorrido,
  onAddTee,
  onUpdateTee,
  onDeleteTee,
}: {
  course: GolfCourse
  onUpdate: (patch: { name: string; location: string }) => void
  onDelete: () => void
  onAddRecorrido: (name: string) => void
  onUpdateRecorrido: (recorridoId: string, name: string) => void
  onDeleteRecorrido: (recorridoId: string) => void
  onAddTee: (recorridoId: string, tee: CourseTee) => void
  onUpdateTee: (recorridoId: string, index: number, tee: CourseTee) => void
  onDeleteTee: (recorridoId: string, index: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(course.name)
  const [location, setLocation] = useState(course.location)
  const [addingRecorrido, setAddingRecorrido] = useState(false)
  const [newRecorridoName, setNewRecorridoName] = useState('')

  if (!editing) {
    return (
      <div className="rounded-xl border border-cream-300 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium text-fairway-900">{course.name}</div>
            <div className="text-xs text-fairway-500">{course.location}</div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-cream-300 px-2.5 py-1 text-xs font-medium text-fairway-700 transition hover:border-fairway-400"
            >
              Editar
            </button>
            <button
              onClick={() => {
                if (window.confirm(`¿Seguro que quieres eliminar "${course.name}"? Esta acción no se puede deshacer.`)) onDelete()
              }}
              className="rounded-md border border-cream-300 px-2.5 py-1 text-xs text-fairway-500 transition hover:border-red-400 hover:text-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {course.rounds.map((r) => (
            <span
              key={r.id}
              className="rounded-full border border-cream-300 bg-cream-100 px-2.5 py-1 text-xs text-fairway-700"
            >
              {r.name} · {r.tees.length} tees
            </span>
          ))}
          {course.rounds.length === 0 && (
            <span className="text-xs text-fairway-400">Sin recorridos todavía.</span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-xl border border-fairway-400 bg-white p-4 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-fairway-700 mb-1">Ubicación</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-fairway-700">Recorridos</div>
        {course.rounds.map((r) => (
          <RecorridoRow
            key={r.id}
            recorrido={r}
            onUpdate={(newName) => onUpdateRecorrido(r.id, newName)}
            onDelete={() => onDeleteRecorrido(r.id)}
            onAddTee={(tee) => onAddTee(r.id, tee)}
            onUpdateTee={(idx, tee) => onUpdateTee(r.id, idx, tee)}
            onDeleteTee={(idx) => onDeleteTee(r.id, idx)}
          />
        ))}

        {addingRecorrido ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRecorridoName}
              onChange={(e) => setNewRecorridoName(e.target.value)}
              placeholder="Nombre del recorrido"
              className="flex-1 rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
            />
            <button
              onClick={() => {
                if (!newRecorridoName.trim()) return
                onAddRecorrido(newRecorridoName.trim())
                setNewRecorridoName('')
                setAddingRecorrido(false)
              }}
              className="shrink-0 rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800"
            >
              Crear
            </button>
            <button
              onClick={() => setAddingRecorrido(false)}
              className="shrink-0 rounded-md border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingRecorrido(true)}
            className="rounded-md border border-dashed border-cream-300 px-3 py-1.5 text-xs font-medium text-fairway-600 transition hover:border-fairway-400"
          >
            + Añadir recorrido
          </button>
        )}
      </div>

      <div className="flex gap-2 border-t border-cream-200 pt-3">
        <button
          onClick={() => {
            onUpdate({ name, location })
            setEditing(false)
          }}
          className="rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800"
        >
          Guardar campo
        </button>
        <button
          onClick={() => {
            setName(course.name)
            setLocation(course.location)
            setEditing(false)
          }}
          className="rounded-md border border-cream-300 px-3 py-1.5 text-xs text-fairway-600 transition hover:border-fairway-400"
        >
          Cerrar edición
        </button>
      </div>
    </div>
  )
}

function GolfCourseApiImportPanel({
  onImported,
  onClose,
}: {
  onImported: (courses: GolfCourse[]) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GolfCourseApiSearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    try {
      setResults(await searchGolfCourses(query.trim()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar campos')
    } finally {
      setSearching(false)
    }
  }

  async function handleImport(id: string) {
    setImportingId(id)
    setError(null)
    try {
      const detail = await getGolfCourse(id)
      onImported(await importGolfCourse(detail))
      setResults(null)
      setQuery('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar el campo')
    } finally {
      setImportingId(null)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-fairway-400 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-fairway-900">Importar desde GolfCourseAPI</h3>
        <button
          onClick={onClose}
          className="text-xs text-fairway-500 underline-offset-2 hover:underline"
        >
          Cerrar
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Nombre del campo..."
          className="flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 focus:border-fairway-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="shrink-0 rounded-lg bg-fairway-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
        >
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {results && (
        <div className="space-y-2">
          {results.length === 0 ? (
            <p className="text-sm text-fairway-500">Sin resultados.</p>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-cream-300 p-2"
              >
                <div>
                  <div className="text-sm text-fairway-900">{r.name}</div>
                  {r.address && <div className="text-xs text-fairway-500">{r.address}</div>}
                </div>
                <button
                  onClick={() => handleImport(r.id)}
                  disabled={importingId === r.id}
                  className="shrink-0 rounded-md bg-fairway-700 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-fairway-800 disabled:opacity-60"
                >
                  {importingId === r.id ? 'Importando...' : 'Importar'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <p className="text-xs text-fairway-500">
        Trae el nombre, la ubicación y los tees (color aproximado, CR, Slope y Par) del campo en
        un único recorrido. Revisa el color de cada tee después de importar — se adivina a partir
        del nombre en inglés y puede no ser exacto.
      </p>
    </div>
  )
}

export function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [addingCourse, setAddingCourse] = useState(false)
  const [importingFromApi, setImportingFromApi] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLocation, setNewLocation] = useState('')

  useEffect(() => {
    loadCourses()
      .then(setCourses)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter(
      (c) => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q),
    )
  }, [courses, query])

  async function handleAddCourse() {
    if (!newName.trim()) return
    setCourses(await addCourse({ name: newName.trim(), location: newLocation.trim() }))
    setNewName('')
    setNewLocation('')
    setAddingCourse(false)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fairway-900">Campos de golf</h1>
        <p className="mt-1 text-sm text-fairway-600">
          {loading ? 'Cargando...' : `${courses.length} campos, cada uno con sus recorridos y los tees de cada uno.`}{' '}
          Visible para todos; solo tú puedes editarlos.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar campo o ubicación..."
          className="flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-fairway-900 placeholder-fairway-400 focus:border-fairway-500 focus:outline-none"
        />
        <button
          onClick={() => setAddingCourse((v) => !v)}
          className="shrink-0 rounded-lg bg-fairway-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-fairway-800"
        >
          {addingCourse ? 'Cancelar' : '+ Añadir campo'}
        </button>
        <button
          onClick={() => setImportingFromApi((v) => !v)}
          className="shrink-0 rounded-lg border border-fairway-400 px-3 py-2 text-sm font-medium text-fairway-800 transition hover:border-fairway-600"
        >
          {importingFromApi ? 'Cancelar' : 'Importar desde GolfCourseAPI'}
        </button>
      </div>

      {importingFromApi && (
        <GolfCourseApiImportPanel
          onImported={setCourses}
          onClose={() => setImportingFromApi(false)}
        />
      )}

      {addingCourse && (
        <div className="space-y-3 rounded-xl border border-fairway-400 bg-white p-4 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-fairway-700 mb-1">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fairway-700 mb-1">
                Ubicación
              </label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full rounded-md border border-cream-300 bg-white px-2 py-1.5 text-sm text-fairway-900"
              />
            </div>
          </div>
          <button
            onClick={handleAddCourse}
            className="rounded-md bg-fairway-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-fairway-800"
          >
            Crear campo
          </button>
          <p className="text-xs text-fairway-500">
            Después de crearlo, pulsa "Editar" en su tarjeta para añadirle recorridos y tees.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((course) => (
          <CourseRow
            key={course.id}
            course={course}
            onUpdate={async (patch) => setCourses(await updateCourse(course.id, patch))}
            onDelete={async () => setCourses(await deleteCourse(course.id))}
            onAddRecorrido={async (name) => setCourses(await addRecorrido(course.id, name))}
            onUpdateRecorrido={async (recorridoId, name) =>
              setCourses(await updateRecorrido(recorridoId, name))
            }
            onDeleteRecorrido={async (recorridoId) =>
              setCourses(await deleteRecorrido(recorridoId))
            }
            onAddTee={async (recorridoId, tee) => setCourses(await addTee(recorridoId, tee))}
            onUpdateTee={async (recorridoId, idx, tee) =>
              setCourses(await updateTee(recorridoId, idx, tee))
            }
            onDeleteTee={async (recorridoId, idx) =>
              setCourses(await deleteTee(recorridoId, idx))
            }
          />
        ))}
      </div>
    </div>
  )
}
