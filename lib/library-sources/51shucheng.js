import Helper from '@/lib/helper'

export default {
  host: /www\.51shucheng\.(net|com)/,
  name: '无忧书城 51shucheng.com',
  logo() {
    return 'https://www.51shucheng.net/images/logo.png'
  },
  example: 'https://www.51shucheng.net/kehuan/santi',
  async getBooklist(url) {
    let $html = await Helper.scrape(url)
    let list = []
    for (let a of $html.find('.zuojia table a, .mulu-list a')) {
      list.push({
        title: $(a).text(),
        url: $(a).attr('href')
      })
    }
    return list
  },
  async getBook(url) {
    let $html = await Helper.scrape(url)
    let book = {
      url: url,
      title: $html.find('.catalog h1').text(),
      author: $html.find('.info a:nth-of-type(2)').attr('title'),
      category: $html.find('.info a:first-of-type').attr('title'),
      chapters: []
    }
    for (let a of $html.find('.mulu-list a')) {
      book.chapters.push({
        title: $(a).attr('title'),
        url: $(a).attr('href')
      })
    }
    return book
  },
  async getChapter(url) {
    let $html = await Helper.scrape(url)
    let chapter = {
      title: $html.find('h1').text(),
      content: $html.find('.neirong').html(),
      book: {
        url: $html.find('.info a').attr('href'),
        title: $html.find('.info a').attr('title'),
        author: undefined,
        thumbnail: undefined,
        chapters: []
      }
    }
    chapter.book = await this.getBook(chapter.book.url)
    return chapter
  }
}
