import { scrape, absoluteURL } from '../utils'

export default {
  host: 'zh.wikisource.org',
  name: 'Wikisource',
  example: 'https://zh.wikisource.org/wiki/西遊記',
  logo() {
    return 'https://zh.wikisource.org/static/images/project-logos/zhwikisource-2x.png'
  },
  async getBook(url) {
    let $bookHTML = await scrape(url)
    $bookHTML.find('.sisitem').remove()
    let chapters = []
    for (let a of $bookHTML.find('.mw-parser-output li a')) {
      chapters.push({
        title: $(a).text(),
        url: absoluteURL(url, decodeURIComponent($(a).attr('href')))
      })
    }
    let as = $bookHTML.find(
      '#headerContainer > table:first-child td:nth-child(3) a'
    )
    return {
      url: url,
      title: $bookHTML.find('#firstHeading').text(),
      author: $(as[as.length - 1]).text(),
      thumbnail: '',
      chapters
    }
  },
  async getChapter(url) {
    let $chapterHTML = await scrape(url)
    if (!$chapterHTML) return
    let as = $chapterHTML.find(
      '#headerContainer > table:first-child td:nth-child(3) a'
    )
    let book = {
      title: $chapterHTML.find('.subpages a').text(),
      author: $(as[as.length - 1]).text(),
      thumbnail: '',
      chapters: []
    }
    const bookPath = $chapterHTML.find('.subpages a').attr('href')
    if (bookPath) {
      const bookURL = 'https://zh.wikisource.org' + bookPath
      book = await this.getBook(bookURL)
      book.url = bookURL
    }
    $chapterHTML.find('.mw-parser-output > table:first-of-type').remove()
    $chapterHTML.find('.mw-editsection').remove()
    $chapterHTML.find('#headerContainer').remove()
    $chapterHTML.find('#toc').remove()
    $chapterHTML
      .find('*')
      .contents()
      .each(function () {
        if (this.nodeType === Node.COMMENT_NODE) {
          $(this).remove()
        }
      })
    for (let a of $chapterHTML.find('.mw-parser-output a')) {
      $(a).attr(
        'href',
        absoluteURL(url, decodeURIComponent($(a).attr('href')))
      )
    }
    return {
      title: $chapterHTML
        .find('#firstHeading')
        .text()
        .trim(),
      content: $chapterHTML.find('.mw-parser-output').html(),
      book: book
    }
  },
  async getBooklist(url) {
    let $html = await scrape(url)
    $html
      .find('.mw-parser-output > p:first-child, #toc, .mw-editsection')
      .remove()
    let list = []
    for (let a of $html.find(
      '.mw-parser-output li a:first-of-type:not(.new)'
    )) {
      list.push({
        url: 'https://zh.wikisource.org' + $(a).attr('href'),
        title: $(a)
          .text()
          .trim()
      })
    }
    return list
  }
}
