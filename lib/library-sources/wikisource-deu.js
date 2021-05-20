import Helper from '@/lib/helper'

export default {
  host: /.+\.wikisource\.org.*/,
  name: 'Wikisource',
  example() {
    return `https://de.wikisource.org/wiki/(Article Name)`
  },
  logo() {
    return `https://de.wikisource.org/static/images/project-logos/dewikisource.png`
  },
  async getChapter(url) {
    let $chapterHTML = await Helper.scrape2(url)
    let a = $chapterHTML.find('#ws-author a')
    let bookPath = $(a).attr('href')
    let book = {
      url: bookPath ? `https://de.wikisource.org${bookPath}` : undefined,
      title: $chapterHTML.find('.subpages a').text(),
      author: $(a).text(),
      thumbnail: '',
      chapters: []
    }
    if (book.url) {
      book = await this.getBook(book.url)
    }
    $chapterHTML
      .find('*')
      .contents()
      .each(function() {
        if (this.nodeType === Node.COMMENT_NODE) {
          $(this).remove()
        }
      })
    $chapterHTML.find('.ws-noexport').remove()
    for (let a of $chapterHTML.find('.mw-parser-output a')) {
      $(a).attr(
        'href',
        Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
      )
    }
    let chapter = {
      title: $chapterHTML
        .find('#firstHeading')
        .text()
        .trim(),
      content: $chapterHTML.find('.mw-parser-output').html(),
      book: book
    }
    return chapter
  },
  async getBook(url) {
    let $bookHTML = await Helper.scrape2(url)
    let chapters = []
    for (let a of $bookHTML.find('.mw-parser-output b a')) {
      chapters.push({
        title: $(a).text(),
        url: Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
      })
    }
    let thumbnail = 'https:' + $bookHTML.find('table img').attr('src')
    return {
      url: url,
      title: $bookHTML.find('#firstHeading').text(),
      thumbnail: thumbnail,
      chapters
    }
  },
  async getBooklist(url, l1) {
    let $html = await Helper.scrape2(url)
    $html
      .find('.mw-parser-output > p:first-child, #toc, .mw-editsection')
      .remove()
    let list = []
    for (let a of $html.find('.mw-parser-output td:first-child a')) {
      list.push({
        url: `https://de.wikisource.org${$(a).attr('href')}`,
        title: $(a)
          .text()
          .trim()
      })
    }
    return list.filter(item => !item.title.includes('Категория:'))
  }
}
