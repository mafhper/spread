import React, { useState } from 'react'

import { CanvasControls } from '../../components/toolbar/tabs/CanvasControls'
import { CardTabs } from '../../components/toolbar/tabs/CardTabs'
import { PhotoTabs } from '../../components/toolbar/tabs/PhotoTabs'
import { TypographyTabs } from '../../components/toolbar/tabs/TypographyTabs'

type InspectorTarget = 'canvas' | 'card' | 'image' | 'text'

const targets: Array<{ id: InspectorTarget; label: string }> = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'card', label: 'Card' },
  { id: 'image', label: 'Imagem' },
  { id: 'text', label: 'Texto' },
]

export const InspectorPanel: React.FC = () => {
  const [target, setTarget] = useState<InspectorTarget>('canvas')

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-title">
        <span>Inspector</span>
        <small>Ajustes do elemento</small>
      </div>
      <div className="studio-segmented" role="tablist" aria-label="Inspector">
        {targets.map(item => (
          <button
            key={item.id}
            role="tab"
            aria-selected={target === item.id}
            onClick={() => setTarget(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="studio-panel-scroll legacy-controls">
        {target === 'canvas' && <CanvasControls />}
        {target === 'card' && <CardTabs />}
        {target === 'image' && <PhotoTabs />}
        {target === 'text' && <TypographyTabs />}
      </div>
    </div>
  )
}
