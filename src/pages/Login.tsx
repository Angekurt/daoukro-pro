import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { utilisateur, chargement, erreur, connecterAvecGoogle } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (utilisateur) navigate('/tableau-de-bord', { replace: true })
  }, [utilisateur, navigate])

  async function onSuccess(credential: CredentialResponse) {
    if (!credential.credential) return
    const ok = await connecterAvecGoogle(credential.credential)
    if (ok) navigate('/tableau-de-bord', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-2xl p-8 text-center">
        <img src="/icon.png" alt="Daoukro Digital" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
        <h1 className="text-xl font-bold text-text-primary mb-1">Daoukro Pro</h1>
        <p className="text-sm text-text-secondary mb-6">
          Déposez votre fiche artisan, hébergement, bien ou annonce — visible dans l'app Daoukro Digital après
          validation par la mairie.
        </p>

        {chargement ? (
          <div className="py-2 text-sm text-text-secondary">Connexion en cours...</div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin onSuccess={onSuccess} onError={() => {}} />
          </div>
        )}

        {erreur && <p className="mt-4 text-sm text-red-600">{erreur}</p>}
      </div>
    </div>
  )
}
