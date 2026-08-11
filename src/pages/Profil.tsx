import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import { Champ, ChampTextarea, BoutonSoumettre } from '../components/FormChamp'
import { api } from '../lib/api'

// ── Indicateur de complétion ──────────────────────────────────────────────────

interface Etape { label: string; faite: boolean }

function indicateurCompletion(u: {
  nom?: string | null
  email?: string | null
  telephone?: string | null
  bio?: string | null
  avatar_url?: string | null
}): { etapes: Etape[]; pct: number } {
  const etapes: Etape[] = [
    { label: 'Nom renseigné',       faite: Boolean(u.nom?.trim()) },
    { label: 'Email connecté',      faite: Boolean(u.email) },
    { label: 'Téléphone ajouté',    faite: Boolean(u.telephone?.trim()) },
    { label: 'Présentation rédigée', faite: Boolean(u.bio?.trim()) },
    { label: 'Photo de profil',     faite: Boolean(u.avatar_url) },
  ]
  const pct = Math.round((etapes.filter((e) => e.faite).length / etapes.length) * 100)
  return { etapes, pct }
}

function BarreCompletion({ pct }: { pct: number }) {
  const couleur =
    pct < 40 ? 'bg-red-400'
    : pct < 80 ? 'bg-amber-400'
    : 'bg-green-500'

  return (
    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${couleur}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Page Profil ───────────────────────────────────────────────────────────────

export default function Profil() {
  const { utilisateur, mettreAJourProfil, deconnecter } = useAuth()
  const navigate = useNavigate()

  const [nom,       setNom]       = useState(utilisateur?.nom       ?? '')
  const [telephone, setTelephone] = useState(utilisateur?.telephone ?? '')
  const [bio,       setBio]       = useState(utilisateur?.bio       ?? '')
  const [enCours,        setEnCours]        = useState(false)
  const [succes,         setSucces]         = useState(false)
  const [erreur,         setErreur]         = useState<string | null>(null)
  const [confirmSuppr,   setConfirmSuppr]   = useState(false)
  const [suppression,    setSuppression]    = useState(false)
  const [motDePasseConf, setMotDePasseConf] = useState('')

  if (!utilisateur) return null

  // Calcul en temps réel selon les champs du formulaire
  const { etapes, pct } = indicateurCompletion({
    ...utilisateur,
    nom,
    telephone,
    bio,
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setSucces(false)
    if (!nom.trim()) { setErreur('Le nom est obligatoire.'); return }
    setEnCours(true)
    const ok = await mettreAJourProfil({
      nom:       nom.trim(),
      telephone: telephone.trim() || null,
      bio:       bio.trim()       || null,
    })
    setEnCours(false)
    if (ok) { setSucces(true); setTimeout(() => setSucces(false), 3000) }
    else     setErreur('Mise à jour impossible pour le moment. Réessayez.')
  }

  function onDeconnecter() {
    deconnecter()
    navigate('/', { replace: true })
  }

  async function supprimerCompte() {
    setSuppression(true)
    try {
      await api.delete('/auth/compte')
      deconnecter()
      navigate('/', { replace: true })
    } catch {
      setErreur('Impossible de supprimer le compte. Contactez le support.')
      setConfirmSuppr(false)
    } finally {
      setSuppression(false)
    }
  }

  return (
    <Layout>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-text-primary mb-1">Mon profil</h1>
        <p className="text-sm text-text-secondary">
          Ces informations sont associées à vos fiches soumises.
        </p>
      </div>

      {/* ── Carte avatar + complétion ── */}
      <div className="bg-white border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center overflow-hidden shrink-0">
            {utilisateur.avatar_url ? (
              <img src={utilisateur.avatar_url} alt={utilisateur.nom} className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-2xl">
                {utilisateur.nom.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary truncate">{utilisateur.nom}</p>
            {utilisateur.email && (
              <p className="text-sm text-text-secondary truncate">{utilisateur.email}</p>
            )}
            <p className="text-xs text-text-muted mt-0.5">Connecté via Google</p>
          </div>
        </div>

        {/* Barre de complétion */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-text-secondary">Complétion du profil</p>
            <p className={`text-xs font-bold ${pct === 100 ? 'text-green-600' : pct < 40 ? 'text-red-500' : 'text-amber-600'}`}>
              {pct}%
            </p>
          </div>
          <BarreCompletion pct={pct} />

          {/* Checklist */}
          <div className="mt-3 grid grid-cols-1 gap-1.5">
            {etapes.map((e) => (
              <div key={e.label} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                  e.faite ? 'bg-green-100' : 'bg-surface-alt'
                }`}>
                  {e.faite ? (
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-border" />
                  )}
                </span>
                <span className={`text-xs ${e.faite ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {e.label}
                </span>
              </div>
            ))}
          </div>

          {pct === 100 && (
            <p className="text-xs text-green-600 font-medium mt-2 text-center">
              Profil complet — vos fiches bénéficient d'une meilleure visibilité.
            </p>
          )}
        </div>
      </div>

      {/* ── Formulaire modification ── */}
      <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Modifier mes informations</h2>
        <Champ label="Nom complet" value={nom} onChange={setNom} required />
        <Champ label="Téléphone"   value={telephone} onChange={setTelephone} type="tel" />
        <ChampTextarea
          label="Présentation / Bio"
          value={bio}
          onChange={setBio}
          rows={3}
          placeholder="Quelques mots sur vous ou votre activité…"
        />
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        {succes && <p className="text-sm text-green-600 font-medium">Profil mis à jour avec succès.</p>}
        <BoutonSoumettre enCours={enCours} texte="Enregistrer les modifications" texteEnCours="Enregistrement…" />
      </form>

      {/* ── Zone compte ── */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Compte</h2>
        <Link to="/abonnement"
          className="flex items-center justify-between w-full py-2.5 px-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt transition-colors mb-2">
          <span>Gérer mon abonnement</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <button type="button" onClick={onDeconnecter}
          className="w-full border border-red-200 text-red-600 font-medium py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors">
          Se déconnecter
        </button>
        <button type="button" onClick={() => setConfirmSuppr(true)}
          className="w-full mt-2 text-xs text-text-muted hover:text-red-500 transition-colors py-1">
          Supprimer mon compte
        </button>
      </div>

      {/* ── Modale suppression compte ── */}
      <Modal ouvert={confirmSuppr} onFermer={() => { setConfirmSuppr(false); setMotDePasseConf('') }} titre="Supprimer mon compte">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-800 font-medium">Cette action est irréversible.</p>
            <p className="text-xs text-red-700 mt-1">
              Toutes vos fiches, données et abonnement seront définitivement supprimés.
              Aucun remboursement ne sera effectué.
            </p>
          </div>
          <Champ
            label="Tapez SUPPRIMER pour confirmer"
            value={motDePasseConf}
            onChange={setMotDePasseConf}
            placeholder="SUPPRIMER"
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setConfirmSuppr(false); setMotDePasseConf('') }}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt"
            >
              Annuler
            </button>
            <button
              onClick={supprimerCompte}
              disabled={suppression || motDePasseConf !== 'SUPPRIMER'}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40"
            >
              {suppression ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
