import Wikipedia from '@/lib/library-sources/wikipedia'
import WOL from '@/lib/library-sources/wol'
import Omniglot from '@/lib/library-sources/omniglot'

export default {
  universalSources: [Wikipedia, Omniglot, WOL],
  l2Sources: [],
  async setLangSources(sources) {
    let imported = []
    for (let source of sources) {
      imported.push(
        (await import(`@/lib/library-sources/${source}.js`)).default
      )
    }
    this.l2Sources = imported
  },
  sources() {
    return this.l2Sources.concat(this.universalSources)
  },
  source(url) {
    const source = this.sources().find(source => {
      return url.match(source.host)
    })
    return source
  },
  getBook(url) {
    return this.source(url) ? this.source(url).getBook(url) : false
  },
  getChapter(url) {
    return this.source(url) ? this.source(url).getChapter(url) : false
  },
  getBooklist(url, l1) {

    return this.source(url) ? this.source(url).getBooklist(url, l1) : false
  }
}
