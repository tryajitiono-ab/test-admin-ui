import { Link, Navigate, Route, Routes } from 'react-router'
import { FirstTournament } from './first-tournament'
import { SecondTournament } from './second-tournament'

export function FederatedElement() {
  return (
    <div className="appui:p-4">
      <nav className="appui:flex appui:gap-x-2">
        <Link to="/first">First tournament service</Link>
        <Link to="/second">Second tournament service</Link>
      </nav>

      <Routes>
        <Route path="/" index element={<Navigate to="/first" />} />
        <Route path="/first" element={<FirstTournament />} />
        <Route path="/second" element={<SecondTournament />} />
      </Routes>
    </div>
  )
}
