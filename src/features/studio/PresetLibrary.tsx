import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Plus, Trash2, Upload } from 'lucide-react'

import {
  applyPresetToDocument,
  cardStatePatchFromDocument,
  createPresetFromDocument,
  documentFromCardState,
  type SpreadPresetV1,
} from '../composition/document'
import { useCardStore } from '../../store/cardStore'
import { createBuiltinPresets } from './builtinPresets'
import { studioRepository } from './repository'

function isPreset(value: unknown): value is SpreadPresetV1 {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'schema' in value &&
    value.schema === 'spread-preset@1'
  )
}

export const PresetLibrary: React.FC = () => {
  const state = useCardStore()
  const [userPresets, setUserPresets] = useState<SpreadPresetV1[]>([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const importRef = useRef<HTMLInputElement>(null)
  const document = useMemo(() => documentFromCardState(state), [state])
  const builtinPresetsRef = useRef(createBuiltinPresets(document))
  const builtinPresets = builtinPresetsRef.current

  useEffect(() => {
    studioRepository
      .listPresets()
      .then(setUserPresets)
      .catch(() => setStatus('Presets locais indisponíveis neste navegador.'))
  }, [])

  const applyPreset = (preset: SpreadPresetV1) => {
    const next = applyPresetToDocument(documentFromCardState(state), preset)
    state.setFullState({
      ...cardStatePatchFromDocument(next),
      isWelcomeState: false,
    })
    setStatus(`${preset.name} aplicado.`)
  }

  const savePreset = async () => {
    const cleanName = name.trim()
    if (!cleanName) return
    const preset = createPresetFromDocument(
      documentFromCardState(state),
      cleanName
    )
    await studioRepository.savePreset(preset)
    setUserPresets(current => [...current, preset])
    setName('')
    setStatus('Preset salvo neste dispositivo.')
  }

  const deletePreset = async (preset: SpreadPresetV1) => {
    await studioRepository.deletePreset(preset.id)
    setUserPresets(current => current.filter(item => item.id !== preset.id))
    setStatus('Preset removido.')
  }

  const exportPreset = (preset: SpreadPresetV1) => {
    const blob = new Blob([JSON.stringify(preset, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = window.document.createElement('a')
    anchor.href = url
    anchor.download = `${preset.id}.spread-preset.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importPreset = async (file: File) => {
    try {
      const candidate: unknown = JSON.parse(await file.text())
      if (!isPreset(candidate)) throw new Error('Formato inválido')
      const preset = {
        ...candidate,
        id: `preset-${Date.now()}`,
        source: 'user' as const,
        updatedAt: Date.now(),
      }
      await studioRepository.savePreset(preset)
      setUserPresets(current => [...current, preset])
      setStatus('Preset importado.')
    } catch {
      setStatus('Não foi possível importar este preset.')
    }
  }

  const renderPreset = (preset: SpreadPresetV1) => (
    <div className="preset-item" key={preset.id}>
      <button
        className="preset-preview"
        onClick={() => applyPreset(preset)}
        style={{
          background: `linear-gradient(${preset.config.background.gradientStyle}, ${preset.config.background.color1}, ${preset.config.background.color2})`,
        }}
      >
        <span>{preset.name}</span>
      </button>
      {preset.source === 'user' && (
        <div className="preset-actions">
          <button
            onClick={() => exportPreset(preset)}
            aria-label={`Exportar ${preset.name}`}
          >
            <Download size={14} />
          </button>
          <button
            onClick={() => deletePreset(preset)}
            aria-label={`Excluir ${preset.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="preset-library">
      <div className="panel-section-heading">
        <div>
          <h3>Looks</h3>
          <p>Aplicam estilo, sem trocar o conteúdo.</p>
        </div>
        <button
          onClick={() => importRef.current?.click()}
          aria-label="Importar preset"
        >
          <Upload size={15} />
        </button>
        <input
          ref={importRef}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={event => {
            const file = event.target.files?.[0]
            if (file) void importPreset(file)
            event.target.value = ''
          }}
        />
      </div>
      <div className="preset-grid">{builtinPresets.map(renderPreset)}</div>

      <div className="panel-divider" />
      <h3>Meus presets</h3>
      <div className="preset-save-row">
        <label className="sr-only" htmlFor="preset-name">
          Nome do preset
        </label>
        <input
          id="preset-name"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Nome do estilo"
        />
        <button onClick={() => void savePreset()} disabled={!name.trim()}>
          <Plus size={16} />
          Salvar
        </button>
      </div>
      {userPresets.length > 0 ? (
        <div className="preset-grid">{userPresets.map(renderPreset)}</div>
      ) : (
        <p className="panel-empty">Nenhum preset salvo.</p>
      )}
      <p className="sr-status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
