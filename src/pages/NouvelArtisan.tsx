import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { Champ, ChampTextarea, ChampPhoto, GaleriePhotos, BoutonSoumettre } from '../components/FormChamp'
import ApercuFiche from '../components/ApercuFiche'

export default function NouvelArtisan() {
  const navigate = useNavigate()

  const [nom, setNom]             = useState('')
  const [metier, setMetier]       = useState('')
  const [description, setDesc]    = useState('')
  const [telephone, setTelephone] = useState('')
  const [whatsapp, setWhatsapp]   = useState('')
  const [adresse, setAdresse]     = useState('')
  const [photo, setPhoto]         = useState<File | null>(null)
  const [galerie, setGalerie]     = useState<File[]>([])
  const [enCours, setEnCours]     = useState(false)
  const [erreur, setErreur]       = useState<string | null>(null)
  const [apercu, setApercu]       = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (!nom.trim() || !metier.trim()) {
      setErreur('Le nom et le métier sont obligatoires.')
      return
    }

    const donnees = new FormData()
    donnees.append('nom', nom.trim())
    donnees.append('metier', metier.trim())
    if (description.trim()) donnees.append('description', description.trim())
    if (telephone.trim())   donnees.append('telephone', telephone.trim())
    if (whatsapp.trim())    donnees.append('whatsapp', whatsapp.trim())
    if (adresse.trim())     donnees.append('adresse', adresse.trim())
    if (photo)              donnees.append('photo', photo)
    galerie.forEach((f, i) => donnees.append(`photos[${i}]`, f))

    setEnCours(true)
    try {
      await api.post('/mes-soumissions/artisans', donnees, {
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
        <h1 className="text-lg font-bold text-text-primary mb-1">Nouvelle fiche artisan</h1>
        <p className="text-sm text-text-secondary">
          Elle sera visible dans l'app Daoukro Digital après validation par la mairie.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 bg-white border border-border rounded-2xl p-5">
        <Champ label="Nom / Raison sociale" value={nom} onChange={setNom} required />
        <Champ
          label="Métier"
          value={metier}
          onChange={setMetier}
          required
          placeholder="Plombier, électricien, maçon…"
        />
        <ChampTextarea
          label="Description"
          value={description}
          onChange={setDesc}
          placeholder="Présentez vos services, votre expérience…"
        />
        <div className="grid grid-cols-2 gap-4">
          <Champ label="Téléphone" value={telephone} onChange={setTelephone} type="tel" />
          <Champ label="WhatsApp"  value={whatsapp}  onChange={setWhatsapp}  type="tel" />
        </div>
        <Champ label="Adresse / Quartier" value={adresse} onChange={setAdresse} />
        <ChampPhoto onChange={setPhoto} valeur={photo} label="Photo de profil" />
        <GaleriePhotos
          valeurs={galerie}
          onChange={setGalerie}
          label="Galerie (atelier, réalisations…) — jusqu'à 5 photos"
        />

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setApercu(true)}
            className="flex-1 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            Aperçu
          </button>
          <div className="flex-1">
            <BoutonSoumettre enCours={enCours} />
          </div>
        </div>
      </form>

      {apercu && (
        <ApercuFiche
          donnees={{ nom, sousTexte: metier, description: desc, telephone, adresse, photo, galerie }}
          onFermer={() => setApercu(false)}
        />
      )}
    </Layout>
  )
}
