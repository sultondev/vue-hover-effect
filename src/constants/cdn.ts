const CDN_VERSION = '0.0.1-stable'
const CDN_BASE = `https://cdn.jsdelivr.net/npm/vue-hover-effect@${CDN_VERSION}/dist/lib-images/displacements`

export const DISPLACEMENT_URLS = Array.from({ length: 16 }, (_, i) =>
  `${CDN_BASE}/${i + 1}.webp`
)

export const DEFAULT_DISPLACEMENT = DISPLACEMENT_URLS[0]
