interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  loading?: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  fetchpriority = 'auto',
}) => {
  // Gera URLs para WebP e AVIF (assumindo que as versões convertidas existem)
  // const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  // const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif')

  return (
    <picture>
      {/* 
          TODO (T3.1): Uncomment these once image conversion script is implemented 
          <source srcSet={avifSrc} type="image/avif" />
          <source srcSet={webpSrc} type="image/webp" />
      */}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchpriority}
      />
    </picture>
  )
}
