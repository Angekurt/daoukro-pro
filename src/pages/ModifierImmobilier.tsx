import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import { useModifierFiche } from '../hooks/useModifierFiche'

const TYPES_OFFRE = [{ value: 'vente', label: 'Vente' }, { value: 'location', label: 'Location' }]
const TYPES_BIEN  = [
  { value: 'maison', label: 'Maison' }, { value: 'appartement', label: 'Appartement' },
  { value: 'villa',  label: 'Villa' },  { value: 'terrain',      label: 'Terrain' },
]

function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 bg-surface-alt rounded w-1/4" />
          <div className="h-10 bg-surface-alt rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function ModifierImmobilier() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fiche, chargement, erreur: errCharge, enregistrer } = useModifierFiche('immobilier', Number(id))

  const [titre,      setTitre]     = useState('')
  const [typeOffre,  setTypeOffre] = useState('vente')
  const [typeBien,   setTypeBien]  = useState('maison')
  const [desc,       setDesc]      = useState('')
  const [adresse,    setAdresse]   = useState('')
  const [quartier,   setQuartier]  = useState('')
  const [prix,       setPrix]      = useState('')
  const [surface,    setSurface]   = useState('')
  const [nbChambres, setNbCh]      = useState('')
  const [telephone,  setTelephone] = useState('')
  const [photo,      setPhoto]     = useState<File | null>(null)
  const [galerie,    setGalerie]   = useState<File[]>([])
  const [enCours,    setEnCours]   = useState(false)
  const [erreur,     setErreur]    = useState<string | null>(null)

  useEffect(() => {
    if (!fiche) return
    setTitre(fiche.titre ?? '')
    setTypeOffre(fiche.type_offre ?? 'vente')
    setTypeBien(fiche.type_bien ?? 'maison')
    setDesc(fiche.description ?? '')
    setAdresse(fiche.adresse ?? '')
    setQuartier(fiche.quartier ?? '')
    setPrix(fiche.prix?.toString() ?? '')
    setSurface(fiche.surface?.toString() ?? '')
    setNbCh(fiche.nb_chambres?.toString() ?? '')
    setTelephone(fiche.telephone ?? '')
  }, [fiche])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (!titre.trim()) { setErreur('Le titre est obligatoire.'); return }
    if (!prix || isNaN(Number(prix))) { setErreur('Le prix est obligatoire.'); return }
    const d = new FormData()
    d.append('titre', titre.trim())
    d.append('type_offre', typeOffre)
    d.append('type_bien', typeBien)
    d.append('prix', prix)
    if (desc.trim())      d.append('description', desc.trim())
    if (adresse.trim())   d.append('adresse', adresse.trim())
    if (quartier.trim())  d.append('quartier', quartier.trim())
    if (surface.trim())   d.append('surface', surface)
    if (nbChambres.trim()) d.append('nb_chambres', nbChambres)
    if (telephone.trim()) d.append('telephone', telephone.trim())
    if (photo)            d.append('photo', photo)
    galerie.forEach((f, i) => d.append(`photos[${i}]`, f))
    setEnCours(true)
    try {
      await enregistrer(d)
      navigate(`/fiche/immobilier/${id}`, { replace: true })
    } catch { setErreur("Impossible d'enregistrer. Réessayez.") }
    finally { setEnCours(false) }
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5">
        <Link to="/tableau-de-bord" className="hover:text-primary">Tableau de bord</Link>
        <span>/</span>
        <Link to={`/fiche/immobilier/${id}`} className="hover:text-primary">Bien immobilier</Link>
        <span>/</span>
        <span className="text-text-primary">Modifier</span>
      </div>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-text-primary mb-1">Modifier le bien immobilier</h1>
        <p className="text-sm text-text-secondary">Les modifications seront re-validées par la mairie.</p>
      </div>
      {chargement ? <SkeletonForm /> : errCharge ? (
        <p className="text-sm text-red-600">{errCharge}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
          <Champ label="Titre" value={titre} onChange={setTitre} required placeholder="Villa 4 pièces…" />
          <div className="grid grid-cols-2 gap-4">
            <ChampSelect label="Type d'offre" value={typeOffre} onChange={setTypeOffre} options={TYPES_OFFRE} required />
            <ChampSelect label="Type de bien" value={typeBien}  onChange={setTypeBien}  options={TYPES_BIEN}  required />
          </div>
          <ChampTextarea label="Description" value={desc} onChange={setDesc} placeholder="État du bien…" />
          <div className="grid grid-cols-2 gap-4">
            <Champ label="Adresse"  value={adresse}  onChange={setAdresse} />
            <Champ label="Quartier" value={quartier} onChange={setQuartier} />
          </div>
          <Champ label="Prix (F CFA)" value={prix} onChange={setPrix} type="number" required />
          <div className="grid grid-cols-2 gap-4">
            <Champ label="Surface (m²)"    value={surface}    onChange={setSurface}   type="number" />
            <Champ label="Nb. de chambres" value={nbChambres} onChange={setNbCh}      type="number" />
          </div>
          <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
          {fiche?.photo_url && !photo && (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Photo actuelle</p>
              <div className="w-full h-36 rounded-2xl overflow-hidden border border-border">
                <img src={fiche.photo_url} alt="actuelle" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <ChampPhoto onChange={setPhoto} valeur={photo} label={fiche?.photo_url ? 'Remplacer la photo' : 'Photo de couverture'} />
          <GaleriePhotos valeurs={galerie} onChange={setGalerie} label="Nouvelles photos galerie (façades, pièces…)" />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <BoutonSoumettre enCours={enCours} texte="Enregistrer les modifications" texteEnCours="Enregistrement…" />
        </form>
      )}
    </Layout>
  )
}
