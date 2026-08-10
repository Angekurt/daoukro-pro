import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import { useModifierFiche } from '../hooks/useModifierFiche'

const TYPES_ANNONCE = [
  { value: 'annonce',    label: 'Annonce générale' },
  { value: 'evenement',  label: 'Événement' },
  { value: 'emploi',     label: "Offre d'emploi" },
  { value: 'restaurant', label: 'Restaurant / Maquis' },
  { value: 'pub',        label: 'Publicité' },
]

function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 bg-surface-alt rounded w-1/4" />
          <div className="h-10 bg-surface-alt rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function ModifierAnnonce() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fiche, chargement, erreur: errCharge, enregistrer } = useModifierFiche('annonces', Number(id))

  const [titre,     setTitre]     = useState('')
  const [type,      setType]      = useState('annonce')
  const [desc,      setDesc]      = useState('')
  const [lieu,      setLieu]      = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin,   setDateFin]   = useState('')
  const [telephone, setTelephone] = useState('')
  const [email,     setEmail]     = useState('')
  const [lien,      setLien]      = useState('')
  const [photo,     setPhoto]     = useState<File | null>(null)
  const [galerie,   setGalerie]   = useState<File[]>([])
  const [enCours,   setEnCours]   = useState(false)
  const [erreur,    setErreur]    = useState<string | null>(null)

  useEffect(() => {
    if (!fiche) return
    setTitre(fiche.titre ?? '')
    setType(fiche.type ?? 'annonce')
    setDesc(fiche.description ?? '')
    setLieu(fiche.lieu ?? '')
    setDateDebut(fiche.date_debut ?? '')
    setDateFin(fiche.date_fin ?? '')
    setTelephone(fiche.telephone ?? '')
    setEmail(fiche.email ?? '')
    setLien(fiche.lien ?? '')
  }, [fiche])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (!titre.trim())   { setErreur('Le titre est obligatoire.'); return }
    if (!desc.trim())    { setErreur('La description est obligatoire.'); return }
    const d = new FormData()
    d.append('titre', titre.trim())
    d.append('type', type)
    d.append('description', desc.trim())
    if (lieu.trim())      d.append('lieu', lieu.trim())
    if (dateDebut)        d.append('date_debut', dateDebut)
    if (dateFin)          d.append('date_fin', dateFin)
    if (telephone.trim()) d.append('telephone', telephone.trim())
    if (email.trim())     d.append('email', email.trim())
    if (lien.trim())      d.append('lien', lien.trim())
    if (photo)            d.append('photo', photo)
    galerie.forEach((f, i) => d.append(`photos[${i}]`, f))
    setEnCours(true)
    try {
      await enregistrer(d)
      navigate(`/fiche/annonces/${id}`, { replace: true })
    } catch { setErreur("Impossible d'enregistrer. Réessayez.") }
    finally { setEnCours(false) }
  }

  const estEvenement = type === 'evenement'

  return (
    <Layout>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5">
        <Link to="/tableau-de-bord" className="hover:text-primary">Tableau de bord</Link>
        <span>/</span>
        <Link to={`/fiche/annonces/${id}`} className="hover:text-primary">Annonce</Link>
        <span>/</span>
        <span className="text-text-primary">Modifier</span>
      </div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-text-primary mb-1">Modifier l'annonce</h1>
        <p className="text-sm text-text-secondary">Les modifications seront re-validées par la mairie.</p>
      </div>
      {chargement ? <SkeletonForm /> : errCharge ? (
        <p className="text-sm text-red-600">{errCharge}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
          <ChampSelect label="Catégorie" value={type} onChange={setType} options={TYPES_ANNONCE} required />
          <Champ label="Titre" value={titre} onChange={setTitre} required />
          <ChampTextarea label="Description" value={desc} onChange={setDesc} required rows={4} />
          <Champ label="Lieu" value={lieu} onChange={setLieu} />
          <div className="grid grid-cols-2 gap-4">
            <Champ label={estEvenement ? 'Date de début' : 'Date début'} value={dateDebut} onChange={setDateDebut} type="date" />
            <Champ label={estEvenement ? 'Date de fin' : 'Date fin'}     value={dateFin}   onChange={setDateFin}   type="date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
            <Champ label="Email"     value={email}     onChange={setEmail}     type="email" />
          </div>
          <Champ label="Lien" value={lien} onChange={setLien} type="url" placeholder="https://..." />
          {fiche?.photo_url && !photo && (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Photo actuelle</p>
              <div className="w-full h-36 rounded-2xl overflow-hidden border border-border">
                <img src={fiche.photo_url} alt="actuelle" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <ChampPhoto onChange={setPhoto} valeur={photo} label={fiche?.photo_url ? 'Remplacer la photo' : 'Photo principale'} />
          <GaleriePhotos valeurs={galerie} onChange={setGalerie} label="Nouvelles photos galerie" />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <BoutonSoumettre enCours={enCours} texte="Enregistrer les modifications" texteEnCours="Enregistrement…" />
        </form>
      )}
    </Layout>
  )
}
