import $ from 'jquery'


export default class {
  constructor () {
    this.apiBaseUrl = 'https://en.wikipedia.org/w/api.php?'
    this.indexBaseUrl = 'https://en.wikipedia.org/w/index.php?'
    this.baseUrl = 'https://en.wikipedia.org/wiki/'
  }
  // getContentByTitle (title, callback) {
  //   var params = {
  //     action: 'query',
  //     format: 'json',
  //     formatversion: '2',
  //     prop: 'revisions|info',
  //     inprop: 'url',
  //     rvprop: 'content',
  //     titles: title
  //   }
  //   this.queryApi(params, function (data) {
  //     if (data.query.pages[0].revisions && data.query.pages[0].revisions.length > 0) {
  //       var markup = data.query.pages[0].revisions[0].content
  //       var articleUrl = data.query.pages[0].canonicalurl
  //       callback(wtf.parse(markup), articleUrl)
  //     }
  //   })
  // }

  getFirstImage (slug, callback) {
    var wikipedia = this
    wikipedia.getHtmlContentByTitle(slug, function (html) {
      var $html = $('<div />').html(html)
      var image = $html.find('img')
      callback(image, html)
    })
  }

  // getFirstImageOfArticle (title, callback) {
  //   var wikipedia = this
  //   this.getContentByTitle(title, function(content, articleUrl) {
  //     // console.log(title, content)
  //     if (content.type == 'redirect') {
  //       wikipedia.getFirstImageOfArticle (content.redirect, callback)
  //     } else {
  //       if (content.images && content.images.length > 0) {
  //         // console.log(title, 'found image: ', content.images[0])
  //         callback(content.images[0], articleUrl)
  //       } else {
  //         callback()
  //       }
  //     }
  //   })
  // }

  getHtmlContentByTitle (title, callback) {
    var params = {
      action: 'parse',
      format: 'json',
      formatversion: '2',
      page: title
    }
    this.queryApi(params, function (data) {
      if (data.parse) {
        callback(data.parse.text)
      }
    })
  }

  getImagesByTitle (title, callback) {
    var params = {
      action: 'parse',
      format: 'json',
      prop: 'images',
      formatversion: '2',
      page: title
    }
    this.queryApi(params, function (data) {
      if (data.parse) {
        callback(data.parse)
      }
    })
  }

  // getHtmlContentByTitle (title, callback) {
  //   var params = {
  //     action: 'render',
  //     prop: 'info',
  //     inprop: 'url',
  //     titles: title
  //   }
  //   this.queryIndex(params, function (data) {
  //     // var articleUrl = data.query.pages[0].canonicalurl
  //     // callback(data, articleUrl)
  //     callback(data)
  //   })
  // }

  queryApi (params, callback) {
    if (params.format && params.format === 'json') {
      $.getJSON({
        url: this.apiBaseUrl + $.param(params),
        crossDomain: true,
        dataType: 'jsonp',
        success: callback
      })
    } else {
      $.ajax(this.apiBaseUrl + $.param(params), callback)
    }
  }

  queryIndex (params, callback) {
    var proxy = new JwProxy()
    proxy.ajax(this.indexBaseUrl + $.param(params), callback)
  }

  getPageViews (title, callback = function(pageViews, data) {}) {
    let wikipedia = this
    let params = {
      action: 'query',
      format: 'json',
      formatversion: '2',
      prop: 'pageviews',
      titles: title
    }
    wikipedia.queryApi(params, function (data) {
      // console.log('page views: ', data)
      if (!(data.error || data.invalid)) {
        let pageViews = data.query.pages[0].pageviews
        if (pageViews) {
          let totalPageViews = Object.keys(pageViews).reduce(function (previous, key) {
            return previous + pageViews[key]
          }, 0)
          callback(totalPageViews, data.query.pages[0])
        } else {
          callback(false)
        } 
      } else {
        callback(false)
      }
    })
  }

  getMostPopularPage (titles, callback) {
    let maxPageViews = 0
    let mostPopularPage
    let wikipedia = this
    let taskMaster = new TaskMaster(titles.length, function () {
      callback(mostPopularPage, maxPageViews)
    })
    for (let title of titles) {
      wikipedia.getPageViews(title, function(totalPageViews) {
        if (totalPageViews > maxPageViews) {
          maxPageViews = totalPageViews
          mostPopularPage = title
        }
        taskMaster.removeTask()
      })
    }
  }

  getLeastPopularPage (slugs, callback) {
    let minPageViews = 0
    let leastPopularPageSlug
    let leastPopularPageData
    let wikipedia = this
    let taskMaster = new TaskMaster(slugs.length, function () {
      callback(leastPopularPageSlug, minPageViews, leastPopularPageData)
    })
    for (let slug of slugs) {
      wikipedia.getPageViews(slug, function(totalPageViews, data) {
        if (leastPopularPageSlug === undefined) {
          minPageViews = totalPageViews
          leastPopularPageSlug = slug
          leastPopularPageData = data
        }
        if (totalPageViews < minPageViews) {
          minPageViews = totalPageViews
          leastPopularPageSlug = slug
          leastPopularPageData = data
        }
        taskMaster.removeTask()
      })
    }
  }
}
