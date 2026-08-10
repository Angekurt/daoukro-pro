import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages publiques
import Login           from './pages/Login'
import PageIntrouvable from './pages/PageIntrouvable'

// Pages protégées
import Dashboard from './pages/Dashboard'
import Profil    from './pages/Profil'
import Teams     from './pages/Teams'

// Création de fiches
import NouvelArtisan       from './pages/NouvelArtisan'
import NouvelleHebergement from './pages/NouvelleHebergement'
import NouvelImmobilier    from './pages/NouvelImmobilier'
import NouvelleAnnonce     from './pages/NouvelleAnnonce'

// Détail de fiche
import DetailFiche from './pages/DetailFiche'

// Modification de fiches
import ModifierArtisan      from './pages/ModifierArtisan'
import ModifierHebergement  from './pages/ModifierHebergement'
import ModifierImmobilier   from './pages/ModifierImmobilier'
import ModifierAnnonce      from './pages/ModifierAnnonce'

// ── Guard ─────────────────────────────────────────────────────────────────────

function RouteProtegee({ children }: { children: React.ReactNode }) {
  const { utilisateur } = useAuth()
  if (!utilisateur) return <Navigate to="/" replace />
  return <>{children}</>
}

function P({ children }: { children: React.ReactNode }) {
  return <RouteProtegee>{children}</RouteProtegee>
}

// ── Routes ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>

      {/* ── Public ── */}
      <Route path="/"  element={<Login />} />

      {/* ── Dashboard ── */}
      <Route path="/tableau-de-bord" element={<P><Dashboard /></P>} />

      {/* ── Profil ── */}
      <Route path="/profil"          element={<P><Profil /></P>} />

      {/* ── Teams ── */}
      <Route path="/equipes" element={<P><Teams /></P>} />

      {/* ── Détail d'une fiche ── */}
      <Route path="/fiche/:type/:id" element={<P><DetailFiche /></P>} />

      {/* ── Modification d'une fiche ── */}
      <Route path="/fiche/artisans/:id/modifier"     element={<P><ModifierArtisan /></P>} />
      <Route path="/fiche/hebergements/:id/modifier" element={<P><ModifierHebergement /></P>} />
      <Route path="/fiche/immobilier/:id/modifier"   element={<P><ModifierImmobilier /></P>} />
      <Route path="/fiche/annonces/:id/modifier"     element={<P><ModifierAnnonce /></P>} />

      {/* ── Création de fiches ── */}
      <Route path="/nouvelle-fiche/artisan"     element={<P><NouvelArtisan /></P>} />
      <Route path="/nouvelle-fiche/hebergement" element={<P><NouvelleHebergement /></P>} />
      <Route path="/nouvelle-fiche/immobilier"  element={<P><NouvelImmobilier /></P>} />
      <Route path="/nouvelle-fiche/annonce"     element={<P><NouvelleAnnonce /></P>} />

      {/* Rétrocompatibilité */}
      <Route path="/nouvelle-fiche" element={<Navigate to="/nouvelle-fiche/artisan" replace />} />

      {/* ── 404 ── */}
      <Route path="*" element={<PageIntrouvable />} />

    </Routes>
  )
}
