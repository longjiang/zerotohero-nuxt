import Wikipedia from '@/lib/jw/Wikipedia'
import Helper from '@/lib/Helper'
import $ from 'jquery'

export default class {
  constructor(wikiepediaYearPageEventsListItem, yyyy) {
    this.listItem = wikiepediaYearPageEventsListItem // a list item on a year page
    this.dateDescription = ''
    $(this.listItem).find('a').each(function () {
      if ($(this).attr('href').indexOf('#') === 0) {
        $(this).remove();
      }
    })
    this.title = $(this.listItem).text()
    this.titleHtml = $(this.listItem).html()

    this.time = {
      year: yyyy,
      yearString: Helper.getYearTitle(yyyy),
      subYear: '' // Like month, or season, etc
    }
    this.wikipedia = new Wikipedia()
    this.source = 'wikipedia'
  }
  getMainArticle(callback, getPageViewStat = false) {
    var event = this
    if (this.listItem && $(this.listItem).find('a').length > 0) {
      // look at this.listItem, figure out which article to get
      var articleCandidates = []
      $(this.listItem).find('a').each(function () {
        if (!event.isDate($(this).text()) && $(this).text().match(/^[a-z]/) === null) {
          var articleSlug = $(this).attr('href').replace('/wiki/', '')
          articleCandidates.push(articleSlug)
        }
      })
      // console.log('candidates: ', articleCandidates)
      if (articleCandidates.length > 0) {
        if (getPageViewStat) {
          event.getPageViewStat(articleCandidates, callback) // expensive!
        } else {
          event.attachArticle(articleCandidates[0])
          callback(true)
        }
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  }
  getPageViewStat(articleCandidates, callback) {
    var event = this
    event.wikipedia.getLeastPopularPage(articleCandidates, function (leastPopularPage, totalPageViews, data) {
      // console.log('least popular: ', leastPopularPage)
      if (data) {
        event.attachArticle(leastPopularPage)
        event.article.title = data.title //
        event.article.pageViews = totalPageViews
        callback(true)
        // event.wikipedia.getFirstImageOfArticle(leastPopularPage, function (image, articleUrl) { // the first image
        //   if (image) {
        //     article.thumbUrl = image.url
        //   }
        //   callback(true)
        // })
      } else {
        callback(false)
      }
    })
  }
  attachArticle(slug) {
    var event = this
    var article = {}
    article.url = 'http://www.wikipedia.org/wiki/' + slug // the Wikipedia article
    article.slug = slug
    event.article = article
  }
  isDate(text) {
    var months = ['January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ]
    for (var month of months) {
      if (text.indexOf(month) !== -1) {
        return true
      }
    }
    return false
  }
}
