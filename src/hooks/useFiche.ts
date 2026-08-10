// Hook générique pour charger / supprimer une fiche par type et id
import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'

export type TypeFiche = 'artisans' | 'hebergements' | 'immobilier' | 'annonces'

export interface FicheDetail {
  id: number
  is_active: boolean
  photo_url: string | null
  photos_galerie?: string[]   // URLs des photos additionnelles
  created_at: string
  updated_at?: string
  // Artisan
  nom?: string
  metier?: string
  description?: string
  telephone?: string
  whatsapp?: string
  adresse?: string
  // Hébergement
  type?: string
  prix_min?: number
  prix_max?: number
  // Immobilier
  titre?: string
  type_offre?: string
  type_bien?: string
  prix?: number
  surface?: number
  nb_chambres?: number
  quartier?: string
  // Annonce
  lieu?: string
  date_debut?: string
  date_fin?: string
  email?: string
  lien?: string
}

export interface Avis {
  id: number
  nom: string
  note: number
  commentaire: string | null
  created_at: string
}

export interface Contact {
  id: number
  nom: string
  telephone: string | null
  message: string | null
  created_at: string
}

export function useFiche(type: TypeFiche, id: number) {
  const [fiche,     setFiche]     = useState<FicheDetail | null>(null)
  const [avis,      setAvis]      = useState<Avis[]>([])
  const [contacts,  setContacts]  = useState<Contact[]>([])
  const [chargement, setCharg]    = useState(true)
  const [erreur,    setErreur]    = useState<string | null>(null)

  const charger = useCallback(() => {
    setCharg(true)
    setErreur(null)
    Promise.allSettled([
      api.get(`/mes-soumissions/${type}/${id}`),
      api.get(`/${type}/${id}/avis`),
      api.get(`/mes-soumissions/${type}/${id}/contacts`),
    ]).then(([resFiche, resAvis, resContacts]) => {
      if (resFiche.status === 'fulfilled') {
        setFiche(resFiche.value.data?.data ?? resFiche.value.data)
      } else {
        setErreur('Fiche introuvable.')
      }
      if (resAvis.status === 'fulfilled') setAvis(resAvis.value.data?.data ?? [])
      if (resContacts.status === 'fulfilled') setContacts(resContacts.value.data?.data ?? [])
    }).finally(() => setCharg(false))
  }, [type, id])

  useEffect(() => { charger() }, [charger])

  const supprimer = useCallback(async () => {
    await api.delete(`/mes-soumissions/${type}/${id}`)
  }, [type, id])

  return { fiche, avis, contacts, chargement, erreur, charger, supprimer }
}
