import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import BottomTabs from './BottomTabs'

export default function TabbedShell() {
  const location = useLocation()
  const showTabs = location.pathname.startsWith('/feed') || location.pathname.startsWith('/people')

  return (
    <div style={{ ['--ember-tabs-height' as any]: showTabs ? '44px' : '0px' } as React.CSSProperties}>
      <Outlet />
      {showTabs && <BottomTabs />}
    </div>
  )
}


