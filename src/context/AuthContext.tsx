import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { api, setStoredToken, getStoredToken } from '../lib/api'

export interface Utilisateur {
  id: number
  nom: string
  email: string | null
  avatar_url: string | null
  telephone?: string | null
  bio?: string | null
}

interface AuthContextValue {
  utilisateur: Utilisateur | null
  chargement: boolean
  erreur: string | null
  connecterAvecGoogle: (idToken: string) => Promise<boolean>
  deconnecter: () => void
  rafraichirProfil: () => Promise<void>
  mettreAJourProfil: (donnees: Partial<Pick<Utilisateur, 'nom' | 'telephone' | 'bio'>>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = 'daoukro_pro_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as Utilisateur) : null
  })
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const sauvegarderUtilisateur = useCallback((u: Utilisateur) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUtilisateur(u)
  }, [])

  const rafraichirProfil = useCallback(async () => {
    if (!getStoredToken()) return
    try {
      const { data } = await api.get('/profil')
      const u: Utilisateur = {
        id: data.data?.id ?? data.id,
        nom: data.data?.nom ?? data.nom ?? data.name ?? '',
        email: data.data?.email ?? data.email ?? null,
        avatar_url: data.data?.avatar_url ?? data.avatar_url ?? null,
        telephone: data.data?.telephone ?? data.telephone ?? null,
        bio: data.data?.bio ?? data.bio ?? null,
      }
      sauvegarderUtilisateur(u)
    } catch {
      // profil non disponible, on garde les données locales
    }
  }, [sauvegarderUtilisateur])

  // Au montage, si un token existe on tente de rafraîchir le profil
  useEffect(() => {
    if (getStoredToken() && utilisateur) {
      rafraichirProfil()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connecterAvecGoogle = useCallback(async (idToken: string) => {
    setChargement(true)
    setErreur(null)
    try {
      const { data } = await api.post('/auth/google', { id_token: idToken })
      setStoredToken(data.token)
      const u: Utilisateur = {
        id: data.user.id ?? 0,
        nom: data.user.nom ?? data.user.name ?? '',
        email: data.user.email ?? null,
        avatar_url: data.user.avatar_url ?? null,
        telephone: data.user.telephone ?? null,
        bio: data.user.bio ?? null,
      }
      sauvegarderUtilisateur(u)
      return true
    } catch (err: any) {
      let msg = 'Connexion impossible pour le moment. Réessayez.'
      if (err?.response?.data?.message) {
        msg = err.response.data.message
      } else if (err?.message === 'Network Error') {
        msg = 'Erreur réseau : impossible de joindre le serveur API. Vérifiez votre connexion.'
      } else if (err?.message) {
        msg = `Erreur: ${err.message}`
      }
      setErreur(msg)
      return false
    } finally {
      setChargement(false)
    }
  }, [sauvegarderUtilisateur])

  const mettreAJourProfil = useCallback(async (donnees: Partial<Pick<Utilisateur, 'nom' | 'telephone' | 'bio'>>) => {
    try {
      const { data } = await api.put('/profil', donnees)
      const u: Utilisateur = {
        ...(utilisateur!),
        nom: data.data?.nom ?? data.nom ?? donnees.nom ?? utilisateur!.nom,
        telephone: data.data?.telephone ?? data.telephone ?? donnees.telephone ?? null,
        bio: data.data?.bio ?? data.bio ?? donnees.bio ?? null,
      }
      sauvegarderUtilisateur(u)
      return true
    } catch {
      return false
    }
  }, [utilisateur, sauvegarderUtilisateur])

  const deconnecter = useCallback(() => {
    setStoredToken(null)
    localStorage.removeItem(USER_KEY)
    setUtilisateur(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      utilisateur,
      chargement,
      erreur,
      connecterAvecGoogle,
      deconnecter,
      rafraichirProfil,
      mettreAJourProfil,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}

export function estConnecte() {
  return Boolean(getStoredToken())
}
