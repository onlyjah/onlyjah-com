export type Embed = {
  provider: 'YouTube' | 'SoundCloud' | 'Spotify'
  src: string
  href: string
}
// Parse provider links; never accept pasted iframe HTML or arbitrary iframe domains.
export function mediaEmbed(value: string): Embed | null {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash
  )
    return null
  if (['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) {
    const id =
      url.hostname === 'youtu.be'
        ? url.pathname.slice(1)
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : null
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id))
      return {
        provider: 'YouTube',
        src: `https://www.youtube-nocookie.com/embed/${id}`,
        href: `https://www.youtube.com/watch?v=${id}`,
      }
  }
  if (
    url.hostname === 'soundcloud.com' &&
    /^\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
  )
    return {
      provider: 'SoundCloud',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com${url.pathname}`)}&auto_play=false`,
      href: `https://soundcloud.com${url.pathname}`,
    }
  if (
    url.hostname === 'open.spotify.com' &&
    /^\/(track|album|playlist|episode)\/[A-Za-z0-9]+$/.test(url.pathname)
  )
    return {
      provider: 'Spotify',
      src: `https://open.spotify.com/embed${url.pathname}`,
      href: `https://open.spotify.com${url.pathname}`,
    }
  return null
}
export function galleryUrl(value: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      /\.(jpg|jpeg|png|webp)$/i.test(url.pathname) &&
      value.length <= 2048
    )
  } catch {
    return false
  }
}
