declare module 'colorthief' {
  export default class ColorThief {
    getColor(img: HTMLImageElement | null): [number, number, number]
    getPalette(
      img: HTMLImageElement | null,
      colorCount?: number
    ): [number, number, number][]
  }
}

declare module 'downloadjs' {
  function download(
    data: string | Blob | File,
    filename?: string,
    mimeType?: string
  ): void
  export default download
}

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
  [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
