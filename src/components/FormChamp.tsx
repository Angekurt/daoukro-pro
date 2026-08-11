// Composants de formulaire réutilisables partagés entre toutes les pages de soumission
import { useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export function Champ({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}

export function ChampSelect({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ChampTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />
    </div>
  )
}

export function ChampPhoto({
  onChange,
  valeur,
  label = 'Photo principale',
}: {
  onChange: (f: File | null) => void
  valeur: File | null
  label?: string
}) {
  const preview = valeur ? URL.createObjectURL(valeur) : null

  return (
    <div>
      <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-border">
            <img src={preview} alt="aperçu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
              <span className="text-white text-sm font-medium">Changer la photo</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-44 rounded-2xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary-light transition-colors">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-text-secondary">Cliquez pour ajouter une photo</p>
            <p className="text-xs text-text-muted">JPG, PNG, WebP — max 5 Mo</p>
          </div>
        )}
      </label>
      {valeur && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-1.5 text-xs text-red-500 hover:underline"
        >
          Retirer la photo
        </button>
      )}
    </div>
  )
}

export function BoutonSoumettre({
  enCours,
  texte = 'Envoyer la fiche',
  texteEnCours = 'Envoi...',
}: {
  enCours: boolean
  texte?: string
  texteEnCours?: string
}) {
  return (
    <button
      type="submit"
      disabled={enCours}
      className="w-full bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-opacity"
    >
      {enCours ? texteEnCours : texte}
    </button>
  )
}

// ── Galerie photos (max 5) avec drag-and-drop pour réordonner ────────────────

const MAX_PHOTOS = 5

// Vignette triable (DnD)
function VignetteSortable({ file, index, onRetirer }: { file: File; index: number; onRetirer: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.name + index })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  }
  const url = URL.createObjectURL(file)
  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square rounded-xl overflow-hidden border border-border group cursor-grab active:cursor-grabbing">
      <img src={url} alt={`photo ${index + 1}`} className="w-full h-full object-cover" {...attributes} {...listeners} />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button type="button" onClick={onRetirer}
          className="w-7 h-7 rounded-full bg-white flex items-center justify-center" aria-label="Retirer">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md pointer-events-none">
        {index === 0 ? 'Couv.' : `${index + 1}`}
      </span>
    </div>
  )
}

export function GaleriePhotos({
  valeurs,
  onChange,
  label = 'Galerie photos',
}: {
  valeurs: File[]
  onChange: (files: File[]) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const sensors  = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function ajouterFichiers(e: React.ChangeEvent<HTMLInputElement>) {
    const nouveaux = Array.from(e.target.files ?? [])
    onChange([...valeurs, ...nouveaux].slice(0, MAX_PHOTOS))
    if (inputRef.current) inputRef.current.value = ''
  }

  function retirer(index: number) {
    onChange(valeurs.filter((_, i) => i !== index))
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = valeurs.findIndex((f, i) => f.name + i === active.id)
    const newIndex = valeurs.findIndex((f, i) => f.name + i === over.id)
    if (oldIndex !== -1 && newIndex !== -1) onChange(arrayMove(valeurs, oldIndex, newIndex))
  }

  const ids = valeurs.map((f, i) => f.name + i)
  const restants = MAX_PHOTOS - valeurs.length

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <span className="text-xs text-text-muted">{valeurs.length} / {MAX_PHOTOS}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2">
            {valeurs.map((file, i) => (
              <VignetteSortable key={file.name + i} file={file} index={i} onRetirer={() => retirer(i)} />
            ))}
            {restants > 0 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-surface hover:border-primary hover:bg-primary-light transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" onChange={ajouterFichiers} />
                <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] text-text-muted text-center px-1">
                  {restants} photo{restants > 1 ? 's' : ''} restante{restants > 1 ? 's' : ''}
                </span>
              </label>
            )}
          </div>
        </SortableContext>
      </DndContext>
      {valeurs.length > 0 && (
        <p className="text-xs text-text-muted mt-1.5">
          Glissez pour réordonner. La 1ère photo sera la couverture.
        </p>
      )}
    </div>
  )
}
