import Helper from '@/lib/helper'

export default {
  host: /.*ru\.wikisource\.org.*/,
  name: 'Wikisource',
  example: 'https://ru.wikisource.org/wiki/Духовная_война/Душа_и_ее_падение',
  logo() {
    return 'https://ru.wikisource.org/static/images/project-logos/ruwikisource-2x.png'
  },
  async getBook(url) {
    let $bookHTML = await Helper.scrape(url)
    $bookHTML
      .find(
        '#headertemplate, .header_notes, .ws-noexport, .mw-parser-output > table:first-of-type, .mw-editsection, #headerContainer, #toc, .sisitem, .mw-cite-backlink'
      )
      .remove()
    let chapters = []
    for (let a of $bookHTML.find('.mw-parser-output li a')) {
      chapters.push({
        title: $(a).text(),
        url: Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
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
    let $chapterHTML = await Helper.scrape(url)
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
      const bookURL = 'https://ru.wikisource.org' + bookPath
      book = await this.getBook(bookURL)
      book.url = bookURL
    }
    $chapterHTML
      .find(
        '#headertemplate, .header_notes, .ws-noexport, .mw-parser-output > table:first-of-type, .mw-editsection, #headerContainer, #toc'
      )
      .remove()
    $chapterHTML
      .find('*')
      .contents()
      .each(function() {
        if (this.nodeType === Node.COMMENT_NODE) {
          $(this).remove()
        }
      })
    for (let a of $chapterHTML.find('.mw-parser-output a')) {
      $(a).attr(
        'href',
        Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
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
    let $html = await Helper.scrape(url)
    $html
      .find('.mw-parser-output > p:first-child, #toc, .mw-editsection')
      .remove()
    let list = []
    for (let a of $html.find('.mw-category li a, .mw-content-ltr li a')) {
      list.push({
        url: 'https://ru.wikisource.org' + $(a).attr('href'),
        title: $(a)
          .text()
          .trim()
      })
    }
    return list.filter(item => !item.title.includes('Категория:'))
  }
}
