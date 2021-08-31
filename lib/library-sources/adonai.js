import Helper from '@/lib/helper'

export default {
  host: /.*adonai\.pl.*/,
  name: 'Adonai.pl',
  logo() {
    return 'https://adonai.pl/graph/logo960_d.png'
  },
  example: 'https://adonai.pl/opowiadania/bajki/?id=1',
  async getChapter(url) {
    let $chapterHTML = await Helper.scrape(url, -1, 'ISO-8859-2')
    $chapterHTML.find('#maintabcenter center').remove()
    let chapter = {
      url: url,
      content: $chapterHTML.find('#maintabcenter').html(),
      title: $chapterHTML
        .find('h1')
        .eq(0)
        .text()
        .trim()
    }
    let bookURL = 'https://adonai.pl/opowiadania/bajki/'
    chapter.book = await this.getBook(bookURL)
    return chapter
  },
  async getBook(url) {
    let $bookHTML = await Helper.scrape(url, -1, 'ISO-8859-2')
    let book = {
      url: url,
      title: $bookHTML
        .find('h1')
        .text()
        .trim(),
      chapters: []
    }
    for (let a of $bookHTML.find('#tabcontentmain a')) {
      book.chapters.push({
        title: $(a)
          .text()
          .trim(),
        url: `${url}${$(a).attr('href')}`
      })
    }
    return book
  },
  async getBooklist(url) {
    let $html = await Helper.scrape(url, -1, 'ISO-8859-2')
    let list = []
    for (let a of $html.find('#tabcontentmain a')) {
      list.push({
        url: `https://adonai.pl${$(a).attr('href')}`,
        title: $(a)
          .text()
          .trim()
      })
    }
    return list
  }
}
