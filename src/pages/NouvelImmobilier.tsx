import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import ApercuFiche from '../components/ApercuFiche'

const TYPES_OFFRE = [
  { value: 'vente',    label: 'Vente' },
  { value: 'location', label: 'Location' },
]

const TYPES_BIEN = [
  { value: 'maison',      label: 'Maison' },
  { value: 'appartement', label: 'Appartement' },
  { value: 'villa',       label: 'Villa' },
  { value: 'terrain',     label: 'Terrain' },
]

export default function NouvelImmobilier() {
  const navigate = useNavigate()

  const [titre, setTitre] = useState('')
  const [typeOffre, setTypeOffre] = useState('vente')
  const [typeBien, setTypeBien] = useState('maison')
  const [description, setDescription] = useState('')
  const [adresse, setAdresse] = useState('')
  const [quartier, setQuartier] = useState('')
  const [prix, setPrix] = useState('')
  const [surface, setSurface] = useState('')
  const [nbChambres, setNbChambres] = useState('')
  const [telephone, setTelephone] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [galerie, setGalerie] = useState<File[]>([])
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur]   = useState<string | null>(null)
  const [apercu, setApercu]   = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (!titre.trim()) {
      setErreur('Le titre est obligatoire.')
      return
    }
    if (!prix.trim() || isNaN(Number(prix))) {
      setErreur('Le prix est obligatoire et doit être un nombre.')
      return
    }

    const donnees = new FormData()
    donnees.append('titre', titre.trim())
    donnees.append('type_offre', typeOffre)
    donnees.append('type_bien', typeBien)
    donnees.append('prix', prix.trim())
    if (description.trim()) donnees.append('description', description.trim())
    if (adresse.trim())     donnees.append('adresse', adresse.trim())
    if (quartier.trim())    donnees.append('quartier', quartier.trim())
    if (surface.trim())     donnees.append('surface', surface.trim())
    if (nbChambres.trim())  donnees.append('nb_chambres', nbChambres.trim())
    if (telephone.trim())   donnees.append('telephone', telephone.trim())
    if (photo)              donnees.append('photo', photo)
    galerie.forEach((f, i) => donnees.append(`photos[${i}]`, f))

    setEnCours(true)
    try {
      await api.post('/mes-soumissions/immobilier', donnees, {
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
        <h1 className="text-lg font-bold text-text-primary mb-1">Nouveau bien immobilier</h1>
        <p className="text-sm text-text-secondary">
          Votre bien sera visible dans l'app après validation par la mairie.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
        <Champ
          label="Titre de l'annonce"
          value={titre}
          onChange={setTitre}
          required
          placeholder="Villa 4 pièces à Daoukro centre…"
        />

        <div className="grid grid-cols-2 gap-4">
          <ChampSelect
            label="Type d'offre"
            value={typeOffre}
            onChange={setTypeOffre}
            options={TYPES_OFFRE}
            required
          />
          <ChampSelect
            label="Type de bien"
            value={typeBien}
            onChange={setTypeBien}
            options={TYPES_BIEN}
            required
          />
        </div>

        <ChampTextarea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="État du bien, équipements, avantages…"
        />

        <div className="grid grid-cols-2 gap-4">
          <Champ label="Adresse" value={adresse} onChange={setAdresse} />
          <Champ label="Quartier" value={quartier} onChange={setQuartier} />
        </div>

        <Champ
          label="Prix (F CFA)"
          value={prix}
          onChange={setPrix}
          type="number"
          required
          placeholder="15 000 000"
        />

        <div className="grid grid-cols-2 gap-4">
          <Champ
            label="Surface (m²)"
            value={surface}
            onChange={setSurface}
            type="number"
            placeholder="120"
          />
          <Champ
            label="Nb. de chambres"
            value={nbChambres}
            onChange={setNbChambres}
            type="number"
            placeholder="3"
          />
        </div>

        <Champ label="Téléphone contact" value={telephone} onChange={setTelephone} type="tel" />
        <ChampPhoto onChange={setPhoto} valeur={photo} label="Photo de couverture" />
        <GaleriePhotos
          valeurs={galerie}
          onChange={setGalerie}
          label="Galerie (façades, pièces, terrain…) — jusqu'à 5 photos"
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
          donnees={{ nom: titre, sousTexte: `${typeOffre} · ${typeBien}`, description, telephone, adresse, photo, galerie,
            extra: [
              { label: 'Prix', valeur: `${Number(prix).toLocaleString()} F CFA` },
              ...(surface    ? [{ label: 'Surface',   valeur: `${surface} m²`       }] : []),
              ...(nbChambres ? [{ label: 'Chambres',  valeur: nbChambres             }] : []),
              ...(quartier   ? [{ label: 'Quartier',  valeur: quartier               }] : []),
            ]
          }}
          onFermer={() => setApercu(false)}
        />
      )}
    </Layout>
  )
}
