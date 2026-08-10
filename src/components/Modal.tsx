import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  ouvert: boolean
  onFermer: () => void
  titre: string
  children: ReactNode
}

export default function Modal({ ouvert, onFermer, titre, children }: ModalProps) {
  // Fermer avec Escape
  useEffect(() => {
    if (!ouvert) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ouvert, onFermer])

  // Bloquer le scroll body
  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [ouvert])

  if (!ouvert) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onFermer}
        aria-hidden="true"
      />
      {/* Panneau */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">{titre}</h2>
          <button
            onClick={onFermer}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-alt transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Contenu */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

// Modale de confirmation suppression
export function ModaleSuppression({
  ouvert,
  nomFiche,
  enCours,
  onConfirmer,
  onAnnuler,
}: {
  ouvert: boolean
  nomFiche: string
  enCours: boolean
  onConfirmer: () => void
  onAnnuler: () => void
}) {
  return (
    <Modal ouvert={ouvert} onFermer={onAnnuler} titre="Supprimer la fiche">
      <p className="text-sm text-text-secondary mb-5">
        Vous êtes sur le point de supprimer{' '}
        <span className="font-medium text-text-primary">"{nomFiche}"</span>.
        Cette action est irréversible.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onAnnuler}
          disabled={enCours}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirmer}
          disabled={enCours}
          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {enCours ? 'Suppression…' : 'Supprimer'}
        </button>
      </div>
    </Modal>
  )
}
