import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

export default function PageIntrouvable() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-7xl font-black text-primary/10 mb-2 select-none">404</p>
        <h1 className="text-xl font-bold text-text-primary mb-2">Page introuvable</h1>
        <p className="text-sm text-text-secondary mb-6 max-w-xs">
          Cette page n'existe pas ou a été déplacée. Revenez au tableau de bord.
        </p>
        <Link
          to="/tableau-de-bord"
          className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-dark transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </Layout>
  )
}
