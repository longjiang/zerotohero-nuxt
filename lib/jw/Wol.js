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

export const TEXTUAL_SYMBOLS = [
  {
    "symbol": "<span class=\"altsize\">א</span>",
    "description": "Codex Sinaiticus, Gr., fourth cent. C.E., British Museum, H.S., G.S.",
    "name": "Codex Sinaiticus",
    "language": "Gr.",
    "time": "fourth cent. C.E.",
    "location": "British Museum",
    "hs": "H.S.",
    "gs": "G.S."
  },
  {
    "symbol": "A",
    "description": "Codex Alexandrinus, Gr., fifth cent. C.E., British Museum, H.S., G.S.",
    "name": "Codex Alexandrinus",
    "language": "Gr.",
    "time": "fifth cent. C.E.",
    "location": "British Museum",
    "hs": "H.S.",
    "gs": "G.S."
  },
  {
    "symbol": "<em>ad</em>",
    "description": "Aid to Bible Understanding, Watch Tower Bible and Tract Society, Brooklyn, 1971.",
    "name": "Aid to Bible Understanding"
  },
  {
    "symbol": "Al",
    "description": "Aleppo Codex, Heb., c. 930 C.E., Israel, H.S.",
    "name": "Aleppo Codex",
    "language": "Heb.",
    "time": "c. 930 C.E.",
    "location": "Israel",
    "hs": "H.S.",
    "image": "https://wol.jw.org/en/wol/mp/r1/lp-e/nwtsty/2017/88"
  },
  {
    "symbol": "Aq",
    "description": "Aquila’s Gr. translation of H.S., second cent. C.E., Cambridge, England.",
    "name": "Aquila’s Gr. translation of H.S.",
    "time": "second cent. C.E.",
    "location": "Cambridge, England"
  },
  {
    "symbol": "Arm",
    "description": "Armenian Version, fourth to thirteenth cent. C.E.; H.S., G.S.",
    "name": "Armenian Version",
    "time": "fourth to thirteenth cent. C.E.",
    "hs": "H.S.",
    "gs": "G.S.",
    "wikipedia": "Bible_translations_into_Armenian"
  },
  {
    "symbol": "B",
    "description": "Vatican ms 1209, Gr., fourth cent. C.E., Vatican City, Rome, H.S., G.S.",
    "name": "Codex Vaticanus (Vatican ms 1209)",
    "language": "Gr.",
    "time": "fourth cent. C.E.",
    "location": "Vatican City, Rome",
    "hs": "H.S.",
    "gs": "G.S.",
    "wikipedia": "Codex_Vaticanus",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Codex_Vaticanus_B%2C_2Thess._3%2C11-18%2C_Hebr._1%2C1-2%2C2.jpg"
  },
  {
    "symbol": "B 19<sup>A</sup>",
    "description": "See Leningrad.",
    "name": "See Leningrad."
  },
  {
    "symbol": "Bauer",
    "description": "<em>A Greek-English Lexicon of the New Testament and Other Early Christian Literature, </em>by W. Bauer, second English ed., by F. W. Gingrich and F. W. Danker, Chicago and London (1979).",
    "name": "A Greek-English Lexicon of the New Testament and Other Early Christian Literature"
  },
  {
    "symbol": "BDB",
    "description": "<em>Hebrew and English Lexicon of the Old Testament, </em>by Brown, Driver and Briggs, Oxford, 1978 reprint.",
    "name": "Hebrew and English Lexicon of the Old Testament"
  },
  {
    "symbol": "BHK",
    "description": "<em>Biblia Hebraica, </em>by Kittel, Kahle, Alt and Eissfeldt, Privilegierte Württembergische Bibelanstalt, Stuttgart, seventh to ninth ed., 1951-55, H.S.",
    "name": "Biblia Hebraica (Kittel)",
    "wikipedia": "Biblia_Hebraica_(Kittel)",
    "image": "https://upload.wikimedia.org/wikipedia/commons/1/12/BHK-Kittel.jpg"
  },
  {
    "symbol": "BHS",
    "description": "<em>Biblia Hebraica Stuttgartensia, </em>by Elliger and Rudolph, Deutsche Bibelstiftung, Stuttgart, 1977, H.S.",
    "name": "Biblia Hebraica Stuttgartensia",
    "wikipedia": "https://en.wikipedia.org/wiki/Biblia_Hebraica_Stuttgartensia",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/BHS-cover.jpg/240px-BHS-cover.jpg"
  },
  {
    "symbol": "C",
    "description": "Codex Ephraemi Rescriptus, Gr., fifth cent. C.E., Paris, H.S., G.S.",
    "name": "Codex Ephraemi Rescriptus",
    "language": "Gr.",
    "time": "fifth cent. C.E.",
    "location": "Paris",
    "hs": "H.S.",
    "gs": "G.S.",
    "image": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Codex_ephremi.jpg"
  },
  {
    "symbol": "Ca",
    "description": "Cairo Codex, Heb., 895 C.E., Cairo, Egypt, H.S.",
    "name": "Cairo Codex",
    "language": "Heb.",
    "time": "895 C.E.",
    "location": "Cairo, Egypt",
    "hs": "H.S.",
    "wikipedia": "Codex_Cairensis"
  },
  {
    "symbol": "D",
    "description": "Bezae Codices, Gr. and Lat., fifth and sixth cent. C.E., Cambridge, England, G.S.",
    "name": "Bezae Codices",
    "language": "Gr. and Lat.",
    "time": "fifth and sixth cent. C.E.",
    "location": "Cambridge, England",
    "gs": "G.S.",
    "wikipedia": "Codex_Bezae"
  },
  {
    "symbol": "Gins.",
    "description": "<em>Massoretico-Critical Text of the Hebrew Bible, </em>by C. D. Ginsburg, London, 1926.",
    "name": "Massoretico-Critical Text of the Hebrew Bible"
  },
  {
    "symbol": "Gins.<sup>Int</sup>",
    "description": "<em>Introduction to the Massoretico-Critical Edition of the Hebrew Bible, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1966 reprint.",
    "name": "Introduction to the Massoretico-Critical Edition of the Hebrew Bible"
  },
  {
    "symbol": "Gins.<sup>Mas</sup>",
    "description": "<em>The Massorah, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1975 reprint.",
    "name": "The Massorah"
  },
  {
    "symbol": "GK",
    "description": "<em>Gesenius’ Hebrew Grammar, </em>by E. Kautzsch and A. E. Cowley, Oxford, England (1910).",
    "name": "Gesenius’ Hebrew Grammar"
  },
  {
    "symbol": "Grn",
    "description": "<em>The Interlinear Hebrew/English Bible, </em>Vol. I-III, by J. Green, Wilmington, U.S., 1976.",
    "name": "The Interlinear Hebrew/English Bible",
    "language": "Vol. I-III"
  },
  {
    "symbol": "Int",
    "description": "<em>The Kingdom Interlinear Translation of the Greek Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1969, a word-for-word rendering from Greek into English.",
    "name": "The Kingdom Interlinear Translation of the Greek Scriptures"
  },
  {
    "symbol": "It",
    "description": "Old Latin Versions, Itala, second to fourth cent. C.E.; H.S., G.S.",
    "name": "Old Latin Versions",
    "time": "fourth to thirteenth century C.E.",
    "wikipedia": "Vetus_Latina"
  },
  {
    "symbol": "J<sup>1</sup>",
    "description": "Matthew, Heb., edited by J. du Tillet, with a Lat. translation by J. Mercier, Paris, 1555.",
    "name": "Matthew"
  },
  {
    "symbol": "J<sup>2</sup>",
    "description": "Matthew, Heb., incorporated as a separate chapter in <em>ʼEʹven boʹchan </em>[“Tried Stone”], by Shem-Tob ben Isaac Ibn Shaprut, 1385. Mss of 16th and 17th cent., Jewish Theological Seminary, New York.",
    "name": "Matthew",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>3</sup>",
    "description": "Matthew and Hebrews, Heb. and Lat., by Sebastian Münster, Basel, 1537 and 1557 respectively.",
    "name": "Matthew and Hebrews",
    "language": "Heb. and Lat."
  },
  {
    "symbol": "J<sup>4</sup>",
    "description": "Matthew, Heb., by J. Quinquarboreus, Paris, 1551.",
    "name": "Matthew",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>5</sup>",
    "description": "Liturgical Gospels, Heb., by F. Petri, Wittemberg, 1573.",
    "name": "Liturgical Gospels",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>6</sup>",
    "description": "Liturgical Gospels, German, Lat., Gr. and Heb., by Johann Clajus, Leipzig, 1576.",
    "name": "Liturgical Gospels",
    "language": "German, Lat., Gr. and Heb."
  },
  {
    "symbol": "J<sup>7</sup>",
    "description": "Christian Greek Scriptures in 12 languages, including Heb., by Elias Hutter, Nuremberg, 1599.",
    "name": "Christian Greek Scriptures in 12 languages, including Heb."
  },
  {
    "symbol": "J<sup>8</sup>",
    "description": "Christian Greek Scriptures, Heb., by William Robertson, London, 1661.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>9</sup>",
    "description": "Gospels, Heb. and Lat., by Giovanni Battista Jona, Rome, 1668.",
    "name": "Gospels",
    "language": "Heb. and Lat."
  },
  {
    "symbol": "J<sup>10</sup>",
    "description": "<em>The New Testament . . . in Hebrew and English, </em>by Richard Caddick, Vol. I-III, containing Matthew—1 Corinthians, London, 1798-1805.",
    "name": "The New Testament . . . in Hebrew and English"
  },
  {
    "symbol": "J<sup>11</sup>",
    "description": "Christian Greek Scriptures, Heb., by Thomas Fry and others, London, 1817.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>12</sup>",
    "description": "Christian Greek Scriptures, Heb., by William Greenfield, London, 1831.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>13</sup>",
    "description": "Christian Greek Scriptures, Heb., by A. McCaul, M. S. Alexander, J. C. Reichardt and S. Hoga, London, 1838.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>14</sup>",
    "description": "Christian Greek Scriptures, Heb., by J. C. Reichardt, London, 1846.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>15</sup>",
    "description": "Luke, Acts, Romans and Hebrews, Heb., by J. H. R. Biesenthal, Berlin, 1855, 1867, 1853 and 1858 respectively.",
    "name": "Luke, Acts, Romans and Hebrews",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>16</sup>",
    "description": "Christian Greek Scriptures, Heb., by J. C. Reichardt and J. H. R. Biesenthal, London, 1866.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>17</sup>",
    "description": "Christian Greek Scriptures, Heb., by Franz Delitzsch, London, 1981 ed.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>18</sup>",
    "description": "Christian Greek Scriptures, Heb., by Isaac Salkinson and C. D. Ginsburg, London.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>19</sup>",
    "description": "John, Heb., by Moshe I. Ben Maeir, Denver, Colorado, 1957.",
    "name": "John",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>20</sup>",
    "description": "<em>A Concordance to the Greek Testament, </em>by W. F. Moulton and A. S. Geden, fourth ed., Edinburgh, 1963.",
    "name": "A Concordance to the Greek Testament"
  },
  {
    "symbol": "J<sup>21</sup>",
    "description": "<em>The Emphatic Diaglott </em>(Greek-English interlinear), by Benjamin Wilson, New York, 1864, reprint by Watch Tower Bible and Tract Society, Brooklyn, 1942.",
    "name": "The Emphatic Diaglott (Greek-English interlinear)"
  },
  {
    "symbol": "J<sup>22</sup>",
    "description": "Christian Greek Scriptures, Heb., by United Bible Societies, Jerusalem, 1979.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>23</sup>",
    "description": "Christian Greek Scriptures, Heb., by J. Bauchet, Rome, 1975.",
    "name": "Christian Greek Scriptures",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>24</sup>",
    "description": "<em>A Literal Translation of the New Testament . . . From the Text of the Vatican Manuscript, </em>by Herman Heinfetter, London, 1863.",
    "name": "A Literal Translation of the New Testament . . . From the Text of the Vatican Manuscript"
  },
  {
    "symbol": "J<sup>25</sup>",
    "description": "<em>St. Paul’s Epistle to the Romans, </em>by W. G. Rutherford, London, 1900.",
    "name": "St. Paul’s Epistle to the Romans"
  },
  {
    "symbol": "J<sup>26</sup>",
    "description": "Psalms and <a href=\"/en/wol/bc/r1/lp-e/1001060001/8/0\" data-bid=\"9-1\" class=\"b\">Matthew 1:1-3:6</a>, Heb., by Anton Margaritha, Leipzig, 1533.",
    "name": "Psalms and Matthew 1:1-3:6",
    "language": "Heb."
  },
  {
    "symbol": "J<sup>27</sup>",
    "description": "<em>Die heilige Schrift des neuen Testaments, </em>by Dominik von Brentano, third ed., Vienna and Prague, 1796.",
    "name": "Die heilige Schrift des neuen Testaments"
  },
  {
    "symbol": "JTS",
    "description": "<em>Journal of Theological Studies, </em>Clarendon, Oxford.",
    "name": "Journal of Theological Studies"
  },
  {
    "symbol": "KB",
    "description": "<em>Lexicon in Veteris Testamenti Libros, </em>by L. Koehler and W. Baumgartner, Leiden, Netherlands, 1953.",
    "name": "Lexicon in Veteris Testamenti Libros"
  },
  {
    "symbol": "KB<sup>3</sup>",
    "description": "<em>Hebräisches und Aramäisches Lexikon zum Alten Testament, </em>by W. Baumgartner, third ed., Leiden, Netherlands, 1967 and later ed.",
    "name": "Hebräisches und Aramäisches Lexikon zum Alten Testament"
  },
  {
    "symbol": "Leningrad",
    "description": "Codex Leningrad B 19<sup>A</sup>, Heb., 1008 C.E., H.S., Saltykov-Shchedrin State Public Library, Leningrad, U.S.S.R.",
    "name": "Codex Leningrad B 19A",
    "language": "Heb."
  },
  {
    "symbol": "LS",
    "description": "<em>A Greek-English Lexicon, </em>by H. Liddell and R. Scott, Oxford, 1968.",
    "name": "A Greek-English Lexicon"
  },
  {
    "symbol": "LXX",
    "description": "<em>Septuagint, </em>Gr., third and second cent. B.C.E., H.S. (A. Rahlfs, Deutsche Bibelgesellschaft, Stuttgart, 1935).",
    "name": "Septuagint",
    "time": "third and second cent. B.C.E.",
    "hs": "H.S.",
    "language": "Gr.",
    "wol": "https://wol.jw.org/en/wol/d/r1/lp-e/2002686",
    "image": "https://upload.wikimedia.org/wikipedia/commons/9/96/Papyrus_967.jpg"
  },
  {
    "symbol": "LXX<sup>א</sup>",
    "description": "See <span class=\"altsize\">א</span>.",
    "name": "See א."
  },
  {
    "symbol": "LXX<sup>A</sup>",
    "description": "See A.",
    "name": "See A."
  },
  {
    "symbol": "LXX<sup>B</sup>",
    "description": "See B.",
    "name": "See B."
  },
  {
    "symbol": "LXX<sup>Bagster</sup>",
    "description": "<em>Septuagint </em>(with an English translation by Sir Lancelot Brenton, S. Bagster &amp; Sons, London, 1851).",
    "name": "Septuagint (with an English translation by Sir Lancelot Brenton"
  },
  {
    "symbol": "LXX<sup>L</sup>",
    "description": "<em>Septuagint </em>(P. de Lagarde, Göttingen, Germany, 1883).",
    "name": "Septuagint (P. de Lagarde"
  },
  {
    "symbol": "LXX<sup>Thomson</sup>",
    "description": "<em>Septuagint, </em>translated by C. Thomson, Pells ed., London, 1904.",
    "name": "Septuagint"
  },
  {
    "symbol": "M",
    "description": "Masoretic Hebrew text found in Codex Leningrad B 19<sup>A </sup>as presented in BHK and BHS.",
    "name": "Masoretic text (Codex Leningrad B 19A)",
    "time": "1008/1009 C.E.",
    "image": "https://upload.wikimedia.org/wikipedia/commons/5/5f/LeningradCodex_text.jpg",
    "wikipedia": "Leningrad_Codex"
  },
  {
    "symbol": "NW",
    "description": "<em>New World Translation of the Holy Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1984 revision.",
    "name": "New World Translation of the Holy Scriptures"
  },
  {
    "symbol": "P<sup>45</sup>",
    "description": "Papyrus Chester Beatty 1, Gr., third cent. C.E., Dublin, G.S.",
    "name": "Papyrus Chester Beatty 1",
    "language": "Gr.",
    "time": "third cent. C.E.",
    "location": "Dublin",
    "hs": "H.S."
  },
  {
    "symbol": "P<sup>46</sup>",
    "description": "Papyrus Chester Beatty 2, Gr., c. 200 C.E., Dublin, Ann Arbor, Michigan, U.S.A., G.S.",
    "name": "Papyrus Chester Beatty 2",
    "language": "Gr.",
    "time": "c. 200 C.E.",
    "location": "Dublin, Ann Arbor, Michigan, U.S.A.",
    "gs": "G.S.",
    "image": "https://wol.jw.org/en/wol/mp/r1/lp-e/wp16/2016/269"
  },
  {
    "symbol": "P<sup>47</sup>",
    "description": "Papyrus Chester Beatty 3, Gr., third cent. C.E., Dublin, G.S.",
    "name": "Papyrus Chester Beatty 3",
    "language": "Gr.",
    "time": "third cent. C.E.",
    "location": "Dublin",
    "gs": "G.S."
  },
  {
    "symbol": "P<sup>66</sup>",
    "description": "Papyrus Bodmer 2, Gr., c. 200 C.E., Geneva, G.S.",
    "name": "Papyrus Bodmer 2",
    "language": "Gr.",
    "time": "c. 200 C.E.",
    "location": "Geneva",
    "gs": "G.S."
  },
  {
    "symbol": "P<sup>74</sup>",
    "description": "Papyrus Bodmer 17, Gr., seventh cent. C.E., Geneva, G.S.",
    "name": "Papyrus Bodmer 17",
    "language": "Gr.",
    "time": "seventh cent. C.E.",
    "location": "Geneva",
    "gs": "G.S."
  },
  {
    "symbol": "P<sup>75</sup>",
    "description": "Papyrus Bodmer 14, 15, Gr., c. 200 C.E., Geneva, G.S.",
    "name": "Papyrus Bodmer 14, 15",
    "language": "Gr.",
    "time": "c. 200 C.E.",
    "location": "Geneva",
    "gs": "G.S."
  },
  {
    "symbol": "1QIs<sup>a</sup>",
    "description": "The Dead Sea Scroll of Isaiah, Jerusalem, found in 1947 in Qumran Cave No. 1.",
    "name": "The Dead Sea Scroll of Isaiah",
    "image": "https://wol.jw.org/en/wol/mp/r1/lp-e/nwtsty/2017/86"
  },
  {
    "symbol": "Sam",
    "description": "<em>Pentateuch </em>in Samaritan, fourth cent. B.C.E., Israel.",
    "name": "Pentateuch in Samaritan",
    "language": "Samaritan",
    "time": "fourth cent. B.C.E."
  },
  {
    "symbol": "<em>si</em>",
    "description": "<em>“All Scripture Is Inspired of God and Beneficial,” </em>Watch Tower Bible and Tract Society, Brooklyn, 1963.",
    "name": "“All Scripture Is Inspired of God and Beneficial,” Watch Tower Bible and Tract Society"
  },
  {
    "symbol": "Sn",
    "description": "<em>Hebrew Old Testament, </em>by N. H. Snaith, Israel, 1970.",
    "name": "Hebrew Old Testament"
  },
  {
    "symbol": "Sy",
    "description": "Syriac <em>Peshitta, </em>Christian Aram., fifth cent. C.E., S. Lee, London, 1826, reprint by United Bible Societies, 1979.",
    "name": "Syriac Peshitta",
    "language": "Christian Aram.",
    "time": "fifth cent. C.E.",
    "wikipedia": "Peshitta",
    "wol": "https://wol.jw.org/en/wol/d/r1/lp-e/2014645",
    "image": "https://wol.jw.org/en/wol/mp/r1/lp-e/w14/2014/1302"
  },
  {
    "symbol": "Sy<sup>p</sup>",
    "description": "Syriac <em>Peshitta, </em>Christian Aram., fifth cent. C.E., S. Lee, London, 1826, reprint by United Bible Societies, 1979.",
    "name": "Syriac Peshitta",
    "language": "Christian Aram.",
    "time": "fifth cent. C.E.",
    "wikipedia": "Peshitta",
    "wol": "https://wol.jw.org/en/wol/d/r1/lp-e/2014645",
    "image": "https://wol.jw.org/en/wol/mp/r1/lp-e/w14/2014/1302"
  },
  {
    "symbol": "Sy<sup>c</sup>",
    "description": "Curetonian Syriac, Old Syriac, fifth cent. C.E., Gospels, Cambridge, England.",
    "name": "Curetonian Syriac",
    "language": "Old Syriac",
    "time": "fifth cent. C.E.",
    "location": "Cambridge, England",
    "wikipedia": "Curetonian_Gospels"
  },
  {
    "symbol": "Sy<sup>h</sup>",
    "description": "Philoxenian-Harclean Syriac Version, sixth and seventh cent. C.E.; G.S.",
    "name": "Philoxenian-Harclean Syriac Version",
    "time": "sixth and seventh cent. C.E.",
    "gs": "G.S.",
    "wikipedia": "Philoxenian_version"
  },
  {
    "symbol": "Sy<sup>hi</sup>",
    "description": "Jerusalem (Hierosolymitanum) Version, Old Syriac, sixth cent. C.E.; G.S.",
    "name": "Jerusalem (Hierosolymitanum) Version",
    "language": "Old Syriac",
    "time": "sixth cent. C.E.",
    "gs": "G.S.",
    "wikipedia": "Peshitta"
  },
  {
    "symbol": "Sy<sup>s</sup>",
    "description": "Sinaitic Syriac codex, fourth and fifth cent. C.E., Gospels.",
    "name": "Sinaitic Syriac codex",
    "language": "Syriac",
    "time": "fourth and fifth cent. C.E.",
    "gs": "G.S.",
    "wikipedia": "Syriac_Sinaiticus"
  },
  {
    "symbol": "Sym",
    "description": "Greek translation of H.S., by Symmachus, c. 200 C.E.",
    "name": "Greek translation of H.S.",
    "time": "c. 200 C.E.",
    "hs": "H.S."
  },
  {
    "symbol": "T",
    "description": "Targums, Aram. paraphrases of parts of H.S.",
    "name": "Targums, Aram. paraphrases of parts of H.S.",
    "language": "Aram.",
    "hs": "H.S.",
    "time": "fifth century C.E",
    "wikipedia": "Targum",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Targum.jpg/275px-Targum.jpg"
  },
  {
    "symbol": "T<sup>J</sup>",
    "description": "Jerusalem Targum I (Pseudo-Jonathan) and Jerusalem Targum II (Fragmentary Targum).",
    "name": "Jerusalem Targum I (Pseudo-Jonathan) and Jerusalem Targum II (Fragmentary Targum)."
  },
  {
    "symbol": "T<sup>O</sup>",
    "description": "Targum of Onkelos (Babylonian Targum), Pentateuch.",
    "name": "Targum of Onkelos (Babylonian Targum)"
  },
  {
    "symbol": "T<sup>P</sup>",
    "description": "Palestinian Targum, Vatican City, Rome, Pentateuch.",
    "name": "Palestinian Targum",
    "location": "Vatican City, Rome"
  },
  {
    "symbol": "TDOT",
    "description": "<em>Theological Dictionary of the Old Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1974 and later ed.",
    "name": "Theological Dictionary of the Old Testament (English ed.)"
  },
  {
    "symbol": "TDNT",
    "description": "<em>Theological Dictionary of the New Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1964 and later ed.",
    "name": "Theological Dictionary of the New Testament (English ed.)"
  },
  {
    "symbol": "Th",
    "description": "Greek translation of H.S., by Theodotion, second cent. C.E.",
    "name": "Greek translation of H.S.",
    "time": "second cent. C.E."
  },
  {
    "symbol": "TR",
    "description": "<em>Textus Receptus </em>(Received Text) of G.S., by R. Stephanus, 1550.",
    "name": "Textus Receptus (Received Text) of G.S."
  },
  {
    "symbol": "Vg",
    "description": "Latin <em>Vulgate, </em>by Jerome, c. 400 C.E. (<em>Iuxta Vulgatam Versionem, </em>Württembergische Bibelanstalt, Stuttgart, 1975).",
    "name": "Latin Vulgate",
    "language": "by Jerome",
    "time": "c. 400 C.E.",
    "wikipedia": "Vulgate",
    "wol": "https://wol.jw.org/en/wol/d/r1/lp-e/2009251",
    "image": "https://www.newberry.org/sites/default/files/styles/lightbox-overlay/public/acquisitions/Case-MS-216-%28Vault%29%2C-Bible.-Latin.-Vulgate%2C-13th-cen%2C-%232.JPG?itok=5yZZsi9e"
  },
  {
    "symbol": "Vg<sup>c</sup>",
    "description": "Latin <em>Vulgate, </em>Clementine recension (S. Bagster &amp; Sons, London, 1977).",
    "name": "Latin Vulgate"
  },
  {
    "symbol": "Vg<sup>s</sup>",
    "description": "Latin <em>Vulgate, </em>Sixtine recension, 1590.",
    "name": "Latin Vulgate, Sixtine recension",
    "time": "1590."
  },
  {
    "symbol": "Vg<sup>ww</sup>",
    "description": "<em>Novum Testamentum Latine secundum editionem Sancti Hieronymi ad Codicum Manuscriptorum Fidem, </em>by J. Wordsworth and H. J. White, Oxford, 1911.",
    "name": "Novum Testamentum Latine secundum editionem Sancti Hieronymi ad Codicum Manuscriptorum Fidem"
  },
  {
    "symbol": "VT",
    "description": "<em>Vetus Testamentum, </em>E. J. Brill, Leiden, Netherlands.",
    "name": "Vetus Testamentum"
  },
  {
    "symbol": "W",
    "description": "Freer Gospels, fifth cent. C.E., Washington, D.C.",
    "name": "Freer Gospels",
    "time": "fifth cent. C.E.",
    "location": "Washington D.C.",
    "wikipedia": "Codex_Washingtonianus"
  },
  {
    "symbol": "WH",
    "description": "<em>The New Testament in the Original Greek, </em>by Westcott and Hort, 1948 ed. (reprinted in Int).",
    "name": "The New Testament in the Original Greek by Westcott and Hort",
    "time": "1948",
    "wikipedia": "Westcott-Hort"
  },
  {
    "symbol": "Zorell<sup>Gr</sup>",
    "description": "<em>Lexicon Graecum Novi Testamenti, </em>third ed., by F. Zorell, Paris, 1961.",
    "name": "Lexicon Graecum Novi Testamenti"
  },
  {
    "symbol": "Zorell<sup>Heb</sup>",
    "description": "<em>Lexicon Hebraicum et Aramaicum Veteris Testamenti, </em>by F. Zorell, Rome, 1968.",
    "name": "Lexicon Hebraicum et Aramaicum Veteris Testamenti"
  },
  {
    "symbol": "<sup>*</sup>",
    "description": "Reading of the original (first) hand of a Greek manuscript.",
    "name": "Reading of the original (first) hand of a Greek manuscript."
  },
  {
    "symbol": "<sup>c</sup>",
    "description": "Reading of any corrector of a Greek manuscript.",
    "name": "Reading of any corrector of a Greek manuscript."
  }
]