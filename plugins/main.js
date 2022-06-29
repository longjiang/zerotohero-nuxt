import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueObserveVisibility from 'vue-observe-visibility'
import VueSimpleSVG from 'vue-simple-svg'
import VueGtag from 'vue-gtag'
import ModuleLoader from '~/lib/module-loader'
import WorkerModuleLoader from '~/lib/worker-module-loader'
import VueMq from 'vue-mq'
import VueSmoothScroll from 'vue2-smooth-scroll'
import SmartQuotes from "smartquotes";
import he from "he"; // html entities
import YouTube from '@/lib/youtube'
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import Languages from '@/lib/languages'
import DateHelper from "@/lib/date-helper";
import axios from 'axios'
import AsyncComputed from 'vue-async-computed'
import { i18n } from '~/plugins/i18n.js'
import { DIRECTUS_API_URL } from '@/lib/directus'
import { logError } from '@/lib/utils/error'

Vue.config.productionTip = false
Vue.use(VTooltip)
Vue.use(VueSimpleSVG)
Vue.use(VueObserveVisibility)
Vue.use(i18n, {
  fallbackLocale: 'en',
})
Vue.use(VueSmoothScroll)
Vue.use(VueMq, {
  breakpoints: { // default breakpoints - customize this
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
    xxl: Infinity
  },
  defaultBreakpoint: 'sm', // customize this for SSR
  error(listender, Init) {
    console.log('error')
  }
})
Vue.use(AsyncComputed)


// https://stackoverflow.com/questions/44371639/how-to-remove-html-tags-from-rendered-text
Vue.filter('striphtml', function (value) {
  var div = document.createElement('div')
  div.innerHTML = value
  var text = div.textContent || div.innerText || ''
  return text
})

// https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function (text, length, clamp) {
  clamp = clamp || '...'
  var node = document.createElement('div')
  node.innerHTML = text
  var content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
})

