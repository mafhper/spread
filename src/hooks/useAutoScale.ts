/**
 * Hook useAutoScale - Calculo automatico de escala para preview centralizado
 *
 * Responsabilidades:
 * - Calcular escala automatica baseada no container disponivel
 * - Centralizar conteudo (horizontal e vertical)
 * - Manter limites de escala (min: 20%, max: 100%)
 * - Recalcular ao redimensionar janela
 *
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface AutoScaleOptions {
  /** Escala minima permitida (default: 0.2 = 20%) */
  minScale?: number
  /** Escala maxima permitida (default: 1.0 = 100%) */
  maxScale?: number
  /** Padding interno do container (default: 32px) */
  padding?: number
  /** Habilitar calculo automatico (default: true) */
  enabled?: boolean
}

export interface AutoScaleResult {
  /** Escala calculada atual */
  scale: number
  /** Escala em porcentagem (para exibicao) */
  scalePercent: number
  /** Se esta usando escala automatica */
  isAuto: boolean
  /** Funcao para forcar recalculo */
  recalculate: () => void
  /** Funcao para resetar para auto */
  resetToAuto: () => void
  /** Funcao para definir escala manual */
  setManualScale: (scale: number) => void
  /** Referencia para o container */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Referencia para o conteudo */
  contentRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Calcula a escala ideal para caber o conteudo no container
 */
const calculateOptimalScale = (
  containerWidth: number,
  containerHeight: number,
  contentWidth: number,
  contentHeight: number,
  padding: number,
  minScale: number,
  maxScale: number
): number => {
  // Valida dimensoes
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    contentWidth <= 0 ||
    contentHeight <= 0
  ) {
    return 1
  }

  // Dimencoes disponiveis (com padding)
  const availableWidth = Math.max(0, containerWidth - padding * 2)
  const availableHeight = Math.max(0, containerHeight - padding * 2)

  // Calcula escalas necessarias para cada dimensao
  const scaleX = availableWidth / contentWidth
  const scaleY = availableHeight / contentHeight

  // Usa a menor escala para garantir que caiba inteiro
  const optimalScale = Math.min(scaleX, scaleY)

  // Aplica limites
  const clampedScale = Math.max(minScale, Math.min(optimalScale, maxScale))

  return Math.round(clampedScale * 1000) / 1000 // Precisao de 3 casas decimais
}

/**
 * Hook para gerenciamento automatico de escala no preview
 */
export const useAutoScale = (
  options: AutoScaleOptions = {}
): AutoScaleResult => {
  const {
    minScale = 0.2,
    maxScale = 1.0,
    padding = 32,
    enabled = true,
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [scale, setScale] = useState<number>(1)
  const [isAuto, setIsAuto] = useState<boolean>(true)
  const [manualScaleValue, setManualScaleValue] = useState<number | null>(null)

  /**
   * Recalcula a escala automaticamente
   */
  const recalculate = useCallback(() => {
    if (!enabled) return

    const container = containerRef.current
    const content = contentRef.current

    if (!container || !content) {
      console.log('[useAutoScale] Refs nao disponiveis, aguardando...')
      return
    }

    // Se escala manual esta definida, usa ela (mas valida limites)
    if (!isAuto && manualScaleValue !== null) {
      const clamped = Math.max(minScale, Math.min(manualScaleValue, maxScale))
      if (Math.abs(scale - clamped) > 0.001) {
        setScale(clamped)
      }
      return
    }

    // Calcula escala automatica
    const containerRect = container.getBoundingClientRect()

    // Usa offsetWidth/Height para tamanho real do conteudo (sem escala)
    const contentWidth = content.offsetWidth
    const contentHeight = content.offsetHeight

    const newScale = calculateOptimalScale(
      containerRect.width,
      containerRect.height,
      contentWidth,
      contentHeight,
      padding,
      minScale,
      maxScale
    )

    if (Math.abs(scale - newScale) > 0.001) {
      console.log('[useAutoScale] Escala atualizada:', {
        de: scale,
        para: newScale,
        container: `${containerRect.width}x${containerRect.height}`,
        content: `${contentWidth}x${contentHeight}`,
      })
      setScale(newScale)
    }
  }, [enabled, isAuto, manualScaleValue, minScale, maxScale, padding, scale])

  /**
   * Reseta para escala automatica
   */
  const resetToAuto = useCallback(() => {
    setIsAuto(true)
    setManualScaleValue(null)
    // Forca recalculo no proximo ciclo
    requestAnimationFrame(() => {
      recalculate()
    })
  }, [recalculate])

  /**
   * Define escala manual
   */
  const setManualScale = useCallback(
    (newScale: number) => {
      const clamped = Math.max(minScale, Math.min(newScale, maxScale))
      setIsAuto(false)
      setManualScaleValue(clamped)
      setScale(clamped)
    },
    [minScale, maxScale]
  )

  // Efeito para recalcular quando refs mudam ou redimensionamento ocorre
  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    const content = contentRef.current
    if (!container) return

    // Recalcula inicial
    const timeoutId = setTimeout(() => {
      recalculate()
    }, 100)

    // Observa redimensionamento do container
    const resizeObserver = new ResizeObserver(() => {
      recalculate()
    })

    resizeObserver.observe(container)
    if (content) {
      resizeObserver.observe(content)
    }

    // Observa redimensionamento da janela
    const handleWindowResize = () => {
      recalculate()
    }

    window.addEventListener('resize', handleWindowResize)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [enabled, recalculate])

  // Efeito para recalcular quando isAuto muda para true
  useEffect(() => {
    if (isAuto && enabled) {
      recalculate()
    }
  }, [isAuto, enabled, recalculate])

  const scalePercent = Math.round(scale * 100)

  return {
    scale,
    scalePercent,
    isAuto,
    recalculate,
    resetToAuto,
    setManualScale,
    containerRef,
    contentRef,
  }
}

export default useAutoScale
