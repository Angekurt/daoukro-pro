import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { api } from '../lib/api'
import { Champ, ChampTextarea, BoutonSoumettre } from '../components/FormChamp'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeamMembre {
  id: number
  nom: string
  email: string
  avatar_url: string | null
  role: 'owner' | 'manager' | 'editor'
}

interface Team {
  id: number
  nom: string
  description: string | null
  role: 'owner' | 'manager' | 'editor'
  est_proprietaire: boolean
  nb_membres: number
}

interface TeamDetail extends Team {
  membres: TeamMembre[]
  invitations_en_attente: { id: number; email: string; role: string; expires_at: string }[]
}

// ── Labels ────────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  owner: 'Propriétaire',
  manager: 'Manager',
  editor: 'Éditeur',
}

const ROLE_COULEUR: Record<string, string> = {
  owner: 'bg-primary text-white',
  manager: 'bg-amber-100 text-amber-800',
  editor: 'bg-surface-alt text-text-secondary',
}

// ── Sous-composant : détail d'une équipe ──────────────────────────────────────

function DetailEquipe({ team, onRetour, onMaj }: { team: TeamDetail; onRetour: () => void; onMaj: () => void }) {
  const [emailInvit,  setEmailInvit]  = useState('')
  const [roleInvit,   setRoleInvit]   = useState('editor')
  const [envoi,       setEnvoi]       = useState(false)
  const [msgInvit,    setMsgInvit]    = useState<string | null>(null)
  const [modaleRetrait, setModaleRetrait] = useState<TeamMembre | null>(null)
  const [enRetrait,   setEnRetrait]   = useState(false)
  const [quitterModal, setQuitterModal] = useState(false)
  const [enQuitter,   setEnQuitter]   = useState(false)
  const [supprimerModal, setSupprimerModal] = useState(false)
  const [enSupprimer,    setEnSupprimer]    = useState(false)

  async function inviter(e: FormEvent) {
    e.preventDefault()
    setEnvoi(true)
    setMsgInvit(null)
    try {
      await api.post(`/teams/${team.id}/inviter`, { email: emailInvit.trim(), role: roleInvit })
      setMsgInvit(`Invitation envoyée à ${emailInvit.trim()}`)
      setEmailInvit('')
      onMaj()
    } catch (err: any) {
      setMsgInvit(err.response?.data?.message ?? 'Erreur lors de l\'invitation.')
    } finally { setEnvoi(false) }
  }

  async function retirerMembre() {
    if (!modaleRetrait) return
    setEnRetrait(true)
    try {
      await api.post(`/teams/${team.id}/membres/${modaleRetrait.id}/retirer`)
      setModaleRetrait(null)
      onMaj()
    } finally { setEnRetrait(false) }
  }

  async function quitterEquipe() {
    setEnQuitter(true)
    try {
      await api.post(`/teams/${team.id}/quitter`)
      setQuitterModal(false)
      onRetour()
    } finally { setEnQuitter(false) }
  }

  async function supprimerEquipe() {
    setEnSupprimer(true)
    try {
      await api.delete(`/teams/${team.id}`)
      setSupprimerModal(false)
      onRetour()
    } finally { setEnSupprimer(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5">
        <button onClick={onRetour} className="hover:text-primary">Mes équipes</button>
        <span>/</span>
        <span className="text-text-primary">{team.nom}</span>
      </div>

      {/* Entête équipe */}
      <div className="bg-white border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-text-primary text-base">{team.nom}</h2>
            {team.description && <p className="text-sm text-text-secondary mt-0.5">{team.description}</p>}
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${ROLE_COULEUR[team.role]}`}>
            {ROLE_LABEL[team.role]}
          </span>
        </div>
        {!team.est_proprietaire ? (
          <button onClick={() => setQuitterModal(true)}
            className="mt-4 text-xs text-red-500 hover:underline">
            Quitter cette équipe
          </button>
        ) : (
          <button onClick={() => setSupprimerModal(true)}
            className="mt-4 text-xs text-red-500 hover:underline">
            Supprimer cette équipe
          </button>
        )}
      </div>

      {/* Membres */}
      <div className="bg-white border border-border rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">
          Membres ({team.membres.length})
        </h3>
        <div className="space-y-3">
          {team.membres.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0 overflow-hidden">
                {m.avatar_url
                  ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-primary text-sm font-semibold">{m.nom.charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{m.nom}</p>
                <p className="text-xs text-text-muted truncate">{m.email}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${ROLE_COULEUR[m.role]}`}>
                {ROLE_LABEL[m.role]}
              </span>
              {team.est_proprietaire && m.role !== 'owner' && (
                <button onClick={() => setModaleRetrait(m)}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-red-300 hover:text-red-500 shrink-0 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invitations en attente */}
      {team.est_proprietaire && team.invitations_en_attente.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Invitations en attente ({team.invitations_en_attente.length})
          </h3>
          <div className="space-y-2">
            {team.invitations_en_attente.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-2">
                <p className="text-sm text-text-secondary truncate">{inv.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${ROLE_COULEUR[inv.role]}`}>
                  {ROLE_LABEL[inv.role]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulaire invitation */}
      {team.est_proprietaire && (
        <div className="bg-white border border-border rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Inviter un membre</h3>
          <form onSubmit={inviter} className="space-y-3">
            <Champ label="Email" value={emailInvit} onChange={setEmailInvit} type="email" required placeholder="nom@exemple.com" />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Rôle</label>
              <select value={roleInvit} onChange={(e) => setRoleInvit(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="editor">Éditeur — peut modifier les fiches existantes</option>
                <option value="manager">Manager — peut créer et gérer toutes les fiches</option>
              </select>
            </div>
            {msgInvit && (
              <p className={`text-sm ${msgInvit.startsWith('Invitation') ? 'text-green-600' : 'text-red-600'}`}>
                {msgInvit}
              </p>
            )}
            <BoutonSoumettre enCours={envoi} texte="Envoyer l'invitation" texteEnCours="Envoi…" />
          </form>
        </div>
      )}

      {/* Modale retrait membre */}
      <Modal ouvert={!!modaleRetrait} onFermer={() => setModaleRetrait(null)} titre="Retirer ce membre">
        <p className="text-sm text-text-secondary mb-5">
          Retirer <strong>{modaleRetrait?.nom}</strong> de l'équipe ? Il n'aura plus accès aux fiches.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setModaleRetrait(null)} disabled={enRetrait}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary disabled:opacity-50">
            Annuler
          </button>
          <button onClick={retirerMembre} disabled={enRetrait}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60">
            {enRetrait ? 'Retrait…' : 'Retirer'}
          </button>
        </div>
      </Modal>

      {/* Modale quitter */}
      <Modal ouvert={quitterModal} onFermer={() => setQuitterModal(false)} titre="Quitter l'équipe">
        <p className="text-sm text-text-secondary mb-5">
          Vous allez quitter l'équipe <strong>{team.nom}</strong>. Vous n'aurez plus accès à ses fiches.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setQuitterModal(false)} disabled={enQuitter}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary disabled:opacity-50">
            Annuler
          </button>
          <button onClick={quitterEquipe} disabled={enQuitter}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60">
            {enQuitter ? 'Départ…' : 'Quitter'}
          </button>
        </div>
      </Modal>

      {/* Modale supprimer équipe */}
      <Modal ouvert={supprimerModal} onFermer={() => setSupprimerModal(false)} titre="Supprimer l'équipe">
        <p className="text-sm text-text-secondary mb-5">
          Supprimer définitivement <strong>{team.nom}</strong> ? Tous les membres perdront leur accès. Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setSupprimerModal(false)} disabled={enSupprimer}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary disabled:opacity-50">
            Annuler
          </button>
          <button onClick={supprimerEquipe} disabled={enSupprimer}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60">
            {enSupprimer ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function Teams() {
  const [teams,         setTeams]         = useState<Team[] | null>(null)
  const [teamDetail,    setTeamDetail]    = useState<TeamDetail | null>(null)
  const [erreur,        setErreur]        = useState<string | null>(null)
  const [creerModal,    setCreerModal]    = useState(false)
  const [nom,           setNom]           = useState('')
  const [description,   setDesc]          = useState('')
  const [creation,      setCreation]      = useState(false)
  const [errCreation,   setErrCreation]   = useState<string | null>(null)

  function charger() {
    setErreur(null)
    api.get('/teams')
      .then(({ data }) => setTeams(data.data ?? []))
      .catch(() => setErreur('Impossible de charger vos équipes.'))
  }

  function ouvrirDetail(team: Team) {
    api.get(`/teams/${team.id}`)
      .then(({ data }) => setTeamDetail(data.data))
      .catch(() => {})
  }

  useEffect(() => { charger() }, [])

  async function creerEquipe(e: FormEvent) {
    e.preventDefault()
    setErrCreation(null)
    if (!nom.trim()) { setErrCreation('Le nom est obligatoire.'); return }
    setCreation(true)
    try {
      await api.post('/teams', { nom: nom.trim(), description: description.trim() || null })
      setCreerModal(false)
      setNom('')
      setDesc('')
      charger()
    } catch { setErrCreation('Impossible de créer l\'équipe.') }
    finally { setCreation(false) }
  }

  if (teamDetail) {
    return (
      <Layout>
        <DetailEquipe
          team={teamDetail}
          onRetour={() => { setTeamDetail(null); charger() }}
          onMaj={() => ouvrirDetail(teamDetail)}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-text-primary">Mes équipes</h1>
        <button onClick={() => setCreerModal(true)}
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors">
          + Nouvelle équipe
        </button>
      </div>

      {erreur && <p className="text-sm text-red-600 mb-4">{erreur}</p>}

      {!teams ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-2xl p-4 flex gap-4 animate-pulse">
              <div className="flex-1 space-y-2"><div className="h-4 bg-surface-alt rounded w-1/3" /><div className="h-3 bg-surface-alt rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-text-secondary mb-3">
            Aucune équipe pour le moment. Créez-en une pour partager la gestion de vos fiches.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map((t) => (
            <button key={t.id} onClick={() => ouvrirDetail(t)}
              className="w-full bg-white border border-border rounded-2xl p-4 flex items-center gap-3 text-left hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{t.nom.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary truncate">{t.nom}</p>
                <p className="text-xs text-text-secondary">{t.nb_membres} membre{t.nb_membres > 1 ? 's' : ''}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${ROLE_COULEUR[t.role]}`}>
                {ROLE_LABEL[t.role]}
              </span>
              <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Modale créer équipe */}
      <Modal ouvert={creerModal} onFermer={() => setCreerModal(false)} titre="Nouvelle équipe">
        <form onSubmit={creerEquipe} className="space-y-4">
          <Champ label="Nom de l'équipe" value={nom} onChange={setNom} required
            placeholder="Hôtel des Savanes, Restaurant Ivoire…" />
          <ChampTextarea label="Description (optionnel)" value={description} onChange={setDesc}
            placeholder="Décrivez l'activité de votre équipe…" rows={3} />
          {errCreation && <p className="text-sm text-red-600">{errCreation}</p>}
          <BoutonSoumettre enCours={creation} texte="Créer l'équipe" texteEnCours="Création…" />
        </form>
      </Modal>
    </Layout>
  )
}
