import React from 'react'

interface OptionData {
  id: string
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
  return (
    <div className="option" onClick={onClick}>
      <div className="option-number">{option.number}</div>
      <h2 className="option-title">{option.title}</h2>
      <p className="option-description">{option.description}</p>
    </div>
  )
}

export default Option
