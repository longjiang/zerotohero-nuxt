import Wol from '@/lib/jw/Wol'

export default class {
  constructor() {
    this.events = []
  }

  async getEventsByYear(yyyy) {
    let events = await this.getEvents()
    var filteredEvents = events.filter(function (event) {
      return Number(event.time.year) === Number(yyyy)
    })
    return filteredEvents
  }

  async getEvents() {
    let article = await Wol.getArticle('https://wol.jw.org/en/wol/d/r1/lp-e/1200271562')
    let nodes = article.contentParsed.querySelectorAll('p')
    let ceOrBce
    let yearParas = {}
    let events = {}
    for (let node of nodes) {
      if (node.classNames.includes('ss')) {
        ceOrBce = node.innerText.trim()
      } else {
        if (ceOrBce && node.classNames.includes('sx')) {
          if (!yearParas[ceOrBce]) yearParas[ceOrBce] = []
          yearParas[ceOrBce].push(node)
        }
      }
    }
    for (let ceBce in yearParas) {
      events[ceBce] = this.processYearParas(yearParas[ceBce], ceBce)
    }
    let flattened = []
    for (let key in events) {
      flattened = flattened.concat(events[key])
    }
    this.events = flattened
    return this.events
  }

  processYearParas(yearParas, ceOrBce) {
    let events = []
    for (var yearPara of yearParas) {
      var yearEvent = this.processYearPara(yearPara, ceOrBce)
      events.push(yearEvent)
    }
    return events
  }

  yearSign(ceOrBce) {
    if (ceOrBce === "B.C.E.") {
      return -1;
    } else {
      return 1;
    }
  }

  processYearPara(yearPara, ceOrBce) {
    var event = this.processEventPara(yearPara)
    var m = event.title.match(/^(.*?),\s(.*)/, '$1') // c. 49-50
    event.title = m[2]
    event.time.yearString = m[1] + ' ' + ceOrBce
    var matches = event.time.yearString.match(/((a|b|c)\.\s)?(\d+)(-(\d+))?/)
    event.time.approximateType = matches ? matches[2] : undefined // c.
    event.time.year = matches ? this.yearSign(ceOrBce) * Number(matches[3]) : undefined// 49
    event.time.endYear = matches ? matches[5] : undefined // 50
    return event
  }

  processEventPara(eventPara, ceOrBce) {
    var mapFunc = (a) => {
      return {
        title: a.innerText.replace(';', ''),
        url: a.getAttribute('href')
      }
    }
    var scriptureRefs = eventPara.querySelectorAll('a.b').map(mapFunc)
    var pubRefs = eventPara.querySelectorAll('a:not(.b)').map(mapFunc)
    var niPubRefs = eventPara.querySelectorAll('.ni').map(mapFunc)
    eventPara.querySelectorAll('a, .ni').map(a => a.remove())
    var event = {
      title: eventPara.innerText.replace(' ()', '').replace(': ', ''), // remove empty parenthesis
      scriptureRefs,
      pubRefs,
      niPubRefs,
      source: 'watchtower',
      time: {}
    }
    return event
  }

  search(string) {
    var events = []
    for (var event of this.events) {
      if (event.title.match(new RegExp(string, 'gi')) || event.time.yearString.match(new RegExp(string, 'gi'))) {
        event.search = string
        events.push(event)
      }
    }
    return events
  }

  searchMultiple(strings) {
    var events = []
    if (strings.length > 0) {
      var regexpString = '(' + strings[0]
      for (var string of strings) {
        regexpString = regexpString + '|' + string
      }
      regexpString = regexpString + ')'
      for (var event of this.events) {
        var regexp = new RegExp(regexpString, 'gi')
        if (event.title.match(regexp) || event.time.yearString.match(regexp)) {
          event.search = regexpString
          events.push(event)
        }
      }
    }
    return events
  }
}