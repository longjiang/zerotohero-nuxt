import Helper from '@/lib/helper'

export default {
  host: 'www.luoxia.com',
  name: 'Luoxia 落霞小说',
  logo() {
    return 'https://www.luoxia.com/theme/img/logo.svg'
  },
  example: 'https://www.luoxia.com/banshengyuan/',
  async getBook(url) {
    let $bookHTML = await Helper.scrape2(url)
    let book = {
      title: $bookHTML
        .find('.book-describe h1')
        .text()
        .trim(),
      author: $bookHTML
        .find('.book-describe h1 + p')
        .text()
        .trim()
        .replace('作者：', ''),
      thumbnail: $bookHTML.find('.book-img img').attr('src'),
      chapters: []
    }
    for (let a of $bookHTML.find('.book-list a')) {
      book.chapters.push({
        title: $(a).attr('title'),
        url: $(a).attr('href')
      })
    }
    return book
  },
  async getChapter(url) {
    let $chapterHTML = await Helper.scrape2(url)
    let chapter = {
      title: $chapterHTML
        .find('#nr_title')
        .text()
        .trim(),
      content: $chapterHTML.find('#nr1').html()
    }
    this.chapters = []
    let bookURL = url.replace(/[^/]*$/, '')
    chapter.book = await this.getBook(bookURL)
    return chapter
  },
  async getBooklist(url) {
    let $html = await Helper.scrape2(url)
    let list = []
    if (url === 'https://www.luoxia.com/') {
      for (let a of $html.find('.hot-book a')) {
        list.push({
          url: $(a).attr('href'),
          title: $(a)
            .find('.pop-tit')
            .text(),
          author: $(a)
            .find('.pop-intro')
            .text()
        })
      }
    } else {
      for (let li of $html.find('.pop-book2')) {
        list.push({
          url: $(li)
            .find('a')
            .attr('href'),
          title: $(li)
            .find('a')
            .attr('title'),
          author: $(li)
            .find('.pop-intro')
            .text(),
          thumbnail: $(li)
            .find('img')
            .attr('src')
        })
      }
    }
    return list
  }
}
