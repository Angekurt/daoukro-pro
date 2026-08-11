import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Layout from '../components/Layout'
import { ModaleSuppression } from '../components/Modal'
import { api } from '../lib/api'

// ── Types ────────────────────────────────────────────────────────────────────

interface FicheBase {
  id: number
  is_active: boolean
  photo_url: string | null
  created_at: string
}
interface FicheArtisan    extends FicheBase { nom: string; metier: string }
interface FicheHebergement extends FicheBase { nom: string; type: string; prix_min: number | null }
interface FicheImmobilier  extends FicheBase { titre: string; type_offre: string; type_bien: string; prix: number }
interface FicheAnnonce     extends FicheBase { titre: string; type: string }

interface Avis {
  id: number
  nom: string
  note: number
  commentaire: string | null
  created_at: string
}

interface Contact {
  id: number
  nom: string
  telephone: string | null
  message: string | null
  created_at: string
  fiche_type: string
  fiche_nom: string
}

type Onglet = 'artisans' | 'hebergements' | 'immobilier' | 'annonces'

// ── Config onglets ────────────────────────────────────────────────────────────

const ONGLETS: { id: Onglet; label: string; route: string; endpoint: string }[] = [
  { id: 'artisans',     label: 'Artisans',     route: '/nouvelle-fiche/artisan',     endpoint: '/mes-soumissions/artisans' },
  { id: 'hebergements', label: 'Hébergements', route: '/nouvelle-fiche/hebergement', endpoint: '/mes-soumissions/hebergements' },
  { id: 'immobilier',   label: 'Immobilier',   route: '/nouvelle-fiche/immobilier',  endpoint: '/mes-soumissions/immobilier' },
  { id: 'annonces',     label: 'Annonces',     route: '/nouvelle-fiche/annonce',     endpoint: '/mes-soumissions/annonces' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function badgeStatut(actif: boolean) {
  return actif
    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
}

function etoiles(note: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < note ? 'text-amber-400' : 'text-border'}>&#9733;</span>
  ))
}

/** Regroupe une liste par mois (6 derniers) pour les graphiques */
function parMois(items: { created_at: string }[]) {
  const now = new Date()
  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return {
      label: d.toLocaleString('fr', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0,
    }
  })
  items.forEach((item) => {
    const d = new Date(item.created_at)
    const slot = mois.find((m) => m.year === d.getFullYear() && m.month === d.getMonth())
    if (slot) slot.total++
  })
  return mois.map(({ label, total }) => ({ label, total }))
}

// ── Composants UI de base ─────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface-alt rounded-xl ${className}`} />
}

function CarteStat({
  label,
  valeur,
  detail,
}: {
  label: string
  valeur: string | number
  detail?: string
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-text-primary">{valeur}</p>
      {detail && <p className="text-xs text-text-secondary mt-0.5">{detail}</p>}
    </div>
  )
}

function SectionTitre({ titre, action }: { titre: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-text-primary">{titre}</h2>
      {action}
    </div>
  )
}

function Avatar({ nom, photoUrl, taille = 10 }: { nom: string; photoUrl: string | null; taille?: number }) {
  const cls = `w-${taille} h-${taille} rounded-xl bg-primary-light flex items-center justify-center overflow-hidden shrink-0`
  return (
    <div className={cls}>
      {photoUrl
        ? <img src={photoUrl} alt={nom} className="w-full h-full object-cover" />
        : <span className="text-primary font-semibold text-sm">{nom.charAt(0).toUpperCase()}</span>}
    </div>
  )
}



// ── Section KPI + graphiques ──────────────────────────────────────────────────

function SectionKpi({
  fiches,
  avis,
  contacts,
}: {
  fiches: FicheBase[]
  avis: Avis[]
  contacts: Contact[]
}) {
  const publiees  = fiches.filter((f) => f.is_active).length
  const enAttente = fiches.length - publiees
  const noteAvg   = avis.length
    ? (avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1)
    : '—'

  const donneesParMois    = parMois(fiches)
  const donneesContacts   = parMois(contacts)

  return (
    <div className="space-y-5">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CarteStat label="Total fiches"    valeur={fiches.length} />
        <CarteStat label="Publiées"        valeur={publiees}     detail={`${enAttente} en attente`} />
        <CarteStat label="Avis reçus"      valeur={avis.length} />
        <CarteStat label="Note moyenne"    valeur={noteAvg}      detail={avis.length ? `sur ${avis.length} avis` : 'Aucun avis'} />
      </div>

      {/* Graphique soumissions */}
      <div className="bg-white border border-border rounded-2xl p-4">
        <SectionTitre titre="Fiches soumises — 6 derniers mois" />
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={donneesParMois} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFiches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} />
            <Area type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} fill="url(#colorFiches)" name="Fiches" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique contacts */}
      {contacts.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-4">
          <SectionTitre titre="Contacts reçus — 6 derniers mois" />
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={donneesContacts} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} />
              <Bar dataKey="total" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} name="Contacts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

