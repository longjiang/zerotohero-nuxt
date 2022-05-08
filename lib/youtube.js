import Config from '@/lib/config'
import Helper from '@/lib/helper'
import DateHelper from '@/lib/date-helper'
import SmartQuotes from "smartquotes";
import axios from 'axios'
import parser from "fast-xml-parser";
import Papa from 'papaparse'
import he from "he"; // html entities
import $ from 'jquery'
import { sify } from 'chinese-conv'
import { parse } from "node-html-parser";

export default {
  thumbnail(id) {
    return `//img.youtube.com/vi/${id}/hqdefault.jpg`
  },
  async checkShows(videos, langId, adminMode = false) {
    let response = await $.getJSON(
      `${Config.wiki}items/tv_shows?filter[l2][eq]=${langId
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
    )
    let shows = response.data || []
    let showTitles = shows.map((show) => show.title)
    let regex = new RegExp(showTitles.map(t => Helper.escapeRegExp(t)).join('|'))
    for (let video of videos) {
      if (regex.test(video.title)) {
        video.show = shows.find((show) =>
          video.title.includes(show.title)
        )
      }
    }
    return videos
  },

  async getTranscript(youtube_id, locale, name, forceRefresh = false, generated) {
    let nameQuery = name ? `&name=${encodeURIComponent(name)}` : ''
    let generatedQuery = generated ? `&generated=true` : '' // Whether or not to use auto-generated captions
    let html = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&lang=${locale}${nameQuery}&fmt=srv3${generatedQuery}`,
      forceRefresh ? 0 : -1
    );
    let lines = [];
    let root = parse(html);
    console.log(root)
    for (let p of root.querySelectorAll("p")) {
      if (typeof p === 'undefined') continue;
      let line = {
        line: p.innerText,
        starttime: parseInt(p.getAttribute("t")) / 1000,
        duration: parseInt(p.getAttribute("d")) / 1000,
      };
      lines.push(line);
    }
    lines = lines.filter((line) => {
      return line.line.trim() !== "" && !Number.isNaN(line.starttime)
    });
    lines = lines.sort((a, b) => a.starttime - b.starttime)
    return lines
  },

  async getTranslatedTranscript(youtube_id, locale, name, tlang, forceRefresh = false) {
    let nameQuery = name ? `&name=${encodeURIComponent(name)}` : ''
    let html = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&lang=${locale}${nameQuery}&tlang=${tlang}&fmt=srv3`,
      forceRefresh ? 0 : -1
    );
    let lines = [];
    let root = parse(html);
    for (let p of root.querySelectorAll("p")) {
      if (typeof p === 'undefined') continue;
      let line = {
        line: p.innerText,
        starttime: parseInt(p.getAttribute("t")) / 1000,
      };
      lines.push(line);
    }
    lines = lines.filter((line) => {
      return line.line.trim() !== "" && !Number.isNaN(line.starttime)
    });
    lines = lines.sort((a, b) => a.starttime - b.starttime)
    return lines
  },

  /* Not ideal because it relies on jQuery, will be replaced by getSubsList eventually */
  async getYouTubeSubsList(video, $l1, $l2) {
    let l2Locales = Helper.unique([$l2.code, ...$l2.locales, ...$l2.hostCountryLocales])
    let l1Locales = Helper.unique([$l1.code, ...$l1.locales])
    let $html = await Helper.scrape(
      `https://python.zerotohero.ca/timedtext?v=${video.youtube_id}&type=list`
    )
    if (typeof $html === 'undefined') return video
    for (let track of $html.find('track')) {
      let locale = $(track).attr('lang_code')
      let name = $(track).attr('name')
      if (l2Locales.includes(locale)) {
        video.hasSubs = true
        video.checkingSubs = false
        video.l2Locale = locale
        if (name) video.l2Name = name
        break
      }
    }
    for (let track of $html.find('track')) {
      let locale = $(track).attr('lang_code')
      if (l1Locales.includes(locale)) {
        video.l1Locale = locale
        break
      }
    }
    return video
  },
  async getSubsList(youtube_id) {
    let xml = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&type=list`
    );
    let root = parser.parse(xml, {
      ignoreAttributes: false,
    });
    if (
      typeof root.transcript_list !== "undefined" &&
      typeof root.transcript_list.track !== "undefined"
    ) {
      let tracks =
        root.transcript_list.track.length > 0 ?
          root.transcript_list.track : [root.transcript_list.track];
      return tracks.map((t) => {
        return {
          id: t['@_id'],
          locale: t['@_lang_code'],
          name: t['@_name'],
        }
      })
    }
  },
  searchYouTubeByProxy(searchTerm, callback) {
    $.ajax(
      Config.lrcServer +
      'proxy.php?' +
      'https://www.youtube.com/results?search_query=' +
      searchTerm.replace(/ /g, '+')
    ).done(function (response) {
      var videoIds = []
      // We use 'ownerDocument' so we don't load the images and scripts!
      // https://stackoverflow.com/questions/15113910/jquery-parse-html-without-loading-images
      var ownerDocument = document.implementation.createHTMLDocument('virtual')
      let $html = $(response, ownerDocument)
      $html.find('.item-section li .yt-uix-tile-link').each(function () {
        if (!$(this)
          .attr('href')
          .includes('/channel/') &&
          !$(this)
            .attr('href')
            .includes('/user/')
        ) {
          videoIds.push(
            $(this)
              .attr('href')
              .replace('/watch?v=', '')
              .replace(/&list=.*/, '')
          )
        }
      })
      callback(videoIds)
    })
  },
  search(text, callback, options) {
    options = Object.assign({ l2: 'en', subs: false, cacheLife: -1 }, options)
    let subsQueryVar = options.subs ? '&sp=EgIoAQ%253D%253D' : ''
    Helper.scrape(
      `https://www.youtube.com/results?search_query=${text.replace(
        / /g,
        '+'
      )}+lang%3A${options.l2}${subsQueryVar}`,
      options.cacheLife
    ).then($html => {
      if (typeof $html === 'undefined') return []
      let videos = []
      if ($html.find('.yt-lockup-content').length > 0) {
        for (let item of $html.find('.yt-lockup-content')) {
          if (!$(item)
            .find('.yt-uix-sessionlink')
            .attr('href')
            .includes('/channel/') &&
            !$(item)
              .find('.yt-uix-sessionlink')
              .attr('href')
              .includes('/user/')
          ) {
            let badge = $(item).find('.yt-badge')[0]
            let id = $(item)
              .find('.yt-uix-sessionlink')
              .attr('href')
              .replace('/watch?v=', '')
            let youtube = {
              id: id,
              cc: false,
              title: $(item)
                .find('.yt-uix-sessionlink')
                .attr('title'),
              thumbnail: this.thumbnail(id),
              url: 'https://www.youtube.com/watch?v=' + id
            }
            if (badge && ['CC', 'Untertitel'].includes(badge.innerText)) {
              youtube.cc = true
            }
            videos.push(youtube)
          }
        }
      }
      callback(videos)
    })
  },
  async searchByGoogle(options) {
    options = Object.assign({
      lang: 'en',
      captions: true,
      start: 0,
      forceRefresh: false,
      long: false
    }, options)
    let long = options.long ? ',dur:l' : ''
    let term = options.term ? options.term.replace(/ /g, '+') : ''
    let cc = options.captions ? ',cc:1' : ''
    let url = `https://www.google.com/search?q=${term}&start=${options.start}&lr=lang_${options.lang}&safe=active&tbs=srcf:H4sIAAAAAAAAANOuzC8tKU1K1UvOz1VLS0xOTcrPz4ZwMnNyy1OT9Apy1ErKM0tKUovAwpl5QFZmIki4ID-nOLEkL7W8GMQDAIqXaqNKAAAA${cc}${long}&tbm=vid`
    url = url + '&gl=us' // Make sure the results are returned in English (sometimes the scraping server is in other countries and the date is represented in a foreign language)
    let $html = await Helper.scrape(url,
      options.forceRefresh ? 0 : -1)
    if (typeof $html === 'undefined') return []
    let videos = []
    let main = $html.toArray().find(element => element.id === 'main')
    for (let a of $(main).find('a[href^="/url?q=https://www.youtube.com/watch"]')) {

      let url = $(a).attr('href').replace(/\/url\?q=([^&]+).*/, '$1')
      let title = $(a).find('div:first-child').text().replace(' - YouTube', '')
      let id = url.replace('https://www.youtube.com/watch%3Fv%3D', '')

      if (url && title && title !== '') {
        let date
        let span = $(a).parent().parent().find('span').get(0)
        let dir = span.getAttribute('dir')
        if (dir && dir === 'rtl') span = $(a).parent().parent().find('span').get(1)
        if (span && span.innerText) {
          let dateStr = span.innerText.trim()
          if (dateStr) {
            date = DateHelper.parseDate(dateStr)
          }
        }
        videos.push({
          youtube_id: id,
          cc: options.captions ? true : undefined,
          title: title,
          date,
          thumbnail: `//img.youtube.com/vi/${id}/hqdefault.jpg`
        })
      }
    }
    return videos
  },
  async videoByApi(id, cacheLife = -1) {
    let response = await axios.get(
      `${Config.youtubeVideo}?id=${id}&cache_life=${cacheLife}`
    )
    response = response.data
    if (response.data.items && response.data.items.length > 0) {
      let video = response.data.items.map(item => {
        let date = DateHelper.parseDate(item.snippet.publishedAt)
        return {
          youtube_id: id,
          title: item.snippet.title,
          channel: {
            title: item.snippet.channelTitle,
            id: item.snippet.channelId
          },
          date,
          data: item
        }
      })[0]
      return video
    }
  },
  mapChannelPlaylistsData(item) {
    return {
      id: item.id,
      title: item.snippet ? item.snippet.title : false,
      thumbnail: item.snippet && item.snippet.thumbnails && item.snippet.thumbnails.standard ? item.snippet.thumbnails.standard.url : false,
      count: item.contentDetails ? item.contentDetails.itemCount : false,
      description: item.snippet.description,
      date: item.snippet.publishedAt,
      data: item
    }
  },
  async channelPlayListsByAPI(channelID, cacheLife = -1, nextPageToken = false) {
    let nextPageTokenVar = nextPageToken ? `&page_token=${nextPageToken}` : ''
    let response = await $.getJSON(
      `${Config.youtubeChannelPlaylists}?channel=${channelID}${nextPageTokenVar}&cache_life=${cacheLife}`
    )
    let playlists = []
    if (response.data && response.data.items) {
      playlists = response.data.items.map(this.mapChannelPlaylistsData)
    }
    nextPageToken = response.data.nextPageToken
    if (nextPageToken) {
      playlists = playlists.concat(await this.channelPlayListsByAPI(channelID, cacheLife, nextPageToken))
    }
    return playlists
  },
  escapeZeroEx(id) {
    return id.replace(/0x/g, 'ZEROEX')
  },
  async playlistByApi(id, pageToken = false, cacheLife = -1) {
    let res = await this.playlistPageByApi(id, pageToken, cacheLife)
    if (res) {
      let { playlistItems, nextPageToken, totalResults } = res
      if (nextPageToken) {
        let data = await this.playlistByApi(id, nextPageToken)
        if (data) {
          playlistItems = playlistItems.concat(data.playlistItems)
          return { playlistItems, totalResults }
        }
      }
      return { playlistItems, totalResults }
    }
  },
  async playlistPageByApi(id, pageToken = false, cacheLife = -1) {
    let pageTokenQS = pageToken ? `&page_token=${pageToken}` : ''
    let url = `${Config.youtubePlaylist}?playlist_id=${this.escapeZeroEx(id)}${pageTokenQS}&cache_life=${cacheLife}`
    let response = await $.getJSON(url)
    let playlistItems = []
    if (response.data) {
      if (response.data.items) {
        playlistItems = response.data.items.map(item => {
          return {
            youtube_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            channel_id: item.snippet.channelId,
            date: DateHelper.parseDate(item.contentDetails.videoPublishedAt),
            data: item,
          }
        })
      }
      let nextPageToken = response.data.nextPageToken
      let totalResults = response.data.pageInfo.totalResults
      return {
        playlistItems,
        nextPageToken,
        totalResults
      }
    }
  },
  playlist(playlistID, callback, cacheLife = -1) {
    Helper.scrape(
      `https://www.youtube.com/playlist?list=${playlistID}`,
      cacheLife
    ).then($html => {
      if (typeof $html === 'undefined') return
      let playlist = {
        id: playlistID,
        title: $html
          .find('.pl-header-title')
          .text()
          .trim(),
        videos: []
      }
      for (let item of $html.find('.pl-video.yt-uix-tile')) {
        let id = $(item).attr('data-video-id')
        let video = {
          title: $(item).attr('data-title'),
          id: id,
          thumbnail: this.thumbnail(id)
        }
        playlist.videos.push(video)
      }
      callback(playlist)
    })
  },
  channel(channelID, callback, cacheLife = -1) {
    // channelURL: https://www.youtube.com/user/TEDxTaipei https://www.youtube.com/channel/UCKFB_rVEFEF3l-onQGvGx1A
    Helper.scrape(
      `https://www.youtube.com/channel/${channelID}/videos`,
      cacheLife
    ).then($html => {
      if (typeof $html === 'undefined') return
      let channel = {
        id: channelID,
        title: $html.find('.branded-page-header-title-link').attr('title'),
        videos: [],
        avatar: $html.find('.channel-header-profile-image').eq(0).attr('src')
      }
      for (let item of $html.find('.yt-lockup-content')) {
        let badge = $(item).find('.yt-badge')[0]
        let id = $(item)
          .find('.yt-uix-sessionlink')
          .attr('href')
          .replace('/watch?v=', '')
        let youtube = {
          id: id,
          cc: false,
          title: $(item)
            .find('.yt-uix-sessionlink')
            .attr('title'),
          thumbnail: this.thumbnail(id),
          url: 'https://www.youtube.com/watch?v=' + id
        }
        if (badge && badge.innerText === 'CC') {
          youtube.cc = true
        }
        channel.videos.push(youtube)
      }
      callback(channel)
    })
  },
  channelPlaylists(channelID, callback, cacheLife = -1) {
    // channelURL: https://www.youtube.com/user/TEDxTaipei https://www.youtube.com/channel/UCKFB_rVEFEF3l-onQGvGx1A
    Helper.scrape(
      `https://www.youtube.com/channel/${channelID}/playlists`,
      cacheLife
    ).then($html => {
      if (typeof $html === 'undefined') return
      let playlists = []
      for (let item of $html.find('.yt-shelf-grid-item')) {
        if (
          item &&
          $(item)
            .find('.yt-uix-tile-link')
            .attr('href')
        ) {
          let playlist = {
            id: $(item)
              .find('.yt-uix-tile-link')
              .attr('href')
              .replace(/.*list=(.*)/, '$1'),
            title: $(item)
              .find('.yt-uix-tile-link')
              .text()
              .trim(),
            thumbnail: $(item)
              .find('[data-ytimg]')
              .attr('data-thumb') ||
              $(item)
                .find('[data-ytimg]')
                .attr('src'),
            count: $(item)
              .find('.formatted-video-count-label b')
              .text()
          }
          playlists.push(playlist)
        }
      }
      callback(playlists)
    })
  },
  async getRandomEpisodeYouTubeId(langId, type) {
    let showFilter = type ? `&filter[${type}][nnull]=1` : ''
    let randBase64Char = Helper.randBase64(1)
    let url = `${Config.youtubeVideosTableName(langId)}?filter[l2][eq]=${langId}${showFilter}&filter[youtube_id][contains]=${randBase64Char}&fields=youtube_id`
    try {
      let response = await axios.get(url)
      if (response.data && response.data.data.length > 0) {
        response = response.data
        let randomVideo = response.data[Math.floor(Math.random() * response.data.length)]
        return randomVideo.youtube_id;
      }
    } catch (err) {
      return false
    }
  },
  async searchWithRegex(terms, lang, langId, approvedChannels, adminMode, excludeTerms, continua) {
    let channelFilter = ''

    if (approvedChannels === 'shows') channelFilter = `&filter[tv_show][nnull]=1`
    else if (approvedChannels && approvedChannels.length > 0) {
      channelFilter = `&channel_ids=${approvedChannels.join(',')}`
    }
    let hits = []
    try {
      let response = await $.getJSON(
        `${Config.youtubeVideosTableName(langId)}?subs_l2=${terms.join('|')}${channelFilter}&ban_title=Clip&l2=${langId
        }&limit=100&timestamp=${adminMode ? Date.now() : 0
        }`
      )

      if (response && response.data && response.data.length > 0) {
        let videos = response.data
        let newHits = this.getHits(videos, terms, excludeTerms, continua)
        hits = hits.concat(newHits)
      }
    } catch (err) {
    }
    return hits
  },
  async searchWithLike({ terms, langId, filter, adminMode, excludeTerms, continua, limit = 20, tvShowFilter = "all", talkFilter = "all", exact = false, apostrophe = false, convertToSimplified = false } = {}) {
    let showFilter = ''
    if (filter === 'tv_show') {
      if (tvShowFilter === 'all') {
        showFilter = `&filter[tv_show][nnull]=1`
      } else {
        showFilter = `&filter[tv_show][in]=${tvShowFilter.join(',')}`
      }
    }
    if (filter === 'talk') {
      if (talkFilter === 'all') {
        showFilter = `&filter[talk][nnull]=1`
      } else {
        showFilter = `&filter[talk][in]=${talkFilter.join(',')}`
      }
    }
    if (filter === false) {
      showFilter = `&filter[tv_show][null]=1&filter[talk][null]=1`
    }

    let hits = []
    for (let term of terms) {
      term = term.replace(/'/g, '&#39;')
      let subsFilter = `filter[subs_l2][contains]=${encodeURIComponent(term)}`
      if (term.includes('_') || term.includes('*')) {
        subsFilter = `filter[subs_l2][rlike]=${encodeURIComponent('%' + term.replace(/\*/g, '%') + '%')}`
      }
      let response
      try {
        let limitQuery = limit ? `&limit=${limit}` : ''
        let url = `${Config.youtubeVideosTableName(langId)}?filter[l2][eq]=${langId
          }${showFilter}&${subsFilter}${limitQuery}&sort=-date&timestamp=${adminMode ? Date.now() : 0
          }`
        response = await $.getJSON(url)
      } catch (e) { }
      if (typeof response !== 'undefined' && response.data && response.data.length > 0) {
        let videos = response.data
        for (let video of videos) {
          if (video.subs_l2) video.subs_l2 = this.parseSavedSubs(video.subs_l2).filter(
            (line) => line.starttime
          )
          if (video.subs_l1) video.subs_l1 = this.parseSavedSubs(video.subs_l1)
          if (video.notes) video.notes = this.parseNotes(video.notes)
        }
        hits = hits.concat(this.getHits(videos, terms, excludeTerms, continua, convertToSimplified, exact, apostrophe))
        if (limit && hits.length > limit) break
      }
    }
    return hits
  },
  async searchSubs({ terms, excludeTerms, lang = 'en', langId = 1824, tvShowFilter = "all", talkFilter = "all", adminMode = false, continua = true, limit = 20, exact = false, apostrophe = false, convertToSimplified = false } = {}) {
    let hits = []
    if (tvShowFilter !== []) {
      hits = hits.concat(await this.searchWithLike({ terms, langId, filter: 'tv_show', tvShowFilter, talkFilter, adminMode, excludeTerms, continua, limit, exact, apostrophe, convertToSimplified }))
    }
    if ((!limit || hits.length < limit) && hits.length < 30 && talkFilter !== []) {
      hits = hits.concat(await this.searchWithLike({ terms, langId, filter: 'talk', tvShowFilter, talkFilter, adminMode, excludeTerms, continua, limit, exact, apostrophe, convertToSimplified }))
    }
    if ((!limit || hits.length < limit) && ![].includes(lang) && hits.length < 30 && (tvShowFilter === 'all' && talkFilter === 'all')) {
      hits = hits.concat(await this.searchWithLike({ terms, langId, filter: false, tvShowFilter, talkFilter, adminMode, excludeTerms, continua, limit, exact, apostrophe, convertToSimplified }))
    }
    hits = Helper.uniqueByValue(hits, 'id')
    if (limit) hits = hits.slice(0, limit)
    return hits.sort((a, b) => a.lineIndex - b.lineIndex)
  },
  getHits(videos, terms, excludeTerms, continua = true, convertToSimplified = false, exact = false, apostrophe = false) {
    let seenYouTubeIds = []
    let hits = []
    let punctuations, punctuationsRegex, boundary, termsStr, regexStr, regex
    if (exact) {
      punctuations = Helper.characterClass(apostrophe ? 'PunctuationNoApostropheNoHyphen' : 'Punctuation')
      if (continua) {
        punctuations = punctuations + " "
      }
      punctuationsRegex = new RegExp(`[${punctuations}]`, "g")
      regexStr = '^\s*(' + terms.map(t => Helper.escapeRegExp(t)).join('|') + ')\s*$'
      regex = new RegExp(regexStr, 'i')
    } else {
      boundary = continua ? '' : `(^|[^${Helper.characterClass('L')}]+)`
      termsStr = terms.map(t => Helper.escapeRegExp(t)).join('|').replace(/\\\*/g, '.+').replace(/[_]/g, '.')
      regexStr = `${boundary}(${termsStr})`
      regex = new RegExp(regexStr, 'i')
    }
    for (let video of videos) {
      if (video && !seenYouTubeIds.includes(video.youtube_id)) {
        seenYouTubeIds.push(video.youtube_id)
        for (let index in video.subs_l2) {
          let line = video.subs_l2[index].line
          line = he.decode(line).replace(/\n/g, ' ')
          let passed = false
          if (exact) {
            let segs = line
              .replace(punctuationsRegex, "\n")
              .split("\n")
              .map((line) => line.replace(/^\s*[-–]\s*/, "").trim())
              .filter((line) => line && line !== "")
            for (let seg of segs) {
              let test = regex.test(
                seg)
              if (test) passed = true
            }
          } else {
            let notExcluded = excludeTerms.length === 0 || !new RegExp(excludeTerms.map(t => Helper.escapeRegExp(t)).join('|'), 'i').test(line)
            passed = regex.test(line) && notExcluded
          }
          if (
            passed
          ) {
            hits.push({
              video: video,
              lineIndex: index,
              id: `${video.youtube_id}#${index}`,
            })
          }
        }
      }
    }
    let emptyLine = {
      starttime: 0,
      line: '',
    }
    for (let video of videos) {
      let matchedHits = hits.filter(hit => hit.video === video)
      let matchedLineIndexes = matchedHits.map(hit => Number(hit.lineIndex))
      let keptIndexes = video.subs_l2.map((l, i) => i).filter(i => {
        for (let index of matchedLineIndexes) {
          if (i > index - 10 && i < index + 10) return true
        }
      })
      for (let lineIndex in video.subs_l2) {
        if (!keptIndexes.includes(Number(lineIndex))) {
          video.subs_l2[lineIndex] = emptyLine
        }
      }
    }
    for (let hit of hits) {

      if (convertToSimplified) {
        if (hit.video.subs_l2[hit.lineIndex - 1]) hit.video.subs_l2[hit.lineIndex - 1].line = sify(hit.video.subs_l2[hit.lineIndex - 1].line)
        hit.video.subs_l2[hit.lineIndex].line = sify(hit.video.subs_l2[hit.lineIndex].line)
        if (hit.video.subs_l2[hit.lineIndex + 1]) hit.video.subs_l2[hit.lineIndex + 1].line = sify(hit.video.subs_l2[hit.lineIndex + 1].line)
      }

      hit.line = hit.video.subs_l2[hit.lineIndex].line.trim()
      if (!hit.leftContext) {
        let prev = hit.video.subs_l2[hit.lineIndex - 1]
        let regex = new RegExp(
          `(${terms.map(t => Helper.escapeRegExp(t))
            .join('|')
            .replace(/[*]/g, '.+')
            .replace(/[_]/g, '.')})(.|\n)*`, 'gim'
        )

        let leftContext =
          (prev ? prev.line.trim() : '') +
          hit.line.replace(regex, '')
        hit.leftContext = leftContext.split('').reverse().join('').trim()
      }
      if (!hit.rightContext) {
        let next = hit.video.subs_l2[Number(hit.lineIndex) + 1]
        let regex = new RegExp(
          `(.|\n)*(${terms.map(t => Helper.escapeRegExp(t))
            .join('|')
            .replace(/[*]/g, '.+')
            .replace(/[_]/g, '.')})`, 'gim'
        )
        let rightContext = hit.line.replace(regex, '').trim() +
          (next && next.line ? next.line.trim() : '')
        hit.rightContext = rightContext
      }
    }
    hits = hits.sort((a, b) =>
      a.rightContext.localeCompare(b.rightContext, 'zh-CN')
    )
    return hits
  },
  parseSavedSubs(jsonOrCSV) {
    if (jsonOrCSV) {
      let isJSON = jsonOrCSV.charAt(0) === '['
      let parsed = isJSON ? JSON.parse(jsonOrCSV) : Papa.parse(jsonOrCSV, { header: true }).data
      parsed = parsed.filter(
        (line) => line.starttime
      )
      for (let line of parsed) {
        line.starttime = Number(line.starttime)
        if (line.duration) line.duration = Number(line.duration)
        if (line.line) line.line = he.decode(line.line)
      }
      parsed = parsed.sort((a, b) => a.starttime - b.starttime)
      return parsed
    } else {
      return []
    }
  },
  parseNotes(csv) {
    let parsed = Papa.parse(csv, { header: true }).data
    for (let line of parsed) {
      line.id = Number(line.id)
    }
    return parsed
  },

  /*
  * https://gist.github.com/yakovsh/345a71d841871cc3d375
  /* @shimondoodkin suggested even a much shorter way to do this */
  stripHebrewVowels(rawString) {
    return rawString.replace(/[\u0591-\u05C7]/g, "")
  },
  unparseSubs(subs, l2 = 'en') {

    let lines = subs.filter(l => l).map((l) => {
      let line = l.line
      if (['he', 'hbo'].includes(l2)) line = this.stripHebrewVowels(line)
      if (l2 === 'got') line = he.encode(line)
      return { starttime: l.starttime, line };
    })
    let csv = Papa.unparse(
      lines)
    return csv
  },
  unparseNotes(notes) {
    notes = notes.filter(note => note)
    let csv = Papa.unparse(notes)
    return csv
  },
  async saveVideo(video, l2, limit = false, tries = 0) {
    let lines = video.subs_l2;
    if (limit) lines = lines.slice(0, limit);
    for (let line of lines) {
      let hline = he.decode(line.line) // parse html entities
      let qline = l2.apostrophe ? hline : SmartQuotes.string(hline) // convert to smartquotes
      line.line = qline
    }
    let csv = this.unparseSubs(lines, l2.code);
    let data = {
      youtube_id: video.youtube_id,
      title: video.title || "Untitled",
      l2: l2.id,
      subs_l2: csv.replace(/&quot;/g, '”'),
      channel_id: video.channel_id,
      date: DateHelper.unparseDate(video.date),
    };
    if (video.tv_show) data.tv_show = video.tv_show.id;
    if (video.talk) data.talk = video.talk.id;
    try {
      let response = await axios.post(
        `${Config.youtubeVideosTableName(l2.id)}?fields=id,tv_show.*,talk.*`,
        data
      );
      response = response.data;
      if (response && response.data) {
        return response.data.id
      }
    } catch (err) {
      if (tries > 1) return; // Only 2 tries
      if (!limit) limit = video.subs_l2.length;
      if (limit > 0) {
        return this.saveVideo(video, Math.floor(limit / 2), tries + 1); // Try with half the lines each time
      }
    }
  },
}