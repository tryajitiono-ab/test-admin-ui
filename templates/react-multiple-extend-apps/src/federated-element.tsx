import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { FirstTournament } from './first-tournament'
import { SecondTournament } from './second-tournament'

export function FederatedElement() {
  const { pathname } = useLocation()

  return (
    <div className="appui:p-4">
      <nav className="appui:flex appui:gap-x-4">
        <Link to="/first" className={pathname === '/first' ? 'appui:font-semibold appui:underline' : undefined}>
          First tournament service
        </Link>
        <Link to="/second" className={pathname === '/second' ? 'appui:font-semibold appui:underline' : undefined}>
          Second tournament service
        </Link>
      </nav>

      <Routes>
        <Route path="/" index element={<Navigate to="/first" />} />
        <Route path="/first" element={<FirstTournament />} />
        <Route path="/second" element={<SecondTournament />} />
      </Routes>
    </div>
  )
}
