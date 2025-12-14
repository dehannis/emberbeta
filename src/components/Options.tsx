import React from 'react'
import { useNavigate } from 'react-router-dom'
import Option from './Option'

interface OptionData {
  id: string
  number: string
  title: string
  description: string
  path: string
}

const optionsData: OptionData[] = [
  {
    id: 'talk',
    number: '01',
    title: 'Talk',
    description: 'Share your thoughts and memories through conversation',
    path: '/talk',
  },
  {
    id: 'build',
    number: '02',
    title: 'Build',
    description: 'Create your shared story by preserving what matters',
    path: '/build',
  },
  {
    id: 'share',
    number: '03',
    title: 'Share',
    description: 'Connect and exchange memories with others',
    path: '/share',
  },
]

const Options: React.FC = () => {
  const navigate = useNavigate()

  const handleOptionClick = (path: string) => {
    navigate(path)
  }

  return (
    <div className="options">
      {optionsData.map((option) => (
        <Option
          key={option.id}
          option={option}
          onClick={() => handleOptionClick(option.path)}
        />
      ))}
    </div>
  )
}

export default Options

