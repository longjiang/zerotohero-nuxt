import Helper from '@/lib/helper'

export default {
  host: /.+\.wikipedia\.org.*/,
  name: 'Wikipedia',
  example(l1) {
    return `https://${l1}.wikipedia.org/wiki/(Article Title)`
  },
  logo(l1) {
    return `https://${l1}.wikipedia.org/static/images/project-logos/${l1}wiki.png`
  },
  async getChapter(url, l1) {
    let $chapterHTML = await Helper.scrape(url, 0)
    $chapterHTML.find('.mw-parser-output > table:first-of-type').remove()
    $chapterHTML.find('.mw-editsection').remove()
    $chapterHTML.find('#headerContainer').remove()
    $chapterHTML.find('#toc').remove()
    $chapterHTML
      .find('*')
      .contents()
      .each(function() {
        if (this.nodeType === Node.COMMENT_NODE) {
          $(this).remove()
        }
      })
    let langs = []
    for (let a of $chapterHTML.find('#p-l1 li a')) {
      langs.push({
        title: `${$(a).attr('title')} (${$(a).text()})`,
        url: $(a).attr('href')
      })
    }
    let title = $chapterHTML
      .find('#firstHeading')
      .text()
      .trim()
    for (let a of $chapterHTML.find('.mw-parser-output a')) {
      $(a).attr(
        'href',
        Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
      )
    }
    let chapter = {
      title: title,
      content: $chapterHTML.find('.mw-parser-output').html(),
      book: {
        title: title,
        chapters: langs
      }
    }
    return chapter
  },
  async getBook(url, l1) {
    let $bookHTML = await Helper.scrape(url)
    let chapters = []
    for (let a of $bookHTML.find('#mw-pages li a')) {
      chapters.push({
        title: $(a).attr('title'),
        url: Helper.absoluteURL(url, decodeURIComponent($(a).attr('href')))
      })
    }
    return {
      url: url,
      title: $bookHTML.find('#firstHeading').text(),
      chapters
    }
  },
  async getBooklist(url, l1) {
    let $html = await Helper.scrape(url)
    let list = []
    for (let a of $html.find('#mw-content-text a')) {
      list.push({
        url: `https://${l1}.wikipedia.org${$(a).attr('href')}`,
        title: $(a)
          .text()
          .trim()
      })
    }
    return list
  },
  booklists(l1) {
    return []
  }
}
