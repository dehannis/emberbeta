import React, { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import './Build.css'

interface Memory {
  id: string
  title: string
  date: string
  note: string
  personId: string
}

interface Contact {
  id: string
  name: string
  color: string
}

// You + sample contacts
const ALL_PEOPLE: Contact[] = [
  { id: 'me', name: 'You', color: '#7eb8da' },
  { id: 'john', name: 'John', color: '#daa87e' },
  { id: 'jane', name: 'Jane', color: '#8eda7e' },
]

// Sample memories
const SAMPLE_MEMORIES: Memory[] = [
  { id: '1', title: 'Morning Reflection', date: '2024-03-15', note: 'A quiet moment...', personId: 'me' },
  { id: '2', title: 'Weekend Adventure', date: '2024-02-10', note: 'Hiking trip...', personId: 'john' },
  { id: '3', title: 'Coffee Chat', date: '2024-01-20', note: 'Catching up...', personId: 'jane' },
  { id: '4', title: 'New Year Goals', date: '2024-01-05', note: 'Setting intentions...', personId: 'me' },
  { id: '5', title: 'Birthday Party', date: '2023-11-15', note: 'Surprise party...', personId: 'john' },
  { id: '6', title: 'Project Launch', date: '2023-09-05', note: 'Celebrating...', personId: 'jane' },
  { id: '7', title: 'Summer Vacation', date: '2023-08-10', note: 'Beach memories...', personId: 'me' },
  { id: '8', title: 'Graduation Day', date: '2022-06-20', note: 'Finally finished...', personId: 'me' },
]

const Build: React.FC = () => {
  const [visiblePeople, setVisiblePeople] = useState<Set<string>>(new Set(['me']))
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setTimeout(() => setIsLoaded(true), 300)
    return () => { document.body.style.overflow = '' }
  }, [])

  const togglePerson = (id: string) => {
    setVisiblePeople(prev => {
      const next = new Set(prev)
      if (id === 'me') return next // Can't toggle yourself off
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Filter and sort memories
  const visibleMemories = useMemo(() => {
    return SAMPLE_MEMORIES
      .filter(m => visiblePeople.has(m.personId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [visiblePeople])

  // Spiral position calculation - elegant Archimedean spiral
  const getSpiralPosition = (index: number, total: number) => {
    if (index === 0) {
      // Most recent memory at center
      return { x: 50, y: 50, scale: 1.6 }
    }

    // Spiral parameters - generous spacing
    const a = 8 // Starting radius
    const b = 6 // Growth rate per turn
    const maxTurns = 2.5
    
    // Map index to angle (0 to maxTurns * 2π)
    const t = (index / Math.max(total - 1, 1)) * maxTurns * 2 * Math.PI
    const r = a + b * t
    
    // Convert to x, y (centered at 50, 50)
    const x = 50 + r * Math.cos(t - Math.PI / 2)
    const y = 50 + r * Math.sin(t - Math.PI / 2)
    
    // Scale decreases as we go outward
    const scale = Math.max(0.5, 1.2 - (index * 0.08))
    
    return { x, y, scale }
  }

  const getPersonColor = (personId: string): string => {
    return ALL_PEOPLE.find(p => p.id === personId)?.color || '#ffffff'
  }

  const getPersonName = (personId: string): string => {
    return ALL_PEOPLE.find(p => p.id === personId)?.name || personId
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="build-page">
      <Header hidePhone />

      {/* People Filter - Top Right */}
      <div className={`people-filter ${isLoaded ? 'visible' : ''}`}>
        {ALL_PEOPLE.map(person => {
          const isActive = visiblePeople.has(person.id)
          const isMe = person.id === 'me'
          return (
            <button
              key={person.id}
              className={`person-chip ${isActive ? 'active' : ''} ${isMe ? 'me' : ''}`}
              onClick={() => togglePerson(person.id)}
              style={{ '--person-color': person.color } as React.CSSProperties}
            >
              <span className="chip-dot" />
              <span className="chip-name">{person.name}</span>
            </button>
          )
        })}
      </div>

      {/* Spiral Constellation */}
      <div className="spiral-container">
        {/* Spiral guide path */}
        <svg className="spiral-guide" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path
            d={(() => {
              const points: string[] = []
              const a = 8, b = 6, maxTurns = 2.5
              for (let i = 0; i <= 100; i++) {
                const t = (i / 100) * maxTurns * 2 * Math.PI
                const r = a + b * t
                const x = 50 + r * Math.cos(t - Math.PI / 2)
                const y = 50 + r * Math.sin(t - Math.PI / 2)
                points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
              }
              return points.join(' ')
            })()}
            className="spiral-path"
          />
        </svg>

        {/* Memory Orbs */}
        {visibleMemories.map((memory, index) => {
          const pos = getSpiralPosition(index, visibleMemories.length)
          const isHovered = hoveredId === memory.id
          const isPrimary = index === 0
          const color = getPersonColor(memory.personId)

          return (
            <div
              key={memory.id}
              className={`memory-orb ${isPrimary ? 'primary' : ''} ${isHovered ? 'hovered' : ''} ${isLoaded ? 'visible' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                '--orb-color': color,
                '--orb-scale': pos.scale,
                animationDelay: `${index * 0.08}s`,
              } as React.CSSProperties}
              onClick={() => setSelectedMemory(memory)}
              onMouseEnter={() => setHoveredId(memory.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="orb-glow" />
              <div className="orb-core" />
              
              <div className={`orb-label ${isHovered || isPrimary ? 'visible' : ''}`}>
                <span className="orb-person">{getPersonName(memory.personId)}</span>
                <span className="orb-title">{memory.title}</span>
                <span className="orb-date">{formatDate(memory.date)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Memory Modal */}
      {selectedMemory && (
        <div className="memory-modal" onClick={() => setSelectedMemory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div 
              className="modal-orb"
              style={{ '--orb-color': getPersonColor(selectedMemory.personId) } as React.CSSProperties}
            />
            <div className="modal-info">
              <span className="modal-person">{getPersonName(selectedMemory.personId)}</span>
              <h2 className="modal-title">{selectedMemory.title}</h2>
              <span className="modal-date">{formatDate(selectedMemory.date)}</span>
              <p className="modal-note">{selectedMemory.note}</p>
            </div>
            <div className="modal-actions">
              <button className="play-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21" />
                </svg>
                Play
              </button>
            </div>
            <button className="close-btn" onClick={() => setSelectedMemory(null)}>×</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {visibleMemories.length === 0 && isLoaded && (
        <div className="empty-state">
          <div className="empty-orb" />
          <h2>No memories yet</h2>
          <p>Start recording to build your story</p>
        </div>
      )}
    </div>
  )
}

export default Build
