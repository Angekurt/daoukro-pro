// Hook générique : charge une fiche existante et expose la fonction de mise à jour (PUT)
import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import type { TypeFiche, FicheDetail } from './useFiche'

export function useModifierFiche(type: TypeFiche, id: number) {
  const [fiche,      setFiche]  = useState<FicheDetail | null>(null)
  const [chargement, setCharg]  = useState(true)
  const [erreur,     setErreur] = useState<string | null>(null)

  useEffect(() => {
    setCharg(true)
    api.get(`/mes-soumissions/${type}/${id}`)
      .then(({ data }) => setFiche(data.data ?? data))
      .catch(() => setErreur('Impossible de charger la fiche.'))
      .finally(() => setCharg(false))
  }, [type, id])

  const enregistrer = useCallback(async (donnees: FormData) => {
    // Laravel exige _method=PUT dans un POST multipart
    donnees.append('_method', 'PUT')
    await api.post(`/mes-soumissions/${type}/${id}`, donnees, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }, [type, id])

  return { fiche, chargement, erreur, enregistrer }
}