export default async ({ app, store, route }, inject) => {
  Vue.use(VueGtag, {
    config: { id: 'UA-1846573-21' }
  }, app.router)
  // Make legacy hash URLs work
  // https://qvault.io/javascript/vue-history-mode-support-legacy-hash-urls/
  app.router.beforeEach((to, from, next) => {
    // Redirect if fullPath begins with a hash (ignore hashes later in path)
    if (to.fullPath.substr(0, 2) === '/#') {
      const path = to.fullPath.substr(2);
      // next(path);
      window.location.href = path
      return;
    }
    next();
  })
  if (!app.$languages) {

    if (process.server) {
      let l1Code = route.params.l1
      let l2Code = route.params.l2
      if (l1Code && l2Code) {
        let languagesPromise = Languages.load([l1Code, l2Code])
        inject('languagesPromise', languagesPromise)
        inject('languages', await languagesPromise)
      }
    } else {
      let languagesPromise = Languages.load()
      inject('languagesPromise', languagesPromise)
      inject('languages', await languagesPromise)
    }
  }

  inject('hasFeature', (feature) => {
    return app.$languages
      .getFeatures({
        l1: store.state.settings.l1,
        l2: store.state.settings.l2,
      }, process.browser)
      .includes(feature);
  });
  inject('getDictionary', async () => {
    if (store.state.settings.l1 && store.state.settings.l1 && store.state.settings.dictionaryName) {
      if (process.client) {
        let dictionary = WorkerModuleLoader.load(store.state.settings.dictionaryName, { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] || store.state.settings.l2["glottologId"] })
        return dictionary
      }
      /* We disable this for now to save bandwidth on Vercel
      else if (process.server) {
        let dictionary = ModuleLoader.load('dictionaries/' + store.state.settings.dictionaryName + '-server', { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] || store.state.settings.l2["glottologId"] })
        return dictionary
      }
      */
    }
  })
  inject('directus', {
    tokenOptions() {
      let token = app.$auth.strategy.token.get()
      if (token) {
        let options = { headers: { Authorization: token } }
        return options
      } else return {}
    },
    host: process.server ? process.env.baseUrl : window.location.protocol + '//' + window.location.hostname + ':' + window.location.port,
    /**
     * We append a cors=... query string because directus server caching seems to 'remember' cors header, causing problems when multiple doamins try ti access
     * @param {String} url 
     * @returns Url with cors string attached
     */
    appendHostCors(url) {
      let joiner = url.includes('?') ? '&' : '?'
      return url + joiner + `cors=${this.host}`
    },
    async patch(path, payload) {
      let res = await axios.patch(this.appendHostCors(DIRECTUS_API_URL + path), payload, this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async post(path, payload) {
      let res = await axios.post(this.appendHostCors(DIRECTUS_API_URL + path), payload, this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async delete(path) {
      let res = await axios.delete(this.appendHostCors(DIRECTUS_API_URL + path), this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async get(path) {
      let res = await axios.get(this.appendHostCors(DIRECTUS_API_URL + path), this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    /**
     * Count the number of episodes in a show
     * @param {string} showType 'tv_show' or 'talk'
     * @param {number} showId 
     * @param {number} l2Id 
     * @returns 
     */
    async countShowEpisodes(showType, showId, l2Id, adminMode = false) {
      let tableSuffix = Config.youtubeVideosTableName(l2Id).replace(`items/youtube_videos`, '')
      let data = await Helper.proxy(
        `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2Id}&type=${showType}&id=${showId}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) return data
    },
    async getRandomEpisodeYouTubeId(langId, type) {
      let showFilter = type ? `&filter[${type}][nnull]=1` : "";
      let randBase64Char = Helper.randBase64(1);
      let url = `${Config.youtubeVideosTableName(
        langId
      )}?filter[l2][eq]=${langId}${showFilter}&filter[youtube_id][contains]=${randBase64Char}&fields=youtube_id`;
      try {
        let response = await this.get(url);
        if (response.data && response.data.data.length > 0) {
          response = response.data;
          let randomVideo =
            response.data[Math.floor(Math.random() * response.data.length)];
          return randomVideo.youtube_id;
        }
      } catch (err) {
        return false;
      }
    },
    async saveVideo(video, l2, limit = false, tries = 0) {
      let lines = video.subs_l2 || [];
      if (limit) lines = lines.slice(0, limit);
      for (let line of lines) {
        let hline = he.decode(line.line); // parse html entities
        let qline = l2.apostrophe ? hline : SmartQuotes.string(hline); // convert to smartquotes
        line.line = qline;
      }
      let csv = YouTube.unparseSubs(lines, l2.code);
      let data = {
        youtube_id: video.youtube_id,
        title: video.title || "Untitled",
        l2: l2.id,
        subs_l2: csv.replace(/&quot;/g, "”"),
        channel_id: video.channel ? video.channel.id : video.channel_id,
        date: DateHelper.unparseDate(video.date)
      };
      if (video.tv_show) data.tv_show = video.tv_show.id;
      if (video.talk) data.talk = video.talk.id;
      try {
        let response = await this.post(
          `${Config.youtubeVideosTableName(l2.id)}?fields=id,tv_show.*,talk.*`,
          data
        );
        response = response.data;
        if (response && response.data) {
          return response.data.id;
        }
      } catch (err) {
        if (tries > 1) return; // Only 2 tries
        if (!limit) limit = video.subs_l2.length;
        if (limit > 0) {
          return this.saveVideo(video, l2, Math.floor(limit / 2), tries + 1); // Try with half the lines each time
        }
      }
    }
  })
  inject('getGrammar', async () => {
    let grammar = ModuleLoader.load('grammar')
    return grammar
  })
  inject('getHanzi', async () => {
    let hanzi = ModuleLoader.load('hanzi')
    return hanzi
  })
  inject('getUnihan', async () => {
    let unihan = ModuleLoader.load('unihan')
    return unihan
  })
}