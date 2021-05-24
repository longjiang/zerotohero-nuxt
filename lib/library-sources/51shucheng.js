import Helper from '@/lib/helper'

export default {
  host: /www\.51shucheng\.(net|com)/,
  name: '无忧书城 51shucheng.com',
  logo() {
    return 'https://www.51shucheng.net/images/logo.png'
  },
  example: 'https://www.51shucheng.net/kehuan/santi',
  async getBooklist(url) {
    let root = await Helper.proxyParsed(url)
    let list = []
    for (let a of root.querySelectorAll('.zuojia table a, .mulu-list a')) {
      list.push({
        title: a.innerText,
        url: a.getAttribute('href')
      })
    }
    return list
  },
  async getBook(url) {
    let root = await Helper.proxyParsed(url)
    let authorNode = root.querySelector('.info a:nth-of-type(2)')
    let catNode = root.querySelector('.info a:first-of-type')
    let book = {
      url: url,
      title: root.querySelector('.catalog h1').innerText,
      author: authorNode ? authorNode.getAttribute('title') : '',
      category: catNode ? catNode.getAttribute('title') : '',
      chapters: []
    }
    for (let a of root.querySelectorAll('.mulu-list a')) {
      book.chapters.push({
        title: a.getAttribute('title'),
        url: a.getAttribute('href')
      })
    }
    return book
  },
  async getChapter(url) {
    let root = await Helper.proxyParsed(url)
    let chapter = {
      title: root.querySelector('h1').innerText,
      content: root.querySelector('.neirong').innerHTML,
      book: {
        url: root.querySelector('.info a').getAttribute('href'),
        title: root.querySelector('.info a').getAttribute('title'),
        author: undefined,
        thumbnail: undefined,
        chapters: []
      }
    }
    chapter.book = await this.getBook(chapter.book.url)
    return chapter
  }
}
