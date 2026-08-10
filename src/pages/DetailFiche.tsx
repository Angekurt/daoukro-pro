import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Lightbox from '../components/Lightbox'
import { ModaleSuppression } from '../components/Modal'
import { useFiche, type TypeFiche } from '../hooks/useFiche'

// ── Helpers ───────────────────────────────────────────────────────────────────

function etoiles(note: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-base ${i < note ? 'text-amber-400' : 'text-border'}`}>★</span>
  ))
}

function BadgeStatut({ actif }: { actif: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
      actif
        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${actif ? 'bg-green-500' : 'bg-amber-500'}`} />
      {actif ? 'Publiée dans l\'app' : 'En attente de validation'}
    </span>
  )
}

function LigneInfo({ label, valeur }: { label: string; valeur: string | number | undefined | null }) {
  if (!valeur && valeur !== 0) return null
  return (
    <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-text-muted shrink-0">{label}</span>
      <span className="text-sm font-medium text-text-primary text-right">{valeur}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-52 bg-surface-alt rounded-2xl" />
      <div className="h-6 bg-surface-alt rounded w-1/2" />
      <div className="h-4 bg-surface-alt rounded w-1/3" />
      <div className="h-28 bg-surface-alt rounded-2xl" />
      <div className="h-28 bg-surface-alt rounded-2xl" />
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function DetailFiche() {
  const { type, id } = useParams<{ type: TypeFiche; id: string }>()
  const navigate = useNavigate()

  const { fiche, avis, contacts, chargement, erreur, supprimer } = useFiche(
    type as TypeFiche,
    Number(id)
  )

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [modaleSuppr,   setModaleSuppr]   = useState(false)
  const [suppression,   setSuppression]   = useState(false)

  if (chargement) return <Layout><Skeleton /></Layout>
  if (erreur || !fiche) {
    return (
      <Layout>
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-text-secondary mb-4">Fiche introuvable ou inaccessible.</p>
          <Link to="/tableau-de-bord" className="text-primary text-sm font-medium hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </Layout>
    )
  }

  const nom = fiche.nom ?? fiche.titre ?? '—'
  const typeLabel: Record<string, string> = {
    artisans: 'Artisan', hebergements: 'Hébergement', immobilier: 'Immobilier', annonces: 'Annonce',
  }

  // Construire la liste de toutes les photos (couverture + galerie)
  const toutesPhotos = [
    ...(fiche.photo_url ? [fiche.photo_url] : []),
    ...(fiche.photos_galerie ?? []),
  ]

  async function confirmerSuppression() {
    setSuppression(true)
    try {
      await supprimer()
      navigate('/tableau-de-bord', { replace: true })
    } catch {
      setSuppression(false)
      setModaleSuppr(false)
    }
  }

  return (
    <Layout>
      {/* Fil d'Ariane */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
        <Link to="/tableau-de-bord" className="hover:text-primary">Tableau de bord</Link>
        <span>/</span>
        <span>{typeLabel[type ?? ''] ?? type}</span>
        <span>/</span>
        <span className="text-text-primary">{nom}</span>
      </div>

      {/* Photo de couverture + galerie */}
      {toutesPhotos.length > 0 ? (
        <div className="mb-5">
          {/* Photo principale */}
          <div
            className="w-full h-52 rounded-2xl overflow-hidden border border-border cursor-pointer mb-2"
            onClick={() => setLightboxIndex(0)}
          >
            <img
              src={toutesPhotos[0]}
              alt={nom}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Miniatures galerie */}
          {toutesPhotos.length > 1 && (
            <div className="flex gap-2">
              {toutesPhotos.slice(1).map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxIndex(i + 1)}
                  className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 hover:border-primary transition-colors"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {toutesPhotos.length > 4 && (
                <button
                  onClick={() => setLightboxIndex(4)}
                  className="w-16 h-16 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-xs font-medium text-text-secondary shrink-0"
                >
                  +{toutesPhotos.length - 4}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-32 rounded-2xl bg-surface-alt border border-border flex items-center justify-center mb-5">
          <span className="text-text-muted text-sm">Aucune photo</span>
        </div>
      )}

      {/* Titre + statut + actions */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-text-primary truncate mb-1.5">{nom}</h1>
          <BadgeStatut actif={fiche.is_active} />
        </div>
        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/fiche/${type}/${id}/modifier`}
            className="px-3 py-2 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            Modifier
          </Link>
          <button
            onClick={() => setModaleSuppr(true)}
            className="px-3 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Bloc statut — message informatif si en attente */}
      {!fiche.is_active && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-amber-800 mb-0.5">En attente de validation</p>
          <p className="text-xs text-amber-700">
            Votre fiche a bien été reçue. La mairie de Daoukro la vérifiera et la publiera dans l'app mobile
            sous 24 à 48h. Vous serez notifié par email.
          </p>
        </div>
      )}

      {/* Informations détaillées */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-4">
        <h2 className="text-sm font-semibold text-text-primary mb-2">Informations</h2>
        {/* Champs communs */}
        {fiche.description && (
          <div className="py-2.5 border-b border-border">
            <p className="text-xs text-text-muted mb-1">Description</p>
            <p className="text-sm text-text-secondary leading-relaxed">{fiche.description}</p>
          </div>
        )}
        <LigneInfo label="Métier"         valeur={fiche.metier} />
        <LigneInfo label="Adresse"        valeur={fiche.adresse} />
        <LigneInfo label="Quartier"       valeur={fiche.quartier} />
        <LigneInfo label="Téléphone"      valeur={fiche.telephone} />
        <LigneInfo label="WhatsApp"       valeur={fiche.whatsapp} />
        <LigneInfo label="Type"           valeur={fiche.type} />
        <LigneInfo label="Type d'offre"   valeur={fiche.type_offre} />
        <LigneInfo label="Type de bien"   valeur={fiche.type_bien} />
        <LigneInfo label="Prix"           valeur={fiche.prix ? `${fiche.prix.toLocaleString()} F CFA` : undefined} />
        <LigneInfo label="Prix min/nuit"  valeur={fiche.prix_min ? `${fiche.prix_min.toLocaleString()} F CFA` : undefined} />
        <LigneInfo label="Prix max/nuit"  valeur={fiche.prix_max ? `${fiche.prix_max.toLocaleString()} F CFA` : undefined} />
        <LigneInfo label="Surface"        valeur={fiche.surface ? `${fiche.surface} m²` : undefined} />
        <LigneInfo label="Chambres"       valeur={fiche.nb_chambres} />
        <LigneInfo label="Lieu"           valeur={fiche.lieu} />
        <LigneInfo label="Date début"     valeur={fiche.date_debut} />
        <LigneInfo label="Date fin"       valeur={fiche.date_fin} />
        <LigneInfo label="Email"          valeur={fiche.email} />
        <LigneInfo label="Lien"           valeur={fiche.lien} />
        <LigneInfo
          label="Soumise le"
          valeur={new Date(fiche.created_at).toLocaleDateString('fr', { day: 'numeric', month: 'long', year: 'numeric' })}
        />
      </div>

      {/* Avis */}
      <div className="bg-white border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">Avis</h2>
          <span className="text-xs text-text-muted">{avis.length} avis</span>
        </div>
        {avis.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">Aucun avis pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {avis.map((a) => (
              <div key={a.id} className="pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{a.nom}</p>
                    <div className="flex mt-0.5">{etoiles(a.note)}</div>
                  </div>
                  <span className="text-xs text-text-muted shrink-0">
                    {new Date(a.created_at).toLocaleDateString('fr')}
                  </span>
                </div>
                {a.commentaire && (
                  <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{a.commentaire}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique contacts */}
      {contacts.length > 0 && (
        <div className="bg-white border border-border rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Contacts reçus</h2>
            <span className="text-xs text-text-muted">{contacts.length} contact{contacts.length > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-semibold">
                    {c.nom.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">{c.nom}</p>
                    <span className="text-xs text-text-muted shrink-0">
                      {new Date(c.created_at).toLocaleDateString('fr')}
                    </span>
                  </div>
                  {c.telephone && (
                    <p className="text-xs text-text-secondary">{c.telephone}</p>
                  )}
                  {c.message && (
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{c.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={toutesPhotos}
          indexInitial={lightboxIndex}
          onFermer={() => setLightboxIndex(null)}
        />
      )}

      {/* Modale suppression */}
      <ModaleSuppression
        ouvert={modaleSuppr}
        nomFiche={nom}
        enCours={suppression}
        onConfirmer={confirmerSuppression}
        onAnnuler={() => setModaleSuppr(false)}
      />
    </Layout>
  )
}
