export function computeUnifiedExportScale(params: {
  exportScale?: number
  cardScale?: number
  autoScale?: number
  preset?: string
}): number {
  const es = typeof params.exportScale === 'number' ? params.exportScale : 1
  const cs = typeof params.cardScale === 'number' ? params.cardScale : 1
  const as = typeof params.autoScale === 'number' ? params.autoScale : 1
  return es * cs * as
}
