import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import { useModifierFiche } from '../hooks/useModifierFiche'

const TYPES = [
  { value: 'hotel',     label: 'Hôtel' },
  { value: 'residence', label: 'Résidence' },
  { value: 'meuble',    label: 'Meublé' },
]

function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 bg-surface-alt rounded w-1/4" />
          <div className="h-10 bg-surface-alt rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function ModifierHebergement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fiche, chargement, erreur: errCharge, enregistrer } = useModifierFiche('hebergements', Number(id))

  const [nom,       setNom]       = useState('')
  const [type,      setType]      = useState('hotel')
  const [desc,      setDesc]      = useState('')
  const [adresse,   setAdresse]   = useState('')
  const [telephone, setTelephone] = useState('')
  const [prixMin,   setPrixMin]   = useState('')
  const [prixMax,   setPrixMax]   = useState('')
  const [photo,     setPhoto]     = useState<File | null>(null)
  const [galerie,   setGalerie]   = useState<File[]>([])
  const [enCours,   setEnCours]   = useState(false)
  const [erreur,    setErreur]    = useState<string | null>(null)

  useEffect(() => {
    if (!fiche) return
    setNom(fiche.nom ?? '')
    setType(fiche.type ?? 'hotel')
    setDesc(fiche.description ?? '')
    setAdresse(fiche.adresse ?? '')
    setTelephone(fiche.telephone ?? '')
    setPrixMin(fiche.prix_min?.toString() ?? '')
    setPrixMax(fiche.prix_max?.toString() ?? '')
  }, [fiche])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (!nom.trim()) { setErreur('Le nom est obligatoire.'); return }
    const d = new FormData()
    d.append('nom', nom.trim())
    d.append('type', type)
    if (desc.trim())      d.append('description', desc.trim())
    if (adresse.trim())   d.append('adresse', adresse.trim())
    if (telephone.trim()) d.append('telephone', telephone.trim())
    if (prixMin.trim())   d.append('prix_min', prixMin.trim())
    if (prixMax.trim())   d.append('prix_max', prixMax.trim())
    if (photo)            d.append('photo', photo)
    galerie.forEach((f, i) => d.append(`photos[${i}]`, f))
    setEnCours(true)
    try {
      await enregistrer(d)
      navigate(`/fiche/hebergements/${id}`, { replace: true })
    } catch { setErreur("Impossible d'enregistrer. Réessayez.") }
    finally { setEnCours(false) }
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5">
        <Link to="/tableau-de-bord" className="hover:text-primary">Tableau de bord</Link>
        <span>/</span>
        <Link to={`/fiche/hebergements/${id}`} className="hover:text-primary">Hébergement</Link>
        <span>/</span>
        <span className="text-text-primary">Modifier</span>
      </div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-text-primary mb-1">Modifier l'hébergement</h1>
        <p className="text-sm text-text-secondary">Les modifications seront re-validées par la mairie.</p>
      </div>
      {chargement ? <SkeletonForm /> : errCharge ? (
        <p className="text-sm text-red-600">{errCharge}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
          <Champ label="Nom de l'établissement" value={nom} onChange={setNom} required />
          <ChampSelect label="Type d'hébergement" value={type} onChange={setType} options={TYPES} required />
          <ChampTextarea label="Description" value={desc} onChange={setDesc} placeholder="Équipements, services…" />
          <Champ label="Adresse / Quartier" value={adresse} onChange={setAdresse} />
          <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Prix par nuit (F CFA)</p>
            <div className="grid grid-cols-2 gap-4">
              <Champ label="À partir de" value={prixMin} onChange={setPrixMin} type="number" />
              <Champ label="Jusqu'à"     value={prixMax} onChange={setPrixMax} type="number" />
            </div>
          </div>
          {fiche?.photo_url && !photo && (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Photo actuelle</p>
              <div className="w-full h-36 rounded-2xl overflow-hidden border border-border">
                <img src={fiche.photo_url} alt="actuelle" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <ChampPhoto onChange={setPhoto} valeur={photo} label={fiche?.photo_url ? 'Remplacer la photo' : 'Photo de couverture'} />
          <GaleriePhotos valeurs={galerie} onChange={setGalerie} label="Nouvelles photos galerie" />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <BoutonSoumettre enCours={enCours} texte="Enregistrer les modifications" texteEnCours="Enregistrement…" />
        </form>
      )}
    </Layout>
  )
}
