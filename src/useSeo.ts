import { useEffect } from 'react'

// Per-page SEO: sets the document title + meta (description, Open Graph, Twitter,
// canonical) on route change. Client-side, but Google renders JS so it's picked
// up; also the clean foundation for prerender/SSR later.
const SITE = 'https://gojulley.com'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSeo(opts: { title: string; description?: string; path?: string }) {
  const { title, description, path } = opts
  useEffect(() => {
    document.title = title
    setMeta('property', 'og:title', title)
    setMeta('name', 'twitter:title', title)
    if (description) {
      setMeta('name', 'description', description)
      setMeta('property', 'og:description', description)
      setMeta('name', 'twitter:description', description)
    }
    const url = SITE + (path ?? window.location.pathname)
    setMeta('property', 'og:url', url)
    setCanonical(url)
  }, [title, description, path])
}
