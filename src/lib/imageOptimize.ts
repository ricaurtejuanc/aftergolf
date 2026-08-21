// Downscales and re-encodes an image before it's uploaded, so a multi-MB
// phone photo doesn't get served at full resolution into a 56-200px
// thumbnail. Never throws — any decode/encode failure falls back to
// returning the original blob untouched, since a broken optimizer should
// never block an upload.
export async function optimizeImage(
  blob: Blob,
  opts: { maxDimension?: number; quality?: number } = {},
): Promise<Blob> {
  const maxDimension = opts.maxDimension ?? 1600
  const quality = opts.quality ?? 0.82

  try {
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return blob
    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const optimized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    )
    return optimized ?? blob
  } catch {
    return blob
  }
}
