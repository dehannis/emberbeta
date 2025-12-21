import { NavLink, useLocation } from 'react-router-dom'
import './BottomTabs.css'

export type BottomTab = { to: string; label: string }

const TABS: BottomTab[] = [
  { to: '/feed', label: 'Build' },
  { to: '/people', label: 'People' },
]

export default function BottomTabs() {
  const location = useLocation()
  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(`${to}/`)

  return (
    <nav className="emberTabs" aria-label="Primary">
      <div className="emberTabs-inner">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isPending }) => {
              const active = isActive(t.to)
              return ['emberTab', active ? 'emberTab--active' : '', isPending ? 'emberTab--pending' : '']
                .filter(Boolean)
                .join(' ')
            }}
          >
            <span className="emberTab-label">{t.label}</span>
            <span className="emberTab-sticker" aria-hidden="true" />
          </NavLink>
        ))}
      </div>
    </nav>
  )
}


