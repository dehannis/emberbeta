import React, { useState } from 'react'
import type { OptionType } from './Options'

interface OptionData {
  id: OptionType
  number: string
  title: string
  description: string
  path: string
}

interface OptionProps {
  option: OptionData
  onClick: () => void
}

const Option: React.FC<OptionProps> = ({ option, onClick }) => {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClick()
  }

  const handleTouchStart = () => {
    setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsPressed(false)
    }, 150)
  }

  const style: React.CSSProperties = {
    opacity: isPressed ? 0.8 : 1,
  }

  return (
    <a
      href="#"
      className="option"
      data-option={option.id}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={style}
    >
      <div className="option-content">
        <span className="option-number">{option.number}</span>
        <h2 className="option-title">{option.title}</h2>
        <p className="option-description">{option.description}</p>
      </div>
    </a>
  )
}

export default Option

