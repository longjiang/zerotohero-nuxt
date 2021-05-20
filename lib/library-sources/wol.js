import Helper from '@/lib/helper'

export default {
  host: 'wol.jw.org',
  name: 'WOL',
  example(l2) {
    l2 = l2.replace('zh', 'cmn-Hans')
    return `https://wol.jw.org/${l2}/(article path)`
  },
  logo() {
    return 'https://assetsnffrgf-a.akamaihd.net/assets/m/802013134/univ/art/802013134_univ_cnt_8_xl.jpg'
  },
  async getChapter(url, l1) {
    let $chapterHTML = await Helper.scrape2(url)
    let title = $chapterHTML
      .find('header h1')
      .text()
      .trim()
    $chapterHTML.find('header').remove()
    for (let img of $chapterHTML.find('img')) {
      $(img).attr('src', `https://${this.host}` + $(img).attr('src'))
    }
    for (let a of $chapterHTML.find('a')) {
      $(a).attr('href', `https://${this.host}` + $(a).attr('href'))
    }
    let chapter = {
      url: url,
      title: title,
      content: $chapterHTML.find('article').html()
    }
    let href = $chapterHTML.find('.navPublications a').attr('href')
    if (href) {
      let bookURL = href
      chapter.book = await this.getBook(bookURL)
    }
    return chapter
  },
  async getBook(url, l1) {
    let $bookHTML = await Helper.scrape2(url)
    let thumbnail = $bookHTML
      .find('ul.directory li.row:first-child img')
      .attr('src')
    let book = {
      url: url,
      title: $bookHTML
        .find('.materialNav h1')
        .text()
        .trim(),
      thumbnail: thumbnail ? 'https://wol.jw.org' + thumbnail : undefined,
      chapters: []
    }
    for (let li of $bookHTML.find('ul.directory li.row')) {
      book.chapters.push({
        title: $(li)
          .find('.cardTitleBlock')
          .text()
          .trim(),
        url:
          'https://wol.jw.org' +
          $(li)
            .find('a')
            .attr('href')
      })
    }
    return book
  },
  async getBooklist(url, l1) {
    let $html = await Helper.scrape2(url)
    let list = []
    for (let li of $html.find('ul.directory li.row')) {
      let thumbnail = $(li)
        .find('.cardThumbnailImage')
        .attr('src')
      list.push({
        url:
          'https://wol.jw.org' +
          $(li)
            .find('a')
            .attr('href'),
        title: $(li)
          .find('.cardTitleBlock')
          .text()
          .trim(),
        thumbnail: thumbnail ? 'https://wol.jw.org' + thumbnail : undefined
      })
    }

    return list
  },
  booklists(l1) {
    return []
  }
}
