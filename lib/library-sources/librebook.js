import Helper from '@/lib/helper'

export default {
  host: /.*librebook\.me.*/,
  name: 'LibreBook',
  logo() {
    return 'https://res.librebook.me/static/logo-57412dd2af5f1a655af443850d5c0a51.png'
  },
  example: 'https://librebook.me/evgenii_onegin/vol1/2?mtr=',
  async getChapter(url) {
    let $chapterHTML = await Helper.scrape2(url)
    let chapter = {
      url: url,
      content: $chapterHTML.find('.b-chapter').html(),
      title: $chapterHTML
        .find('#chapterSelectorSelect option[selected]')
        .eq(0)
        .text()
        .trim()
    }
    let href = $chapterHTML.find('.title a').attr('href')
    if (href) {
      let bookURL = `https://${this.host}${href}`
      chapter.book = await this.getBook(bookURL)
    }
    return chapter
  },
  async getBook(url) {
    let $bookHTML = await Helper.scrape2(url)
    let book = {
      url: url,
      title: $bookHTML
        .find('h1.names .name')
        .text()
        .trim(),
      thumbnail: $bookHTML
        .find('.picture-fotorama img:first-child')
        .attr('src'),
      chapters: []
    }
    for (let a of $bookHTML.find('.chapters-link tr a')) {
      book.chapters.push({
        title: $(a)
          .text()
          .trim(),
        url: `https://${this.host}${$(a).attr('href')}`
      })
    }
    return book
  },
  async getBooklist(url) {
    let $html = await Helper.scrape2(url)
    let list = []
    for (let li of $html.find('.review-short-description, .tiles .tile')) {
      if (
        $(li)
          .find('.chapters')
          .text()
          .trim() === 'Online'
      ) {
        list.push({
          url: `https://${this.host}${$(li)
            .find('h3 a')
            .attr('href')}`,
          title: $(li)
            .find('h3 a')
            .text()
            .trim(),
          thumbnail:
            $(li)
              .find('img.small-avatar')
              .attr('src') ||
            $(li)
              .find('.img img')
              .attr('data-original')
        })
      }
    }

    return list
  }
}
