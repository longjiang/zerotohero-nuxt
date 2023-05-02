import { scrape, absoluteURL } from '../utils'

export default {
  host: /.*fr\.wikisource\.org.*/,
  name: 'Wikisource',
  example() {
    return `https://fr.wikisource.org/wiki/(Article Name)`
  },
  logo() {
    return `https://fr.wikisource.org/static/images/project-logos/frwikisource.png`
  },
  async getChapter(url) {
    let $chapterHTML = await scrape(url)
    let a = $chapterHTML.find('#ws-author a')
    let bookPath = $(a).attr('href')
    let book = {
      url: bookPath ? `https://fr.wikisource.org${bookPath}` : undefined,
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
        absoluteURL(url, decodeURIComponent($(a).attr('href')))
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
    let $bookHTML = await scrape(url)
    let chapters = []

    for (let a of $bookHTML.find('.mw-parser-output > ul a')) {
      let title = $(a)
        .text()
        .trim()
      if (title && title !== '') {
        chapters.push({
          title: title,
          url: absoluteURL(url, decodeURIComponent($(a).attr('href')))
        })
      }
    }
    let thumbnail = 'https:' + $bookHTML.find('img.photo').attr('src')
    return {
      url: url,
      title: $bookHTML.find('#firstHeading').text(),
      thumbnail: thumbnail,
      chapters
    }
  },
  async getBooklist(url) {
    let $html = await scrape(url)
    $html
      .find('.mw-parser-output > p:first-child, #toc, .mw-editsection')
      .remove()
    let list = []
    for (let a of $html.find('.mw-category a')) {
      list.push({
        url: `https://fr.wikisource.org${$(a).attr('href')}`,
        title: $(a)
          .text()
          .trim()
          .replace('Auteur:', '')
      })
    }
    return list.filter(item => !item.title.includes('Категория:'))
  }
}