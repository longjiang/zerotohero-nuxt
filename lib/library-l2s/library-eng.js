import Helper from '@/lib/helper'

export default {
  sources: [ 'litnet-eng' ],
  async booklists() {
    let $html = await Helper.scrape2('https://litnet.com/')
    let list = []
    for (let a of $html.find('.b-categories .box li a')) {
      list.push({
        url: 'https://litnet.com' + $(a).attr('href'),
        title: $(a)
          .text()
          .trim()
      })
    }
    return list
  }
}
