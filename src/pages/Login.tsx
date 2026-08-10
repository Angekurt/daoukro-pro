import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import { api, setStoredToken } from '../lib/api'

type Mode = 'choix' | 'connexion' | 'inscription'

export default function Login() {
  const { utilisateur, chargement, erreur, connecterAvecGoogle, rafraichirProfil } = useAuth()
  const navigate = useNavigate()

  const [mode,      setMode]      = useState<Mode>('choix')
  const [nom,       setNom]       = useState('')
  const [prenom,    setPrenom]    = useState('')
  const [email,     setEmail]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [enCours,   setEnCours]   = useState(false)
  const [errLocale, setErrLocale] = useState<string | null>(null)

  useEffect(() => {
    if (utilisateur) navigate('/tableau-de-bord', { replace: true })
  }, [utilisateur, navigate])

  async function onSuccessGoogle(credential: CredentialResponse) {
    if (!credential.credential) return
    const ok = await connecterAvecGoogle(credential.credential)
    if (ok) navigate('/tableau-de-bord', { replace: true })
  }

  async function onConnexionEmail(e: FormEvent) {
    e.preventDefault()
    setErrLocale(null)
    if (!email.trim() || !password) { setErrLocale('Email et mot de passe obligatoires.'); return }
    setEnCours(true)
    try {
      const { data } = await api.post('/auth/citoyen/login', { email: email.trim(), password })
      setStoredToken(data.token)
      await rafraichirProfil()
      navigate('/tableau-de-bord', { replace: true })
    } catch (err: any) {
      setErrLocale(err.response?.data?.message ?? 'Identifiants incorrects.')
    } finally { setEnCours(false) }
  }

  async function onInscriptionEmail(e: FormEvent) {
    e.preventDefault()
    setErrLocale(null)
    if (!nom.trim())     { setErrLocale('Le nom est obligatoire.'); return }
    if (!email.trim())   { setErrLocale('L\'email est obligatoire.'); return }
    if (!password)       { setErrLocale('Le mot de passe est obligatoire.'); return }
    if (password.length < 8) { setErrLocale('Le mot de passe doit faire au moins 8 caractères.'); return }
    if (password !== confirm) { setErrLocale('Les mots de passe ne correspondent pas.'); return }
    setEnCours(true)
    try {
      const { data } = await api.post('/auth/citoyen/register', {
        name:                  nom.trim(),
        prenom:                prenom.trim() || undefined,
        email:                 email.trim(),
        telephone:             telephone.trim() || undefined,
        password,
        password_confirmation: confirm,
      })
      setStoredToken(data.token)
      await rafraichirProfil()
      navigate('/tableau-de-bord', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.response?.data?.errors
      if (typeof msg === 'object') {
        setErrLocale(Object.values(msg).flat().join(', ') as string)
      } else {
        setErrLocale(msg ?? 'Inscription impossible. Réessayez.')
      }
    } finally { setEnCours(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-2xl p-8">
        {/* En-tête */}
        <div className="text-center mb-6">
          <img src="/icon.png" alt="Daoukro Digital" className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover" />
          <h1 className="text-xl font-bold text-text-primary mb-1">Daoukro Pro</h1>
          <p className="text-sm text-text-secondary">
            {mode === 'inscription'
              ? 'Créez votre compte professionnel'
              : 'Accédez à votre espace professionnel'}
          </p>
        </div>

        {/* ── Choix du mode ── */}
        {mode === 'choix' && (
          <div className="space-y-3">
            {/* Google */}
            {chargement ? (
              <div className="py-2 text-sm text-text-secondary text-center">Connexion en cours...</div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin onSuccess={onSuccessGoogle} onError={() => {}} />
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button onClick={() => setMode('connexion')}
              className="w-full py-3 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-alt transition-colors">
              Connexion avec email
            </button>
            <button onClick={() => setMode('inscription')}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
              Créer un compte
            </button>

            {erreur && <p className="mt-2 text-sm text-red-600 text-center">{erreur}</p>}
          </div>
        )}

        {/* ── Connexion email ── */}
        {mode === 'connexion' && (
          <form onSubmit={onConnexionEmail} className="space-y-3">
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Mot de passe" type="password" value={password} onChange={setPassword} required />
            {errLocale && <p className="text-sm text-red-600">{errLocale}</p>}
            <button type="submit" disabled={enCours}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60 transition-opacity">
              {enCours ? 'Connexion…' : 'Se connecter'}
            </button>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">ou</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={onSuccessGoogle} onError={() => {}} />
            </div>
            <button type="button" onClick={() => { setMode('choix'); setErrLocale(null) }}
              className="w-full text-xs text-text-muted hover:text-primary transition-colors mt-1">
              Retour
            </button>
          </form>
        )}

        {/* ── Inscription email ── */}
        {mode === 'inscription' && (
          <form onSubmit={onInscriptionEmail} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nom *" value={nom} onChange={setNom} required />
              <Input label="Prénom" value={prenom} onChange={setPrenom} />
            </div>
            <Input label="Email *" type="email" value={email} onChange={setEmail} required />
            <Input label="Téléphone" type="tel" value={telephone} onChange={setTelephone} placeholder="07 XX XX XX" />
            <Input label="Mot de passe *" type="password" value={password} onChange={setPassword} required />
            <Input label="Confirmer le mot de passe *" type="password" value={confirm} onChange={setConfirm} required />
            <p className="text-xs text-text-muted">Minimum 8 caractères.</p>
            {errLocale && <p className="text-sm text-red-600">{errLocale}</p>}
            <button type="submit" disabled={enCours}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60 transition-opacity">
              {enCours ? 'Création du compte…' : 'Créer mon compte'}
            </button>
            <button type="button" onClick={() => { setMode('choix'); setErrLocale(null) }}
              className="w-full text-xs text-text-muted hover:text-primary transition-colors">
              Retour
            </button>
          </form>
        )}

        {/* Lien inscription ↔ connexion */}
        {mode !== 'choix' && (
          <p className="text-center text-xs text-text-muted mt-4">
            {mode === 'connexion' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button onClick={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setErrLocale(null) }}
              className="text-primary font-medium hover:underline">
              {mode === 'connexion' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Composant Input local ──────────────────────────────────────────────────────

function Input({ label, type = 'text', value, onChange, required, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void
  required?: boolean; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}
