import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handlePhoneClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault()
    if (location.pathname === '/account') {
      navigate('/')
    } else {
      navigate('/account')
    }
  }

  const handleHomeClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault()
    navigate('/')
  }

  return (
    <header className="header">
      <span className="home-icon" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        ○
      </span>
      <span className="phone-number" onClick={handlePhoneClick} style={{ cursor: 'pointer' }}>
        +1-781-915-9663
      </span>
    </header>
  )
}

export default Header

