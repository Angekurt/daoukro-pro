import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import ApercuFiche from '../components/ApercuFiche'

const TYPES_HEBERGEMENT = [
  { value: 'hotel',     label: 'Hôtel' },
  { value: 'residence', label: 'Résidence' },
  { value: 'meuble',    label: 'Meublé' },
]

export default function NouvelleHebergement() {
  const navigate = useNavigate()

  const [nom, setNom]             = useState('')
  const [type, setType]           = useState('hotel')
  const [description, setDesc]    = useState('')
  const [adresse, setAdresse]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [prixMin, setPrixMin]     = useState('')
  const [prixMax, setPrixMax]     = useState('')
  const [photo, setPhoto]         = useState<File | null>(null)
  const [galerie, setGalerie]     = useState<File[]>([])
  const [enCours, setEnCours]     = useState(false)
  const [erreur, setErreur]       = useState<string | null>(null)
  const [apercu, setApercu]       = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (!nom.trim()) {
      setErreur('Le nom est obligatoire.')
      return
    }

    const donnees = new FormData()
    donnees.append('nom', nom.trim())
    donnees.append('type', type)
    if (description.trim()) donnees.append('description', description.trim())
    if (adresse.trim())     donnees.append('adresse', adresse.trim())
    if (telephone.trim())   donnees.append('telephone', telephone.trim())
    if (prixMin.trim())     donnees.append('prix_min', prixMin.trim())
    if (prixMax.trim())     donnees.append('prix_max', prixMax.trim())
    if (photo)              donnees.append('photo', photo)
    galerie.forEach((f, i) => donnees.append(`photos[${i}]`, f))

    setEnCours(true)
    try {
      await api.post('/mes-soumissions/hebergements', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/tableau-de-bord', { replace: true })
    } catch {
      setErreur("Impossible d'envoyer la fiche. Réessayez.")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text-primary mb-1">Nouvel hébergement</h1>
        <p className="text-sm text-text-secondary">
          Votre établissement sera visible dans l'app après validation par la mairie.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
        <Champ label="Nom de l'établissement" value={nom} onChange={setNom} required />
        <ChampSelect
          label="Type d'hébergement"
          value={type}
          onChange={setType}
          options={TYPES_HEBERGEMENT}
          required
        />
        <ChampTextarea
          label="Description"
          value={description}
          onChange={setDesc}
          placeholder="Équipements, services proposés, ambiance…"
        />
        <Champ label="Adresse / Quartier" value={adresse} onChange={setAdresse} />
        <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />

        <div>
          <p className="text-sm font-medium text-text-primary mb-2">Prix par nuit (F CFA)</p>
          <div className="grid grid-cols-2 gap-4">
            <Champ label="À partir de" value={prixMin} onChange={setPrixMin} type="number" placeholder="5 000" />
            <Champ label="Jusqu'à"     value={prixMax} onChange={setPrixMax} type="number" placeholder="50 000" />
          </div>
        </div>

        <ChampPhoto onChange={setPhoto} valeur={photo} label="Photo de couverture" />
        <GaleriePhotos
          valeurs={galerie}
          onChange={setGalerie}
          label="Galerie (chambres, piscine, restaurant…) — jusqu'à 5 photos"
        />

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={() => setApercu(true)}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">
            Aperçu
          </button>
          <div className="flex-1"><BoutonSoumettre enCours={enCours} /></div>
        </div>
      </form>
      {apercu && (
        <ApercuFiche
          donnees={{ nom, sousTexte: type, description: desc, telephone, adresse, photo, galerie,
            extra: [
              ...(prixMin ? [{ label: 'À partir de', valeur: `${Number(prixMin).toLocaleString()} F/nuit` }] : []),
              ...(prixMax ? [{ label: 'Jusqu\'à',    valeur: `${Number(prixMax).toLocaleString()} F/nuit` }] : []),
            ]
          }}
          onFermer={() => setApercu(false)}
        />
      )}
    </Layout>
  )
}