// ── Section Avis ──────────────────────────────────────────────────────────────

function SectionAvis({ avis, chargement }: { avis: Avis[]; chargement: boolean }) {
  if (chargement) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
      </div>
    )
  }
  if (!avis.length) {
    return (
      <div className="bg-white border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary">Aucun avis pour le moment.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {avis.slice(0, 5).map((a) => (
        <div key={a.id} className="bg-white border border-border rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-text-primary">{a.nom}</p>
              <div className="flex text-sm mt-0.5">{etoiles(a.note)}</div>
            </div>
            <p className="text-xs text-text-muted shrink-0">
              {new Date(a.created_at).toLocaleDateString('fr')}
            </p>
          </div>
          {a.commentaire && (
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{a.commentaire}</p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Section Contacts ──────────────────────────────────────────────────────────

function SectionContacts({ contacts, chargement }: { contacts: Contact[]; chargement: boolean }) {
  if (chargement) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
      </div>
    )
  }
  if (!contacts.length) {
    return (
      <div className="bg-white border border-border rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary">Aucun contact reçu pour le moment.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {contacts.slice(0, 10).map((c) => (
        <div key={c.id} className="bg-white border border-border rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <span className="text-primary text-sm font-semibold">{c.nom.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-text-primary truncate">{c.nom}</p>
              <p className="text-xs text-text-muted shrink-0">
                {new Date(c.created_at).toLocaleDateString('fr')}
              </p>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              {c.fiche_nom} · {c.telephone ?? 'Pas de tél.'}
            </p>
            {c.message && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{c.message}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Liste de fiches ───────────────────────────────────────────────────────────

type FiltreStatut = 'tout' | 'publiee' | 'attente'

function ListeFiches({ onglet }: { onglet: Onglet }) {
  const [fiches,  setFiches]  = useState<(FicheArtisan | FicheHebergement | FicheImmobilier | FicheAnnonce)[] | null>(null)
  const [erreur,  setErreur]  = useState<string | null>(null)
  const [filtre,  setFiltre]  = useState<FiltreStatut>('tout')
  const [recherche, setRecherche] = useState('')
  const [supprId,   setSupprId]   = useState<number | null>(null)
  const [enSuppr,   setEnSuppr]   = useState(false)
  const cfg = ONGLETS.find((o) => o.id === onglet)!

  const charger = useCallback(() => {
    setFiches(null)
    setErreur(null)
    api.get(cfg.endpoint)
      .then(({ data }) => setFiches(data.data ?? data))
      .catch(() => setErreur('Impossible de charger vos fiches.'))
  }, [cfg.endpoint])

  useEffect(() => { charger() }, [charger])

  async function supprimer(id: number) {
    setEnSuppr(true)
    try {
      await api.delete(`/mes-soumissions/${onglet}/${id}`)
      charger()
    } catch { /* silencieux */ }
    finally { setEnSuppr(false); setSupprId(null) }
  }

  if (erreur) return <p className="text-sm text-red-600 py-2">{erreur}</p>

  if (!fiches) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-4 flex gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-surface-alt shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 bg-surface-alt rounded w-1/3" />
              <div className="h-3 bg-surface-alt rounded w-1/2" />
            </div>
            <div className="w-20 h-6 bg-surface-alt rounded-full self-center" />
          </div>
        ))}
      </div>
    )
  }

  // Filtres
  const fichesFiltrees = fiches
    .filter((f) => filtre === 'tout' || (filtre === 'publiee' ? f.is_active : !f.is_active))
    .filter((f) => {
      const nom = ('nom' in f ? f.nom : f.titre).toLowerCase()
      return nom.includes(recherche.toLowerCase())
    })

  const nomFicheSuppr = supprId
    ? (() => { const f = fiches.find((x) => x.id === supprId); return f ? ('nom' in f ? f.nom : f.titre) : '' })()
    : ''

  return (
    <>
      {/* Barre de recherche + filtres */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
        </div>
        <div className="flex gap-1 bg-surface-alt border border-border rounded-xl p-1 shrink-0">
          {(['tout', 'publiee', 'attente'] as FiltreStatut[]).map((f) => (
            <button key={f} onClick={() => setFiltre(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filtre === f ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
              }`}>
              {f === 'tout' ? 'Tout' : f === 'publiee' ? 'Publiées' : 'En attente'}
            </button>
          ))}
        </div>
      </div>

      {fichesFiltrees.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-text-secondary">
            {recherche || filtre !== 'tout'
              ? 'Aucune fiche ne correspond à votre recherche.'
              : <>Aucune fiche pour le moment. <Link to={cfg.route} className="text-primary font-medium hover:underline">Créer la première</Link></>
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fichesFiltrees.map((f) => {
            const nom = 'nom' in f ? f.nom : f.titre
            const sousTexte =
              onglet === 'artisans'     ? (f as FicheArtisan).metier
              : onglet === 'hebergements' ? `${(f as FicheHebergement).type}${(f as FicheHebergement).prix_min ? ` · ${(f as FicheHebergement).prix_min?.toLocaleString()} F` : ''}`
              : onglet === 'immobilier'   ? `${(f as FicheImmobilier).type_offre} · ${(f as FicheImmobilier).type_bien} · ${(f as FicheImmobilier).prix.toLocaleString()} F`
              : (f as FicheAnnonce).type

            return (
              <div key={f.id} className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors">
                <Link to={`/fiche/${onglet}/${f.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar nom={nom} photoUrl={f.photo_url} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{nom}</p>
                    <p className="text-sm text-text-secondary truncate capitalize">{sousTexte}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${badgeStatut(f.is_active)}`}>
                    {f.is_active ? 'Publiée' : 'En attente'}
                  </span>
                </Link>
                {/* Actions rapides */}
                <div className="flex gap-1 shrink-0 ml-1">
                  <Link to={`/fiche/${onglet}/${f.id}/modifier`}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-primary hover:text-primary transition-colors"
                    title="Modifier">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setSupprId(f.id)}
                    className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:border-red-300 hover:text-red-500 transition-colors"
                    title="Supprimer">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ModaleSuppression
        ouvert={supprId !== null}
        nomFiche={nomFicheSuppr}
        enCours={enSuppr}
        onConfirmer={() => supprId && supprimer(supprId)}
        onAnnuler={() => setSupprId(null)}
      />
    </>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function Dashboard() {
  const [onglet,   setOnglet]   = useState<Onglet>('artisans')
  const [vue,      setVue]      = useState<'fiches' | 'kpi' | 'avis' | 'contacts'>('fiches')

  // Données globales (toutes fiches confondues pour KPI)
  const [toutesLesFiches, setToutesLesFiches] = useState<FicheBase[]>([])
  const [avis,             setAvis]            = useState<Avis[]>([])
  const [contacts,         setContacts]        = useState<Contact[]>([])
  const [chargKpi,         setChargKpi]        = useState(true)

  // Chargement des données KPI au montage
  useEffect(() => {
    const endpoints = [
      '/mes-soumissions/artisans',
      '/mes-soumissions/hebergements',
      '/mes-soumissions/immobilier',
      '/mes-soumissions/annonces',
    ]
    Promise.allSettled(endpoints.map((e) => api.get(e))).then((results) => {
      const all: FicheBase[] = []
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          const data = r.value.data?.data ?? r.value.data ?? []
          if (Array.isArray(data)) all.push(...data)
        }
      })
      setToutesLesFiches(all)
    })

    // Avis et contacts (endpoints optionnels — on ne bloque pas si 404)
    api.get('/mes-avis').then(({ data }) => setAvis(data.data ?? [])).catch(() => {})
    api.get('/mes-contacts').then(({ data }) => setContacts(data.data ?? [])).catch(() => {})

    setChargKpi(false)
  }, [])

  const cfg = ONGLETS.find((o) => o.id === onglet)!

  const VUES = [
    { id: 'fiches',   label: 'Mes fiches' },
    { id: 'kpi',      label: 'Statistiques' },
    { id: 'avis',     label: 'Avis' },
    { id: 'contacts', label: 'Contacts' },
  ] as const

  return (
    <Layout>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-text-primary">Tableau de bord</h1>
        {vue === 'fiches' && (
          <Link
            to={cfg.route}
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-dark transition-colors"
          >
            + Nouveau
          </Link>
        )}
      </div>

      {/* Navigation principale */}
      <div className="flex gap-1 bg-surface-alt border border-border rounded-xl p-1 mb-5">
        {VUES.map((v) => (
          <button
            key={v.id}
            onClick={() => setVue(v.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              vue === v.id
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Vue : Fiches */}
      {vue === 'fiches' && (
        <>
          {/* Onglets type de fiche */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {ONGLETS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  onglet === o.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-border hover:border-primary/50 hover:text-text-primary'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <ListeFiches onglet={onglet} />
        </>
      )}

      {/* Vue : KPI */}
      {vue === 'kpi' && (
        chargKpi
          ? <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-48" /></div>
          : <SectionKpi fiches={toutesLesFiches} avis={avis} contacts={contacts} />
      )}

      {/* Vue : Avis */}
      {vue === 'avis' && (
        <>
          <SectionTitre titre="Avis laissés par les utilisateurs de l'app" />
          <SectionAvis avis={avis} chargement={chargKpi} />
        </>
      )}

      {/* Vue : Contacts */}
      {vue === 'contacts' && (
        <>
          <SectionTitre titre="Personnes qui ont demandé à vous contacter" />
          <SectionContacts contacts={contacts} chargement={chargKpi} />
        </>
      )}
    </Layout>
  )
}
