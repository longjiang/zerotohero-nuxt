import Helper from '@/lib/Helper'
import langData from '@/lib/jw/languages/en-US'
import { parse } from 'node-html-parser'
import $ from 'jquery'

export const WOL_BASE_URL = 'https://wol.jw.org/'
export const DATA_UPLOADS_URL = '//study.voxelcreative.ca/wp-content/uploads/jw-study-aid/'
export const VIDEO_SCRIPTURE_SEARCH_BASE = '//study.voxelcreative.cawp-json/videosearch/scripture?'
export const VIDEO_TERM_SEARCH_BASE = '//study.voxelcreative.ca/wp-json/videosearch/search?'

export default {
  baseUrl: WOL_BASE_URL,
  async getLanguages() {
    /*
     {
    "languageTitle": "Japanese - 日本語",
    "englishName": "Japanese",
    "asciiEnglishName": "Japanese",
    "vernacularName": "日本語",
    "asciiVernacularName": "???",
    "mepsSymbol": "J",
    "mepsScript": "JAPANESE",
    "isScriptVariant": false,
    "direction": "ltr",
    "isSignLanguage": false,
    "locale": "ja",
    "ietfLocales": [
        "ja"
    ],
    "appRoot": "/",
    "libLangClasses": "ml-J ms-JAPANESE",
    "libLangAttributes": "lang=\"ja\" data-lang=\"J\" dir=\"ltr\"",
    "libs": [
        {
            "title": "日本語出版物（1968-2021）",
            "researchConfigurationID": "r7",
            "symbol": "lp-j",
            "hasRuby": true,
            "isPrivileged": false
        }
      ]
    }
     */
    let data = await Helper.proxy(`https://wol.jw.org/wol/li`)
    if (data) {
      return data.items
    }
  },

  async getBibleBookGroups(l2) {
    let root = await Helper.proxyParsed(`https://wol.jw.org/${l2.wol.locale}/wol/binav/${l2.wol.libs[0].researchConfigurationID}/${l2.wol.libs[0].symbol}/nwt`)
    let audios = await Helper.proxy(`https://wol.jw.org/wol/baa/${l2.wol.libs[0].researchConfigurationID}/${l2.wol.libs[0].symbol}/nwt`)
    return [{
      title: root.querySelectorAll('.group')[0].innerText,
      books: this.books(root, audios, 'hebrew')
    },
    {
      title: root.querySelectorAll('.group')[1].innerText,
      books: this.books(root, audios, 'greek'),
    }
    ]
  },

  async getBibleBook(id, l2) {
    let root = await Helper.proxyParsed(`https://wol.jw.org/${l2.wol.locale}/wol/binav/${l2.wol.libs[0].researchConfigurationID}/${l2.wol.libs[0].symbol}/nwt/${id}`)
    let chapters = []
    let nodes = root.querySelectorAll('.chapter a')
    for (let node of nodes) {
      chapters.push({
        number: node.innerText.trim(),
        path: node.getAttribute('href')
      })
    }
    return {
      title: root.querySelector('.navBook').innerText,
      chapters
    }
  },

  async getBibleChapterAudio(pubMediaServer, audioPublicationSymbol, jwLangSymbol, bookNum, chapterNum) {
    var url = `${pubMediaServer}?pub=${audioPublicationSymbol}&langwritten=${jwLangSymbol}&txtCMSLang=${jwLangSymbol}&fileformat=mp3&booknum=${bookNum}&track=${chapterNum}`
    let data = await $.getJSON({
      url
    })
    var mp3 = data.files[jwLangSymbol].MP3[0]
    return {
      audio_url: mp3.file.url,
      markers: mp3.markers ? mp3.markers.markers : undefined
    }
  },

  async getArticleAudio(pubMediaServer, audioPublicationSymbol, jwLangSymbol, docId) {
    var url = `${pubMediaServer}?langwritten=${jwLangSymbol}&txtCMSLang=${jwLangSymbol}&fileformat=mp3&docid=${docId}`
    let data = await $.getJSON({
      url
    })
    var mp3 = data.files[jwLangSymbol].MP3[0]
    return {
      audio_url: mp3.file.url,
      markers: mp3.markers ? mp3.markers.markers : undefined
    }
  },

  async getBibleChapter(bookId, chapterId, l2) {
    return await this.getArticle(`https://wol.jw.org/${l2.wol.locale}/wol/b/${l2.wol.libs[0].researchConfigurationID}/${l2.wol.libs[0].symbol}/nwt/${bookId}/${chapterId}`)
  },

  async getArticle(url, options) {
    let defaults = {
      selector: "#article",
      snippet: false,
      prefix: false
    }
    let { selector, snippet, prefix } = { ...defaults, ...options }
    if (/^\/[^/]/.test(url)) {
      url = 'https://wol.jw.org' + url
    }
    let root = await Helper.proxyParsed(url + (snippet ? '?snip=yes' : ''))
    let articleNode = root.querySelector(selector)
    // articleNode.querySelectorAll('.pswp, .welcomeContainer, .announcementContainer').remove()
    if (articleNode) {
      articleNode = this.addBaseUrlToAttribute(articleNode, 'src')
      articleNode = this.addBaseUrlToAttribute(articleNode, 'href')
      articleNode = this.addBaseUrlToAttribute(articleNode, 'data-json-src')
      articleNode = this.addBaseUrlToAttribute(articleNode, 'data-img-src')
      if (prefix) this.addPrefixToUrls(articleNode, prefix)
      articleNode.querySelectorAll(".pswp, .welcomeContainer, .announcementContainer").map(n => n.remove())
      let studyNode = root.querySelector('#studyDiscover')
      let article = {
        url,
        html: root.innerHTML,
        htmlParsed: root,
        study: studyNode ? studyNode.innerHTML : undefined,
        studyParsed: studyNode ? studyNode : undefined,
        prevUrl: Helper.unlessUndefined(root.querySelector('.resultNavLeft a'), a => a.getAttribute('href')),
        nextUrl: Helper.unlessUndefined(root.querySelector('.resultNavRight a'), a => a.getAttribute('href')),
        contentsUrl: Helper.unlessUndefined(root.querySelector('.navPublications a'), a => a.getAttribute('href')),
        title: Helper.unlessUndefined(root.querySelector('#contentTitle'), t => t.getAttribute('value')) || Helper.unlessUndefined(root.querySelector('.resultDocumentPubTitle'), t => t.innerText.trim()),
        publicationTitle: Helper.unlessUndefined(root.querySelector('#documentDescription') || root.querySelector('#parentTitle'), d => d.getAttribute('value')),
        thumbnail: Helper.unlessUndefined(root.querySelector('#contentThumbnail'), d => 'https://wol.jw.org' + d.getAttribute('value')),
        symbol: Helper.unlessUndefined(root.querySelector('#englishSym'), d => d.getAttribute('value')),
        audioSymbol: Helper.unlessUndefined(root.querySelector('#audioPubSym'), d => d.getAttribute('value')),
        docId: Helper.unlessUndefined(root.querySelector('#docId'), d => d.getAttribute('value')),
        pubMediaServer: Helper.unlessUndefined(root.querySelector('#pubMediaServer'), d => d.getAttribute('value')),
        content: articleNode.innerHTML,
        contentParsed: articleNode
      }
      return article
    } else {
      console.log('WOL: Cannot get article', url, selector, snippet, prefix)
    }
  },

  async getArticlesByJson(url, prefix = false) {
    if (/^\/[^/]/.test(url)) {
      url = 'https://wol.jw.org' + url
    }
    let json = await Helper.proxy(url)
    let articles = []
    if (json && json.items && json.items.length > 0) {
      for (let item of json.items) {
        let contentParsed = parse(item.content)
        contentParsed = this.addBaseUrlToAttribute(contentParsed, 'src')
        contentParsed = this.addBaseUrlToAttribute(contentParsed, 'href')
        if (prefix) this.addPrefixToUrls(contentParsed, prefix)
        contentParsed.querySelectorAll(".pswp, .welcomeContainer, .announcementContainer").map(n => n.remove())
        articles.push({
          url: item.url,
          title: item.title,
          publicationTitle: item.publicationTitle,
          thumbnail: item.imageUrl ? 'https://wol.jw.org' + item.imageUrl : undefined,
          symbol: item.englishSymbol,
          content: contentParsed.innerHTML,
          contentParsed
        })
      }
      return articles
    } else {
      console.log('Cannot get article from json: ', url, prefix)
    }
  },

  books(root, audios, group) {
    let books = []
    let nodes = root.querySelectorAll(`.books.${group} .book`)
    for (let i in nodes) {
      let node = nodes[i]
      books.push({
        title: node.querySelector('.name').innerText.trim(),
        abbreviation: node.querySelector('.abbreviation').innerText.trim(),
        official: node.querySelector('.official').innerText.trim(),
        path: node.querySelector('.bookLink').getAttribute('href'),
        group,
        number: Number(i) + 1 + (group === 'hebrew' ? 0 : 39),
        category: node.classNames.replace('book ', ''),
      })
    }
    for (let i in books) {
      books[i].audio = audios[Number(i) + 1 + (group === 'hebrew' ? 0 : 39)]
    }
    return books
  },

  getEnglishSymbolFromHtml(html) {
    return $(html).find('#englishSym').val()
  },

  getDayTextUrl(langData) {
    return this.baseUrl + langData.code + '/' + langData.day_text_url + Helper.getTodaysDate()
  },

  htmlPathToJsonPath(htmlPath) {
    return htmlPath.replace(/\/?.*?\/(.*)/, '/$1')
  },
  htmlUrlToJsonUrl(htmlUrl) {
    // JSON URL is simply HTML URL without the language code:
    // HTML: https://wol.jw.org/en/wol/bc/r1/lp-e/1102021405/39/0
    // JOSN: https://wol.jw.org/wol/bc/r1/lp-e/1102021405/39/0
    return htmlUrl.replace(/.*?:\/\/.*?\/.*?\/(.*)/g, this.baseUrl + '$1')
  },
  jsonUrlToHtmlUrl(jsonUrl) {
    if (jsonUrl.indexOf(WOL_BASE_URL + 'wol') === 0) {
      return jsonUrl.replace(/(.*:\/\/.*?\/)(.*)/, '$1' + langData.code + '/$2')
    }
  },

  getDirectory(url, callback) {
    let wol = this
    wol.getArticleHtmlThen(url, function (html) {
      let $html = $(html)
      let links = $html.find('article .directory a').get()
      callback(links)
    })
  },

  getEntryUrlFromDirectory(url, term, callback) {
    let wol = this
    wol.getArticleHtmlThen(url, function (html) {
      let $html = $(html)
      $html.find('article .directory a').each(function () {
        if ($(this).text().indexOf(term) === 0) {
          let url = $(this).attr('href')
          callback(url)
          return true
        }
      })
    })
  },

  getInsightArticle(term, callback) {
    let wol = this
    wol.getEntryUrlFromDirectory('https://wol.jw.org/en/wol/lv/r1/lp-e/0/621', term.charAt(0), function (url) {
      wol.getEntryUrlFromDirectory(url, term, function (url) {
        wol.getArticleHtmlThen(url, function (html) {
          callback(html, url)
        })
      })
    })
  },

  async getArticleJson(url) {
    var wol = this
    let data = await Helper.proxy(url)

    if (typeof (data.items) !== 'undefined') {
      var dataItemsWithAbosoluteUrls = $.map(data.items, function (item, index) {
        item.imageUrl = wol.baseUrl + item.imageUrl
        var newContent = item.content.replace(/(href|src)="\//g, '$1="' + wol.baseUrl)
        item.content = newContent
        return item
      })
      data.items = dataItemsWithAbosoluteUrls
    } else if (data.title !== undefined) {
      data.imageUrl = url + '/thumbnail'
      var newContent = data.content.replace(/(href|src)="\//g, '$1="' + wol.baseUrl)
      data.content = newContent
      let json = {
        items: [
          data
        ]
      }
      return json
    }
  },

  addBaseUrlToAttribute(root, attribute, baseUrl = 'https://wol.jw.org') {
    for (let element of root.querySelectorAll(`[${attribute}]`)) {
      let value = element.getAttribute(attribute)
      if (/^\/[^/]/.test(value)) {
        element.setAttribute(attribute, baseUrl + value)
      }
    }
    return root
  },

  addPrefixToUrls(root, prefix = '/article?url=') {
    for (let element of root.querySelectorAll(`a[href]`)) {
      let value = element.getAttribute('href')
      if (value.startsWith('https://wol.jw.org/en/wol/')) {
        element.setAttribute('href', prefix + value)
      }
    }
    return root
  },

  getBibleSnippetHtmlThen(wolHtmlUrl, callback = undefined) {
    this.getArticleHtmlThen(wolHtmlUrl, function (html) {
      callback(html)
    })
  },

  getPubs(type, callback) {
    let pubs = langData.pubs
    this.getDirectory(pubs[type], function (links) {
      let pubs = []
      $(links).each(function () {
        pubs.push({
          name: $(this).find('.title').text(),
          thumbUrl: $(this).find('img').attr('src'),
          url: $(this).attr('href'),
          year: $(this).find('.details').text()
        })
      })
      callback(pubs)
    })
  },

  async getBibleSnippetJson(wolJsonUrl) {
    return await this.getArticleJson(wolJsonUrl)
  },


  splitBibleCitationIntoChapters(json) {
    var scripture = json.items[0]
    // Divide the content into segments by chapter
    // nested ia an array, each is a segment (which itself is an array of paragraphs)
    var scriptureGroup = []

    $('<div>' + scripture.content + '</div>').find('> p, > div').each(function (index, paragraph) {
      // If this is the first, then create a new array and push into nested
      if (index === 0) {
        scriptureGroup.push([paragraph])
      } else if ($(paragraph).find('a.cl').length > 0) {
        // If this paragraph has a chapter number, this is a new chapter!
        // Store this paragraph and those after in a separate array
        // Until a new Chapter heading is found
        scriptureGroup[scriptureGroup.length] = [paragraph]
      } else {
        scriptureGroup[scriptureGroup.length - 1].push(paragraph)
      }
    })
  },

  getVideo(vid, callback, jwLangSymbol = langData.jwLangSymbol) {
    this.proxy.getJSON('https://data.jw-api.org/mediator/v1/media-items/' + langData.jwLangSymbol + '/' + vid + '?clientType=jworg', function (json) {
      callback(json)
    })
  },

  getVideoCategories(callback, jwLangSymbol = langData.jwLangSymbol) {
    var url = 'https://data.jw-api.org/mediator/v1/categories/' + jwLangSymbol + '/VideoOnDemand?detailed=1&offset=0&limit=30&clientType=jworg'
    this.proxy.getJSON(url, function (json) {
      callback(json)
    })
  },

  getVideoCategory(categoryKey, callback, jwLangSymbol = langData.jwLangSymbol) {
    var url = 'https://data.jw-api.org/mediator/v1/categories/' + langData.jwLangSymbol + '/' + categoryKey + '?detailed=1&offset=0&limit=30&clientType=jworg'
    this.proxy.getJSON(url, function (json) {
      callback(json)
    })
  },

  getVideoSubcategory(subcategoryKey, callback) {
    var url = 'https://data.jw-api.org/mediator/v1/categories/' + langData.jwLangSymbol + '/' + subcategoryKey + '?detailed=1&offset=0&limit=30&clientType=jworg'
    this.proxy.getJSON(url, function (json) {
      callback(json)
    })
  }
}
