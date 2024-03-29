import { emit, off, on } from './events'
import { cache, render } from './render'
import { Config, VisitOptions } from './types'

let previousUrl: string | undefined

export default {
  on,
  off,

  start({ watchHistory = true } = {} as Config) {
    if (watchHistory) {
      window.addEventListener('popstate', async () => {
        await this.visit(window.location.pathname + window.location.search, {
          action: 'none',
          useCache: true,
        })
      })
    }
  },

  async visit(
    url: string,
    { action = 'push', useCache, cacheId, silent }: VisitOptions = {}
  ) {
    !silent && (await emit('before-visit', { url }))

    cacheId =
      cacheId ??
      previousUrl ??
      window.location.pathname + window.location.search

    cache[cacheId] = document.cloneNode(true) as Document
    await render(url, useCache)

    if (action === 'replace') {
      history.replaceState(null, '', url)
    } else if (action === 'push') {
      history.pushState(null, '', url)
    }

    !silent && (await emit('visit', { url }))
    previousUrl = url
  },
}
