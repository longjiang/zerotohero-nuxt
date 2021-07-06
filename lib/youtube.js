import Config from '@/lib/config'
import Helper from '@/lib/helper'
import axios from 'axios'
import parser from "fast-xml-parser";
import Papa from 'papaparse'
import moment from 'moment'
import tr from 'timeago-reverse'
import $ from 'jquery'
import { sify } from 'chinese-conv'
import { parse } from "node-html-parser";

export default {
  thumbnail(id) {
    return `//img.youtube.com/vi/${id}/hqdefault.jpg`
  },
  async checkShows(videos, langId, adminMode = false) {
    let response = await $.getJSON(
      `${Config.wiki}items/tv_shows?sort=title&filter[l2][eq]=${langId
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
    )
    let shows = response.data || []
    let showTitles = shows.map((show) => show.title)
    let regex = new RegExp(showTitles.join('|'))
    for (let video of videos) {
      if (regex.test(video.title)) {
        video.show = shows.find((show) =>
          video.title.includes(show.title)
        )
      }
    }
    return videos
  },
  async getTranscript(youtube_id, locale, name) {
    let nameQuery = name ? `&name=${encodeURIComponent(name)}` : ''
    let html = await Helper.proxy(
      `https://www.youtube.com/api/timedtext?v=${youtube_id}&lang=${locale}${nameQuery}&fmt=srv3`
    );
    let lines = [];
    let root = parse(html);
    for (let p of root.querySelectorAll("p")) {
      let line = {
        line: p.innerText,
        starttime: parseInt(p.getAttribute("t")) / 1000,
      };
      lines.push(line);
    }
    return lines.filter((line) => line.line.trim() !== "");
  },

  /* not ideal, will be replaced by getSubsList eventually */
  async getYouTubeSubsList(video, $l1, $l2) {
    let l2Locales = [$l2.code]
    if ($l2.locales) {
      l2Locales = l2Locales.concat($l2.locales)
    }
    let l1Locales = [$l1.code]
    if ($l1.locales) {
      l1Locales = l1Locales.concat($l1.locales)
    }
    let $html = await Helper.scrape(
      `https://www.youtube.com/api/timedtext?v=${video.youtube_id}&type=list`
    )
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
      `https://www.youtube.com/api/timedtext?v=${youtube_id}&type=list`
    );
    let root = parser.parse(xml, {
      ignoreAttributes: false,
    });
    if (
      typeof root.transcript_list !== "undefined" &&
      typeof root.transcript_list.track !== "undefined"
    ) {
      let tracks =
        root.transcript_list.track.length > 0
          ? root.transcript_list.track
          : [root.transcript_list.track];
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
        if (
          !$(this)
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
      let videos = []
      if ($html.find('.yt-lockup-content').length > 0) {
        for (let item of $html.find('.yt-lockup-content')) {
          if (
            !$(item)
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
    let $html = await Helper.scrape(url,
      options.forceRefresh ? 0 : -1)
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
            if (/.*ago$/.test(dateStr)) date = tr.parse(dateStr);
            else {
              let m = moment(dateStr)
              date = m._d
            }
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
        return {
          youtube_id: id,
          title: item.snippet.title,
          channel: {
            title: item.snippet.channelTitle,
            id: item.snippet.channelId
          }
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
    let pageTokenQS = pageToken ? `&page_token=${pageToken}` : ''
    let response = await $.getJSON(
      `${Config.youtubePlaylist}?playlist_id=${this.escapeZeroEx(id)}${pageTokenQS}&cache_life=${cacheLife}`
    )
    let playlistItems = []
    if (response.data) {
      if (response.data.items) {
        playlistItems = response.data.items.map(item => {
          return {
            youtube_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            channel_id: item.snippet.channelId
          }
        })
      }
      let nextPageToken = response.data.nextPageToken
      if (nextPageToken) {
        let moreItems = await this.playlistByApi(id, nextPageToken)
        return playlistItems.concat(moreItems)
      }
    }
    return playlistItems
  },
  playlist(playlistID, callback, cacheLife = -1) {
    Helper.scrape(
      `https://www.youtube.com/playlist?list=${playlistID}`,
      cacheLife
    ).then($html => {
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
  async getTranscriptByLocales(youtube_id, locales) {
    let tracks = await this.getSubsList(youtube_id)
    if (typeof tracks !== 'undefined') {
      for (let track of tracks) {
        if (locales.includes(track.locale)) {
          return await this.getTranscript(youtube_id, track.locale, track.name)
        }
      }
    }
  },
  channel(channelID, callback, cacheLife = -1) {
    // channelURL: https://www.youtube.com/user/TEDxTaipei https://www.youtube.com/channel/UCKFB_rVEFEF3l-onQGvGx1A
    Helper.scrape(
      `https://www.youtube.com/channel/${channelID}/videos`,
      cacheLife
    ).then($html => {
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
            thumbnail:
              $(item)
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
    let response = await axios.get(`${Config.wiki}items/youtube_videos?filter[l2][eq]=${langId}${showFilter}&fields=youtube_id&limit=2000`)
    if (response.data && response.data.data.length > 0) {
      response = response.data
      let randomVideo = response.data[Math.floor(Math.random() * response.data.length)]
      return randomVideo.youtube_id;
    }
  },
  async searchWithRegex(terms, lang, langId, approvedChannels, adminMode, excludeTerms, continua) {
    let channelFilter = ''

    if (approvedChannels === 'shows') channelFilter = `&filter[tv_show][nnull]=1`
    else if (approvedChannels && approvedChannels.length > 0) {
      channelFilter = `&channel_ids=${approvedChannels.join(',')}`
    }
    let hits = []
    let response = await $.getJSON(
      `${Config.wiki}custom/youtube_videos?subs_l2=${terms.join('|')}${channelFilter}&ban_title=Clip&l2=${langId
      }&limit=100&timestamp=${adminMode ? Date.now() : 0
      }`
    )

    if (response && response.data && response.data.length > 0) {
      let videos = response.data
      let newHits = this.getHits(videos, terms, excludeTerms, continua)
      hits = hits.concat(newHits)
    }
    return hits
  },
  async searchWithLike(terms, lang, langId, filter, adminMode, excludeTerms, continua, limit = 100, limitToTVShow = undefined) {
    let showFilter = ''
    if (filter) showFilter = `&filter[${filter}][nnull]=1`
    else showFilter = `&filter[tv_show][null]=1&filter[talk][null]=1`
    if (limitToTVShow) showFilter = `&filter[tv_show][eq]=${limitToTVShow}`
    let hits = []
    for (let term of terms) {
      let subsFilter = `filter[subs_l2][contains]=${encodeURIComponent(term)}`
      if (term.includes('_') || term.includes('*')) {
        subsFilter = `filter[subs_l2][rlike]=${'%' + encodeURIComponent(term.replace(/\*/g, '%')) + '%'}`
      }
      let response
      try {
        let url = `${Config.wiki}items/youtube_videos?filter[l2][eq]=${langId
          }${showFilter}&${subsFilter}&limit=${limit}&timestamp=${adminMode ? Date.now() : 0
          }`
        console.log(url)
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
        hits = hits.concat(this.getHits(videos, terms, excludeTerms, continua))
        if (hits.length > limit) break
      }
    }
    return hits
  },
  async searchSubs(terms, excludeTerms, lang = 'en', langId = 1824, adminMode = false, continua = true, limit = 100, limitToTVShow = undefined) {
    let hits = []
    if (limitToTVShow) {
      hits = hits.concat(await this.searchWithLike(terms, lang, langId, 'tv_show', adminMode, excludeTerms, continua, limit, limitToTVShow))
    } else {
      hits = hits.concat(await this.searchWithLike(terms, lang, langId, 'tv_show', adminMode, excludeTerms, continua, limit))
      if (hits.length < 20) {
        hits = hits.concat(await this.searchWithLike(terms, lang, langId, 'talk', adminMode, excludeTerms, continua, limit))
      }
      if (hits.length < 20 && !['zh', 'en', 'ja', 'ru'].includes(lang)) {
        hits = hits.concat(await this.searchWithLike(terms, lang, langId, false, adminMode, excludeTerms, continua, limit))
      }
    }
    return Helper.uniqueByValue(hits, 'id')
  },
  getHits(videos, terms, excludeTerms, continua = true, convertToSimplified = false) {
    let seenYouTubeIds = []
    let hits = []
    let boundary = continua ? '' : '[^A-Za-z]'
    for (let video of videos) {
      if (video && !seenYouTubeIds.includes(video.youtube_id)) {
        seenYouTubeIds.push(video.youtube_id)
        for (let index in video.subs_l2) {
          let regex = boundary + '(' + terms.join('|').replace(/[*]/g, '.+').replace(/[_]/g, '.') + ')'
          if (
            new RegExp(
              regex, 'i'
            ).test(
              video.subs_l2[index].line +
              (terms[0].replace('*', '').includes('*') &&
                video.subs_l2[Number(index) + 1]
                ? ' ' + video.subs_l2[Number(index) + 1].line
                : '')
            ) &&
            (excludeTerms.length === 0 ||
              !new RegExp(excludeTerms.join('|')).test(
                video.subs_l2[index].line
              ))
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
          `(${terms
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
          `(.|\n)*(${terms
            .join('|')
            .replace(/[*]/g, '.+')
            .replace(/[_]/g, '.')})`, 'gim'
        )
        let rightContext = hit.line.replace(regex, '').trim()
          + (next && next.line ? next.line.trim() : '')
        hit.rightContext = rightContext
      }
    }
    hits = hits.sort((a, b) =>
      a.rightContext.localeCompare(b.rightContext, 'zh-CN')
    )
    return hits
  },
  parseSavedSubs(jsonOrCSV) {
    let parsed = (jsonOrCSV.charAt(0) === '[') ? JSON.parse(jsonOrCSV) : Papa.parse(jsonOrCSV, { header: true }).data
    parsed = parsed.filter(
      (line) => line.starttime
    )
    for (let line of parsed) {
      line.starttime = Number(line.starttime)
    }
    return parsed
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
  }
}
