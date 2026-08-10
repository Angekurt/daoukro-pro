import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Champ, ChampSelect, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import ApercuFiche from '../components/ApercuFiche'

const TYPES_ANNONCE = [
  { value: 'annonce',    label: 'Annonce générale' },
  { value: 'evenement',  label: 'Événement' },
  { value: 'emploi',     label: "Offre d'emploi" },
  { value: 'restaurant', label: 'Restaurant / Maquis' },
  { value: 'pub',        label: 'Publicité' },
]

export default function NouvelleAnnonce() {
  const navigate = useNavigate()

  const [titre, setTitre]         = useState('')
  const [type, setType]           = useState('annonce')
  const [description, setDesc]    = useState('')
  const [lieu, setLieu]           = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin]     = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail]         = useState('')
  const [lien, setLien]           = useState('')
  const [photo, setPhoto]         = useState<File | null>(null)
  const [galerie, setGalerie]     = useState<File[]>([])
  const [enCours, setEnCours]     = useState(false)
  const [erreur, setErreur]       = useState<string | null>(null)
  const [apercu, setApercu]       = useState(false)

  const estEvenement = type === 'evenement'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (!titre.trim()) {
      setErreur('Le titre est obligatoire.')
      return
    }
    if (!description.trim()) {
      setErreur('La description est obligatoire.')
      return
    }

    const donnees = new FormData()
    donnees.append('titre', titre.trim())
    donnees.append('type', type)
    donnees.append('description', description.trim())
    if (lieu.trim())      donnees.append('lieu', lieu.trim())
    if (dateDebut)        donnees.append('date_debut', dateDebut)
    if (dateFin)          donnees.append('date_fin', dateFin)
    if (telephone.trim()) donnees.append('telephone', telephone.trim())
    if (email.trim())     donnees.append('email', email.trim())
    if (lien.trim())      donnees.append('lien', lien.trim())
    if (photo)            donnees.append('photo', photo)
    galerie.forEach((f, i) => donnees.append(`photos[${i}]`, f))

    setEnCours(true)
    try {
      await api.post('/mes-soumissions/annonces', donnees, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate('/tableau-de-bord', { replace: true })
    } catch {
      setErreur("Impossible d'envoyer l'annonce. Réessayez.")
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-lg font-bold text-text-primary mb-1">Nouvelle annonce</h1>
        <p className="text-sm text-text-secondary">
          Votre annonce sera visible dans l'app après validation par la mairie.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
        <ChampSelect
          label="Catégorie"
          value={type}
          onChange={setType}
          options={TYPES_ANNONCE}
          required
        />
        <Champ
          label="Titre"
          value={titre}
          onChange={setTitre}
          required
          placeholder="Titre accrocheur de l'annonce…"
        />
        <ChampTextarea
          label="Description"
          value={description}
          onChange={setDesc}
          required
          rows={4}
          placeholder="Détaillez votre annonce…"
        />
        <Champ label="Lieu" value={lieu} onChange={setLieu} placeholder="Quartier, adresse, salle…" />

        <div className="grid grid-cols-2 gap-4">
          <Champ
            label={estEvenement ? 'Date de début' : 'Date début (optionnel)'}
            value={dateDebut}
            onChange={setDateDebut}
            type="date"
          />
          <Champ
            label={estEvenement ? 'Date de fin' : 'Date fin (optionnel)'}
            value={dateFin}
            onChange={setDateFin}
            type="date"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
          <Champ label="Email"     value={email}     onChange={setEmail}     type="email" />
        </div>

        <Champ
          label="Lien (site web, réseaux…)"
          value={lien}
          onChange={setLien}
          type="url"
          placeholder="https://..."
        />

        <ChampPhoto onChange={setPhoto} valeur={photo} label="Photo principale" />
        <GaleriePhotos
          valeurs={galerie}
          onChange={setGalerie}
          label="Galerie (visuels supplémentaires) — jusqu'à 5 photos"
        />

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={() => setApercu(true)}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors">
            Aperçu
          </button>
          <div className="flex-1"><BoutonSoumettre enCours={enCours} texte="Envoyer l'annonce" /></div>
        </div>
      </form>
      {apercu && (
        <ApercuFiche
          donnees={{ nom: titre, sousTexte: type, description: desc, telephone, adresse: lieu, photo, galerie,
            extra: [
              ...(dateDebut ? [{ label: 'Début', valeur: dateDebut }] : []),
              ...(dateFin   ? [{ label: 'Fin',   valeur: dateFin   }] : []),
              ...(email     ? [{ label: 'Email', valeur: email     }] : []),
            ]
          }}
          onFermer={() => setApercu(false)}
        />
      )}
    </Layout>
  )
}
