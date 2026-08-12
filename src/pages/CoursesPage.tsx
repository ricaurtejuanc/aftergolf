import { useEffect, useMemo, useState } from 'react'
import { TEE_LABEL } from '../components/CourseTeeSelect'
import type { CourseTee, GolfCourse, TeeColor, TeeGender } from '../data/courses'
import {
  addCourse,
  addTee,
  deleteCourse,
  deleteTee,
  loadCourses,
  updateCourse,
  updateTee,
} from '../lib/courseStore'

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

function CourseRow({
  course,
  onUpdate,
  onDelete,
  onAddTee,
  onUpdateTee,
  onDeleteTee,
}: {
  course: GolfCourse
  onUpdate: (patch: { name: string; location: string }) => void
  onDelete: () => void
  onAddTee: (tee: CourseTee) => void
  onUpdateTee: (index: number, tee: CourseTee) => void
  onDeleteTee: (index: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(course.name)
  const [location, setLocation] = useState(course.location)
  const [addingTee, setAddingTee] = useState(false)
  const [editingTeeIndex, setEditingTeeIndex] = useState<number | null>(null)

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
              onClick={onDelete}
              className="rounded-md border border-cream-300 px-2.5 py-1 text-xs text-fairway-500 transition hover:border-red-400 hover:text-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {course.tees.map((t, idx) => (
            <span
              key={idx}
              className="rounded-full border border-cream-300 bg-cream-100 px-2.5 py-1 text-xs text-fairway-700"
            >
              {TEE_LABEL[t.color]} · CR {t.cr} · Slope {t.slope} · Par {t.par}
            </span>
          ))}
          {course.tees.length === 0 && (
            <span className="text-xs text-fairway-400">Sin tees todavía.</span>
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
        <div className="text-xs font-medium text-fairway-700">Tees</div>
        {course.tees.map((t, idx) =>
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
              className="flex items-center justify-between rounded-lg border border-cream-300 bg-cream-100 px-3 py-2 text-sm text-fairway-800"
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

export function CoursesPage() {
  const [courses, setCourses] = useState<GolfCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [addingCourse, setAddingCourse] = useState(false)
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
          {loading ? 'Cargando...' : `${courses.length} campos con sus tees, Course Rating y Slope.`}{' '}
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
      </div>

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
            Después de crearlo, pulsa "Editar" en su tarjeta para añadirle los tees.
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
            onAddTee={async (tee) => setCourses(await addTee(course.id, tee))}
            onUpdateTee={async (idx, tee) => setCourses(await updateTee(course.id, idx, tee))}
            onDeleteTee={async (idx) => setCourses(await deleteTee(course.id, idx))}
          />
        ))}
      </div>
    </div>
  )
}
