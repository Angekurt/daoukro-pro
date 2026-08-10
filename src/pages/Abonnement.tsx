import { useEffect, useState, type FormEvent } from 'react'
import Layout from '../components/Layout'
import Modal from '../components/Modal'
import { Champ } from '../components/FormChamp'
import { api } from '../lib/api'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanDetails {
  id: string
  nom: string
  description: string
  prix_fcfa: number
  duree_jours: number
  quota_fiches: number
  quota_photos: number
  quota_membres: number
  mise_en_avant: boolean
  push_mensuel: number
  badge_verifie: boolean
  stats_avancees: boolean
}

interface MonPlan {
  plan: string
  plan_expire_at: string | null
  est_actif: boolean
  expire_bientot: boolean
  details: PlanDetails
  usage: { fiches_actives: number; quota_fiches: number }
}

// ── Icônes SVG légères ────────────────────────────────────────────────────────

function IcoCheck() {
  return (
    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function IcoX() {
  return (
    <svg className="w-4 h-4 text-border shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Carte plan ────────────────────────────────────────────────────────────────

function CartePlan({
  plan,
  actuel,
  onSouscrire,
}: {
  plan: PlanDetails
  actuel: string
  onSouscrire: (plan: PlanDetails) => void
}) {
  const estActuel = actuel === plan.id
  const estGratuit = plan.prix_fcfa === 0

  const features = [
    { label: `${plan.quota_fiches === -1 ? 'Fiches illimitées' : `${plan.quota_fiches} fiche${plan.quota_fiches > 1 ? 's' : ''} active${plan.quota_fiches > 1 ? 's' : ''}`}`, ok: true },
    { label: `${plan.quota_photos} photos par fiche`, ok: true },
    { label: 'Badge vérifié', ok: plan.badge_verifie },
    { label: 'Statistiques avancées', ok: plan.stats_avancees },
    { label: `${plan.quota_membres === -1 ? 'Équipe illimitée' : plan.quota_membres > 0 ? `Équipe ${plan.quota_membres} membres` : 'Compte individuel'}`, ok: plan.quota_membres !== 0 },
    { label: 'Mise en avant dans l\'app', ok: plan.mise_en_avant },
    ...(plan.push_mensuel > 0 ? [{ label: `${plan.push_mensuel} notification(s) push/mois`, ok: true }] : []),
  ]

  return (
    <div className={`bg-white border-2 rounded-2xl p-5 relative transition-shadow ${
      estActuel ? 'border-primary shadow-lg' : 'border-border hover:border-primary/40'
    }`}>
      {estActuel && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          Plan actuel
        </span>
      )}

      <div className="mb-4">
        <h3 className="font-bold text-text-primary text-base">{plan.nom}</h3>
        <p className="text-xs text-text-secondary mt-0.5">{plan.description}</p>
      </div>

      <div className="mb-4">
        {estGratuit ? (
          <p className="text-2xl font-black text-text-primary">Gratuit</p>
        ) : (
          <div>
            <span className="text-2xl font-black text-primary">
              {plan.prix_fcfa.toLocaleString('fr')} F
            </span>
            <span className="text-sm text-text-muted"> / mois</span>
          </div>
        )}
      </div>

      <ul className="space-y-2 mb-5">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-2">
            {f.ok ? <IcoCheck /> : <IcoX />}
            <span className={`text-sm ${f.ok ? 'text-text-primary' : 'text-text-muted line-through'}`}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {estGratuit || estActuel ? (
        <button disabled
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted cursor-default">
          {estActuel ? 'Plan actif' : 'Gratuit'}
        </button>
      ) : (
        <button
          onClick={() => onSouscrire(plan)}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors">
          Passer à {plan.nom}
        </button>
      )}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function Abonnement() {
  const [plans,         setPlans]         = useState<PlanDetails[]>([])
  const [monPlan,       setMonPlan]       = useState<MonPlan | null>(null)
  const [chargement,    setChargement]    = useState(true)
  const [planChoisi,    setPlanChoisi]    = useState<PlanDetails | null>(null)
  const [telephone,     setTelephone]     = useState('')
  const [paiementUrl,   setPaiementUrl]   = useState<string | null>(null)
  const [enCours,       setEnCours]       = useState(false)
  const [erreur,        setErreur]        = useState<string | null>(null)
  const [verification,  setVerification]  = useState(false)
  const [msgVerif,      setMsgVerif]      = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      api.get('/plans'),
      api.get('/mon-plan'),
    ]).then(([resPlans, resPlan]) => {
      setPlans(resPlans.data.data ?? [])
      setMonPlan(resPlan.data.data)
    }).finally(() => setChargement(false))
  }, [])

  async function initierPaiement(e: FormEvent) {
    e.preventDefault()
    if (!planChoisi || !telephone.trim()) return
    setEnCours(true)
    setErreur(null)
    try {
      const { data } = await api.post('/plans/souscrire', {
        plan_id: planChoisi.id,
        telephone: telephone.trim(),
      })
      setPaiementUrl(data.payment_url)
    } catch (err: any) {
      setErreur(err.response?.data?.message ?? 'Erreur lors de l\'initiation du paiement.')
    } finally {
      setEnCours(false)
    }
  }

  async function verifierPaiement() {
    setVerification(true)
    setMsgVerif(null)
    try {
      const { data } = await api.get('/paiements/verifier')
      if (data.statut === 'paid') {
        setMsgVerif('Paiement confirmé ! Votre plan a été activé.')
        setPlanChoisi(null)
        setPaiementUrl(null)
        // Rafraîchir le plan
        api.get('/mon-plan').then(({ data }) => setMonPlan(data.data))
      } else if (data.statut === 'pending') {
        setMsgVerif('Paiement en attente. Effectuez le paiement puis revenez vérifier.')
      } else {
        setMsgVerif('Paiement échoué ou annulé. Veuillez réessayer.')
      }
    } catch {
      setMsgVerif('Impossible de vérifier le paiement. Réessayez.')
    } finally {
      setVerification(false)
    }
  }

  if (chargement) {
    return (
      <Layout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-surface-alt rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface-alt rounded-2xl" />)}
          </div>
        </div>
      </Layout>
    )
  }

  const planActuelId = monPlan?.plan ?? 'free'

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text-primary mb-1">Abonnement</h1>
        <p className="text-sm text-text-secondary">
          Choisissez le plan adapté à votre activité. Tous les paiements via Orange Money, Wave, MTN, carte bancaire.
        </p>
      </div>

      {/* Statut plan actuel */}
      {monPlan && (
        <div className={`border rounded-2xl p-4 mb-5 ${
          monPlan.expire_bientot ? 'bg-amber-50 border-amber-200' : 'bg-primary-light border-primary/20'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${monPlan.expire_bientot ? 'text-amber-800' : 'text-primary'}`}>
                Plan {monPlan.details?.nom ?? planActuelId} actif
              </p>
              {monPlan.plan_expire_at && (
                <p className="text-xs text-text-secondary mt-0.5">
                  {monPlan.expire_bientot ? 'Expire le ' : 'Renouvellement le '}
                  {new Date(monPlan.plan_expire_at).toLocaleDateString('fr', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-text-secondary">
                {monPlan.usage.fiches_actives} / {monPlan.usage.quota_fiches === -1 ? '∞' : monPlan.usage.quota_fiches} fiches
              </p>
              <div className="w-24 h-1.5 bg-white rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: monPlan.usage.quota_fiches === -1
                      ? '20%'
                      : `${Math.min(100, (monPlan.usage.fiches_actives / monPlan.usage.quota_fiches) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Vérification paiement en attente */}
          {msgVerif ? (
            <p className={`text-sm mt-3 ${msgVerif.includes('confirmé') ? 'text-green-700' : 'text-amber-800'}`}>
              {msgVerif}
            </p>
          ) : (
            <button onClick={verifierPaiement} disabled={verification}
              className="mt-3 text-xs text-primary font-medium hover:underline disabled:opacity-50">
              {verification ? 'Vérification…' : 'Vérifier un paiement en attente'}
            </button>
          )}
        </div>
      )}

      {/* Grille des plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((p) => (
          <CartePlan key={p.id} plan={p} actuel={planActuelId} onSouscrire={setPlanChoisi} />
        ))}
      </div>

      {/* Note de bas de page */}
      <p className="text-xs text-text-muted text-center mt-5 leading-relaxed">
        Les prix sont fixés par la mairie de Daoukro et peuvent évoluer.
        Le renouvellement est manuel — aucun prélèvement automatique.
      </p>

      {/* Modale paiement */}
      <Modal
        ouvert={!!planChoisi && !paiementUrl}
        onFermer={() => { setPlanChoisi(null); setErreur(null) }}
        titre={`Passer au plan ${planChoisi?.nom}`}
      >
        {planChoisi && (
          <form onSubmit={initierPaiement} className="space-y-4">
            <div className="bg-primary-light rounded-xl p-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Plan {planChoisi.nom}</span>
                <span className="font-bold text-primary">{planChoisi.prix_fcfa.toLocaleString('fr')} F CFA</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>Durée</span>
                <span>30 jours</span>
              </div>
            </div>

            <Champ
              label="Numéro de téléphone (Orange Money, Wave, MTN…)"
              value={telephone}
              onChange={setTelephone}
              type="tel"
              required
              placeholder="07 XX XX XX XX"
            />

            <p className="text-xs text-text-muted">
              Vous serez redirigé vers la page de paiement sécurisée MoneyFusion. Validez ensuite depuis votre téléphone.
            </p>

            {erreur && <p className="text-sm text-red-600">{erreur}</p>}

            <button type="submit" disabled={enCours || !telephone.trim()}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-60 transition-opacity">
              {enCours ? 'Redirection…' : `Payer ${planChoisi.prix_fcfa.toLocaleString('fr')} F CFA`}
            </button>
          </form>
        )}
      </Modal>

      {/* Modale URL de paiement */}
      <Modal
        ouvert={!!paiementUrl}
        onFermer={() => { setPaiementUrl(null); setPlanChoisi(null) }}
        titre="Finaliser le paiement"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Cliquez sur le bouton ci-dessous pour accéder à la page de paiement sécurisée. Revenez ici après avoir validé.
          </p>
          <a
            href={paiementUrl ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-center text-sm"
          >
            Ouvrir la page de paiement
          </a>
          <button onClick={verifierPaiement} disabled={verification}
            className="w-full py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:bg-surface-alt disabled:opacity-50">
            {verification ? 'Vérification…' : 'J\'ai payé — vérifier mon paiement'}
          </button>
          {msgVerif && (
            <p className={`text-sm ${msgVerif.includes('confirmé') ? 'text-green-600' : 'text-text-secondary'}`}>
              {msgVerif}
            </p>
          )}
        </div>
      </Modal>
    </Layout>
  )
}
