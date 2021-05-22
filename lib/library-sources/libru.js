import Helper from '@/lib/helper'
import Vue from 'vue'

export default {
  host: /.*lib\.ru.*/,
  name: 'Lib.Ru',
  logo() {
    return '/img/book.png'
  },
  example: 'http://az.lib.ru/a/awdeew_m_w/text_0005.shtml',
  async getChapter(url) {
    Vue.config.ignoredElements = [
      // Use a `RegExp` to ignore all elements that start with "nova-"
      // 2.5+ only
      /xxx7/
    ]
    let $chapterHTML = await Helper.scrape(url, -1, 'windows-1251')
    let bookPath = $chapterHTML.find('h2 a').attr('href')
    $chapterHTML.find('h2 a').remove()
    let chapter = {
      url: url,
      content: $chapterHTML.find('[align="justify"]').html(),
      title: $chapterHTML
        .find('h2')
        .text()
        .trim()
    }
    if (bookPath) {
      let bookURL = `http://az.lib.ru${bookPath}`
      chapter.book = await this.getBook(bookURL)
    }
    return chapter
  },
  async getBook(url) {
    let $bookHTML = await Helper.scrape(url, -1, 'windows-1251')
    let book = {
      url: url,
      title: $bookHTML
        .find('h2')[0]
        .innerText.trim()
        .split('\n')[1]
        .replace(':', ''),
      thumbnail: $bookHTML.find('font a img').attr('src'),
      chapters: []
    }
    if (!url.endsWith('/')) url = url + '/'
    for (let a of $bookHTML.find('dl li a[href]')) {
      let href = $(a).attr('href')
      book.chapters.push({
        title: $(a)
          .find('b')
          .text()
          .trim(),
        url: `${url}/${href}`.replace(/(\/+)/g, '/').replace(':/', '://')
      })
    }
    book.chapters = book.chapters.filter(
      chapter => chapter.title && chapter.url
    )
    return book
  },
  async getBooklist(url) {
    let $html = await Helper.scrape(url, -1, 'koi8-r')
    let list = []
    for (let a of $html.find('li a[href]')) {
      let href = $(a).attr('href')
      if (href && href.startsWith('http://az.lib.ru/')) {
        list.push({
          url: `http://${this.host}${href}`,
          title: $(a)
            .text()
            .trim()
        })
      }
    }
    window.$html = $html

    return list
  }
}
