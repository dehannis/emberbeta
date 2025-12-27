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
    description: 'Record stories & thoughts for yourself & your loved ones',
    path: '/talk',
  },
  {
    id: 'remember',
    number: '02',
    title: 'Remember',
    description: 'Transport back in time with cherished memories',
    path: '/remember',
  },
  {
    id: 'share',
    number: '03',
    title: 'Share',
    description: 'Share thought-provoking stories with those that matter',
    path: '/topics',
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
