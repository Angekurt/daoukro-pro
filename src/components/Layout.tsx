import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── Icônes SVG inline (pas de dépendance externe) ────────────────────────────

function IcoDashboard({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}

function IcoPlus() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function IcoProfil({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function IcoStats({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

// ── Config navigation ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Accueil',   href: '/tableau-de-bord', icon: IcoDashboard },
  { label: 'Stats',     href: '/tableau-de-bord?vue=kpi', icon: IcoStats },
  // Le bouton central "+" est géré séparément
  { label: 'Profil',    href: '/profil',           icon: IcoProfil },
]

// ── Layout ────────────────────────────────────────────────────────────────────

export default function Layout({ children }: { children: ReactNode }) {
  const { utilisateur } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()

  const path    = location.pathname
  const surProfil    = path === '/profil'
  const surDashboard = path === '/tableau-de-bord'
  const surEquipes   = path === '/equipes'

  // Route "Nouveau" : déduit du contexte courant
  function routeNouveau() {
    if (path.includes('hebergement')) return '/nouvelle-fiche/hebergement'
    if (path.includes('immobilier'))  return '/nouvelle-fiche/immobilier'
    if (path.includes('annonce'))     return '/nouvelle-fiche/annonce'
    return '/nouvelle-fiche/artisan'
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* ── HEADER (desktop uniquement : md+) ─────────────────────────────── */}
      <header className="hidden md:block bg-primary text-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/tableau-de-bord" className="font-bold tracking-tight text-lg">
            Daoukro Pro
          </Link>

          {/* Nav desktop */}
          {utilisateur && (
            <nav className="flex items-center gap-1">
              <NavLinkDesktop href="/tableau-de-bord" actif={surDashboard && !surProfil} label="Tableau de bord" />
              <NavLinkDesktop href="/tableau-de-bord?vue=kpi" actif={false} label="Statistiques" />
              <div className="w-px h-5 bg-white/20 mx-2" />
              {/* Avatar / Profil */}
              <Link
                to="/profil"
                className={`flex items-center gap-2 text-sm px-2.5 py-1.5 rounded-lg transition-colors ${
                  surProfil ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                {utilisateur.avatar_url ? (
                  <img src={utilisateur.avatar_url} alt={utilisateur.nom}
                    className="w-7 h-7 rounded-full object-cover border border-white/30" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {utilisateur.nom.charAt(0).toUpperCase()}
                  </span>
                )}
                <span>{utilisateur.nom}</span>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* ── HEADER MOBILE (logo + avatar seulement) ───────────────────────── */}
      <header className="md:hidden bg-primary text-white sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link to="/tableau-de-bord" className="font-bold tracking-tight">
            Daoukro Pro
          </Link>
          {utilisateur?.avatar_url && (
            <Link to="/profil">
              <img src={utilisateur.avatar_url} alt={utilisateur.nom}
                className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
            </Link>
          )}
        </div>
      </header>

      {/* ── CONTENU PRINCIPAL ─────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-5 pb-28 md:pb-6">
        {children}
      </main>

      {/* ── BOTTOM BAR (mobile + tablette uniquement : < md) ──────────────── */}
      {utilisateur && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-border">
          {/* Safe area iOS */}
          <div className="flex items-center justify-around px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">

            {/* Accueil */}
            <BottomNavItem
              href="/tableau-de-bord"
              label="Accueil"
              actif={surDashboard}
              icon={<IcoDashboard active={surDashboard} />}
            />

            {/* Stats */}
            <BottomNavItem
              href="/tableau-de-bord?vue=kpi"
              label="Stats"
              actif={false}
              icon={<IcoStats active={false} />}
            />

            {/* Bouton central Nouveau (FAB) */}
            <button
              onClick={() => navigate(routeNouveau())}
              className="flex flex-col items-center -mt-5"
              aria-label="Nouvelle fiche"
            >
              <span className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <IcoPlus />
              </span>
              <span className="text-[10px] text-text-muted mt-1 font-medium">Nouveau</span>
            </button>

            {/* Mes fiches */}
            <BottomNavItem
              href="/tableau-de-bord"
              label="Fiches"
              actif={surDashboard}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={surDashboard ? 2 : 1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              }
            />

            {/* Équipes */}
            <BottomNavItem
              href="/equipes"
              label="Équipes"
              actif={surEquipes}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={surEquipes ? 2 : 1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              }
            />

            {/* Profil */}
            <BottomNavItem
              href="/profil"
              label="Profil"
              actif={surProfil}
              icon={
                utilisateur.avatar_url ? (
                  <img src={utilisateur.avatar_url} alt=""
                    className={`w-7 h-7 rounded-full object-cover ${surProfil ? 'ring-2 ring-primary' : ''}`} />
                ) : (
                  <IcoProfil active={surProfil} />
                )
              }
            />

          </div>
        </nav>
      )}
    </div>
  )
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function NavLinkDesktop({ href, actif, label }: { href: string; actif: boolean; label: string }) {
  return (
    <Link
      to={href}
      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
        actif ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}

function BottomNavItem({
  href,
  label,
  actif,
  icon,
}: {
  href: string
  label: string
  actif: boolean
  icon: ReactNode
}) {
  return (
    <Link
      to={href}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors min-w-[52px] ${
        actif ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
      }`}
    >
      {icon}
      <span className={`text-[10px] font-medium ${actif ? 'text-primary' : ''}`}>{label}</span>
    </Link>
  )
}
