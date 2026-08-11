import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'

type Statut = 'verification' | 'succes' | 'echec' | 'attente'

export default function PaiementRetour() {
  const [searchParams]    = useSearchParams()
  const navigate          = useNavigate()
  const [statut, setStatut] = useState<Statut>('verification')
  const [message, setMessage] = useState('')
  const ref = searchParams.get('ref')

  useEffect(() => {
    // Vérifier automatiquement le statut dès l'arrivée sur la page
    async function verifier() {
      try {
        const { data } = await api.get('/paiements/verifier')
        if (data.statut === 'paid') {
          setStatut('succes')
          setMessage('Votre abonnement a été activé avec succès !')
        } else if (data.statut === 'pending') {
          setStatut('attente')
          setMessage('Paiement en cours de traitement. Vérifiez dans quelques instants.')
        } else {
          setStatut('echec')
          setMessage('Le paiement n\'a pas abouti. Veuillez réessayer.')
        }
      } catch {
        setStatut('attente')
        setMessage('Impossible de vérifier le statut. Vérifiez votre abonnement.')
      }
    }
    verifier()
  }, [ref])

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">

        {/* Vérification en cours */}
        {statut === 'verification' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-dark mb-2">Vérification en cours…</h1>
            <p className="text-text-muted text-sm">Nous vérifions votre paiement, veuillez patienter.</p>
          </>
        )}

        {/* Succès */}
        {statut === 'succes' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-green-700 mb-2">Paiement confirmé !</h1>
            <p className="text-text-muted text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/abonnement')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              Voir mon abonnement
            </button>
          </>
        )}

        {/* En attente */}
        {statut === 'attente' && (
          <>
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-yellow-700 mb-2">Paiement en attente</h1>
            <p className="text-text-muted text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/abonnement')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              Retour à mon abonnement
            </button>
          </>
        )}

        {/* Échec */}
        {statut === 'echec' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-red-700 mb-2">Paiement non abouti</h1>
            <p className="text-text-muted text-sm mb-6">{message}</p>
            <button
              onClick={() => navigate('/abonnement')}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
            >
              Réessayer
            </button>
          </>
        )}

      </div>
    </div>
  )
}
