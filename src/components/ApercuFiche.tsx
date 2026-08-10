// Aperçu "tel qu'affiché dans l'app mobile" — utilisé dans les formulaires avant soumission
import { useMemo } from 'react'

export interface DonneesApercu {
  nom: string
  sousTexte: string
  description?: string
  telephone?: string
  adresse?: string
  photo: File | null
  photoUrl?: string | null   // URL existante (mode édition)
  galerie: File[]
  extra?: { label: string; valeur: string }[]
}

interface Props {
  donnees: DonneesApercu
  onFermer: () => void
}

export default function ApercuFiche({ donnees, onFermer }: Props) {
  // Créer les object URLs une seule fois via useMemo pour éviter la page blanche
  const photoSrc = useMemo(() => {
    if (donnees.photo) return URL.createObjectURL(donnees.photo)
    return donnees.photoUrl ?? null
  }, [donnees.photo, donnees.photoUrl])

  const galerieSrcs = useMemo(
    () => donnees.galerie.map((f) => URL.createObjectURL(f)),
    [donnees.galerie]
  )

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onFermer() }}
    >
      <div className="w-full max-w-sm bg-[#f5f5f0] rounded-3xl overflow-hidden shadow-2xl">

        {/* Barre "téléphone" simulée */}
        <div className="bg-[#145217] px-4 py-3 flex items-center gap-2">
          <button onClick={onFermer} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white text-sm font-semibold flex-1 text-center pr-5">
            Aperçu dans l'app
          </span>
        </div>

        <div className="overflow-y-auto max-h-[75vh]">
          {/* Photo couverture */}
          {photoSrc ? (
            <div className="w-full h-48 bg-gray-200 overflow-hidden">
              <img src={photoSrc} alt="couverture" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-48 bg-[#e6efe6] flex flex-col items-center justify-center gap-2">
              <svg className="w-10 h-10 text-[#145217]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M4.5 8.25a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="text-[#145217]/50 text-xs">Aucune photo sélectionnée</span>
            </div>
          )}

          {/* Galerie miniatures */}
          {galerieSrcs.length > 0 && (
            <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto">
              {galerieSrcs.map((src, i) => (
                <div key={i} className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[#e3e2da]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Contenu */}
          <div className="px-4 py-4 space-y-3">
            <div>
              <h2 className="text-base font-bold text-[#1a1c19]">{donnees.nom || <span className="text-[#8e918a]">Nom non renseigné</span>}</h2>
              <p className="text-sm text-[#5c5f58] capitalize">{donnees.sousTexte}</p>
            </div>

            {/* Badge statut */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              En attente de validation
            </span>

            {donnees.description && (
              <div className="bg-white rounded-2xl p-3">
                <p className="text-[10px] font-semibold text-[#8e918a] uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-[#5c5f58] leading-relaxed">{donnees.description}</p>
              </div>
            )}

            {(donnees.telephone || donnees.adresse || (donnees.extra ?? []).length > 0) && (
              <div className="bg-white rounded-2xl p-3 space-y-2">
                {donnees.telephone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#145217] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span className="text-sm text-[#1a1c19]">{donnees.telephone}</span>
                  </div>
                )}
                {donnees.adresse && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#145217] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm text-[#1a1c19]">{donnees.adresse}</span>
                  </div>
                )}
                {(donnees.extra ?? []).map((e) => (
                  <div key={e.label} className="flex justify-between">
                    <span className="text-xs text-[#8e918a]">{e.label}</span>
                    <span className="text-xs font-medium text-[#1a1c19]">{e.valeur}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA simulé */}
            <button type="button" disabled
              className="w-full bg-[#145217] text-white font-semibold py-3 rounded-2xl opacity-80 text-sm">
              Contacter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e3e2da] px-4 py-3">
          <button onClick={onFermer}
            className="w-full py-2.5 rounded-xl border border-[#e3e2da] text-sm font-medium text-[#5c5f58] hover:bg-[#f2f2ec] transition-colors">
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  )
}
