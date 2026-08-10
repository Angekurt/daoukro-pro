import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { Champ, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import { useModifierFiche } from '../hooks/useModifierFiche'

function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="space-y-1.5">
          <div className="h-3.5 bg-surface-alt rounded w-1/4" />
          <div className="h-10 bg-surface-alt rounded-xl" />
        </div>
      ))}
    </div>
  )
}

export default function ModifierArtisan() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fiche, chargement, erreur: errCharge, enregistrer } = useModifierFiche('artisans', Number(id))

  const [nom,       setNom]       = useState('')
  const [metier,    setMetier]    = useState('')
  const [desc,      setDesc]      = useState('')
  const [telephone, setTelephone] = useState('')
  const [whatsapp,  setWhatsapp]  = useState('')
  const [adresse,   setAdresse]   = useState('')
  const [photo,     setPhoto]     = useState<File | null>(null)
  const [galerie,   setGalerie]   = useState<File[]>([])
  const [enCours,   setEnCours]   = useState(false)
  const [erreur,    setErreur]    = useState<string | null>(null)

  // Pré-remplir quand les données arrivent
  useEffect(() => {
    if (!fiche) return
    setNom(fiche.nom ?? '')
    setMetier(fiche.metier ?? '')
    setDesc(fiche.description ?? '')
    setTelephone(fiche.telephone ?? '')
    setWhatsapp(fiche.whatsapp ?? '')
    setAdresse(fiche.adresse ?? '')
  }, [fiche])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    if (!nom.trim() || !metier.trim()) { setErreur('Le nom et le métier sont obligatoires.'); return }
    const d = new FormData()
    d.append('nom', nom.trim())
    d.append('metier', metier.trim())
    if (desc.trim())      d.append('description', desc.trim())
    if (telephone.trim()) d.append('telephone', telephone.trim())
    if (whatsapp.trim())  d.append('whatsapp', whatsapp.trim())
    if (adresse.trim())   d.append('adresse', adresse.trim())
    if (photo)            d.append('photo', photo)
    galerie.forEach((f, i) => d.append(`photos[${i}]`, f))
    setEnCours(true)
    try {
      await enregistrer(d)
      navigate(`/fiche/artisans/${id}`, { replace: true })
    } catch { setErreur("Impossible d'enregistrer. Réessayez.") }
    finally { setEnCours(false) }
  }

  return (
    <Layout>
      <div className="flex items-center gap-2 text-xs text-text-muted mb-5">
        <Link to="/tableau-de-bord" className="hover:text-primary">Tableau de bord</Link>
        <span>/</span>
        <Link to={`/fiche/artisans/${id}`} className="hover:text-primary">Fiche artisan</Link>
        <span>/</span>
        <span className="text-text-primary">Modifier</span>
      </div>

      <div className="mb-5">
        <h1 className="text-lg font-bold text-text-primary mb-1">Modifier la fiche artisan</h1>
        <p className="text-sm text-text-secondary">Les modifications seront re-validées par la mairie.</p>
      </div>

      {chargement ? <SkeletonForm /> : errCharge ? (
        <p className="text-sm text-red-600">{errCharge}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
          <Champ label="Nom / Raison sociale" value={nom} onChange={setNom} required />
          <Champ label="Métier" value={metier} onChange={setMetier} required placeholder="Plombier, électricien…" />
          <ChampTextarea label="Description" value={desc} onChange={setDesc} placeholder="Vos services, expérience…" />
          <div className="grid grid-cols-2 gap-4">
            <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
            <Champ label="WhatsApp"  value={whatsapp}  onChange={setWhatsapp}  type="tel" />
          </div>
          <Champ label="Adresse / Quartier" value={adresse} onChange={setAdresse} />
          {/* Photo existante (URL) */}
          {fiche?.photo_url && !photo && (
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Photo actuelle</p>
              <div className="w-full h-36 rounded-2xl overflow-hidden border border-border">
                <img src={fiche.photo_url} alt="actuelle" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <ChampPhoto onChange={setPhoto} valeur={photo} label={fiche?.photo_url ? 'Remplacer la photo' : 'Photo de profil'} />
          <GaleriePhotos valeurs={galerie} onChange={setGalerie} label="Nouvelles photos galerie (remplace les existantes)" />
          {erreur && <p className="text-sm text-red-600">{erreur}</p>}
          <BoutonSoumettre enCours={enCours} texte="Enregistrer les modifications" texteEnCours="Enregistrement…" />
        </form>
      )}
    </Layout>
  )
}
