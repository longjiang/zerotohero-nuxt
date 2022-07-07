import DateHelper from "../lib/date-helper";
import axios from 'axios'
import SmartQuotes from "smartquotes";
import he from "he"; // html entities
import { randBase64 } from "../lib/utils/random";
import { logError } from '../lib/utils/error'
import { escapeRegExp } from '../lib/utils/regex'
import { proxy } from '../lib/utils/proxy'

export const DIRECTUS_API_URL = 'https://zerotohero.directus.app/'

export const DIRECTUS_ROLE_ADMIN = 'ea52e89f-13f1-424a-9552-b07b1036f3f4'

export const DIRECTUS_ROLE_GUEST = 'ca9183ab-ef9d-4fee-9377-92b7b2a9b303'

export const DIRECTUS_ROLE_PRO = 'ddc7e067-bb98-4bfa-87b3-18a756ee2186'

export const DIRECTUS_TOKEN_MAX_AGE = 15 * 60 * 1000 // milliseconds

export const YOUTUBE_VIDEOS_TABLES = {
  2: [
    1874, // Basque
    6858, // Vietnamese
  ],
  3: [
    3179 // Korean
  ],
  4: [
    7731 // Chinese
  ],
  5: [
    1824 // English
  ],
  6: [
    1540 // German
  ],
  7: [
    2645, // Italian
    2780 // Japanese
  ],
  8: [
    1943, // French
  ],
  9: [
    5980, // Spanish
    1167, // Catalan
    5644, // Russian
  ]
}

export default ({ app }, inject) => {
  inject('directus', {
    DIRECTUS_API_URL,
    DIRECTUS_ROLE_ADMIN,
    DIRECTUS_ROLE_GUEST,
    DIRECTUS_ROLE_PRO,
    YOUTUBE_VIDEOS_TABLES,
    DIRECTUS_TOKEN_MAX_AGE,
    lastTokenRefreshTime: 0, // Date.now() timestamp (in milliseconds) of the last login
    isPro() {
      let user = app.$auth?.user
      let role = user?.role
      return [DIRECTUS_ROLE_ADMIN, DIRECTUS_ROLE_PRO].includes(role) ? true : false;
    },
    async login({ email, password }) {
      try {
        this.lastTokenRefreshTime = Date.now()
        let res = await app.$auth.loginWith("local", { data: { email, password } });
        if (res.data?.data) {
          let userRes = await this.get('users/me')
          if (userRes.data?.data?.id) {
            let user = userRes.data.data;
            app.$auth.setUser(user);
            app.$toast.success(`Welcome back, ${app.$auth.user.first_name}!`, {
              position: "top-center",
              duration: 5000,
            });
            return true
          }
        }
      } catch (err) {
        if (err.response?.data?.error?.message) {
          this.$toast.error(err.response.data.error.message, {
            position: "top-center",
            duration: 5000,
          });
        } else {
          this.$toast.error("There has been an error.", {
            position: "top-center",
            duration: 5000,
          });
        }
        return false
      }
    },
    async tokenOptions(options = {}) {
      if (Date.now() > this.lastTokenRefreshTime + DIRECTUS_TOKEN_MAX_AGE) {
        try {
          const res = await app.$auth.refreshTokens()
          this.lastTokenRefreshTime = Date.now()
        } catch(err) {
          logError(err)
        }
      }
      let token = app.$auth.strategy.token.get()
      if (token) {
        if (!options.headers) options.headers = {}
        options.headers.Authorization = token
        return options
      } else return options
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
      let res = await axios.patch(this.appendHostCors(DIRECTUS_API_URL + path), payload, await this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async post(path, payload) {
      let res = await axios.post(this.appendHostCors(DIRECTUS_API_URL + path), payload, await this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async delete(path) {
      let res = await axios.delete(this.appendHostCors(DIRECTUS_API_URL + path), await this.tokenOptions()).catch(err => logError(err))
      if (res) return res
    },
    async get(path, params = {}) {
      let res = await axios.get(this.appendHostCors(DIRECTUS_API_URL + path), await this.tokenOptions({ params })).catch(err => logError(err))
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
      let tableSuffix = this.youtubeVideosTableName(l2Id).replace(`items/youtube_videos`, '')
      let data = await proxy(
        `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2Id}&type=${showType}&id=${showId}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) return data
    },
    async getRandomEpisodeYouTubeId(langId, type) {
      let showFilter = type ? `&filter[${type}][nnull]=1` : "";
      let randBase64Char = randBase64(1);
      let url = `${this.youtubeVideosTableName(
        langId
      )}?filter[l2][_eq]=${langId}${showFilter}&filter[youtube_id][_contains]=${randBase64Char}&fields=youtube_id`;
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
    async deleteVideo({ id, l2Id }) {
      let res = await this.delete(`${this.youtubeVideosTableName(l2Id)}/${id}`)
      if (res?.data?.data) {
        let data = res.data.data
        return data
      }

    },
    async patchVideo({ id, l2Id, payload, query }) {
      query = query ? `?${query}` : ''
      let res = await this.patch(`${this.youtubeVideosTableName(l2Id)}/${id}${query}`, payload)
      if (res?.data?.data) {
        let data = res.data.data
        return data
      }
    },
    async getVideo({ id, l2Id }) {
      let res = await this.get(`${this.youtubeVideosTableName(l2Id)}/${id}`)
      if (res?.data?.data) {
        let video = res.data.data
        return video
      }
    },
    async getVideos({ l2Id, query = '' } = {}) {
      if (this.youtubeVideosTableHasOnlyOneLanguage(l2Id)) {
        // No language filter is necessary since the table only has one language
      } else {
        if (query !== '') query += `&`
        query += `filter[l2][_eq]=${l2Id}`
      }
      query = query ? '?' + query : ''
      let res = await this.get(`${this.youtubeVideosTableName(l2Id)}${query}`)
      if (res?.data?.data) {
        let videos = res.data.data
        return videos
      } else return []
    },
    async postVideo(video, l2, limit = false, tries = 0) {
      let lines = video.subs_l2 || [];
      if (limit) lines = lines.slice(0, limit);
      for (let line of lines) {
        let hline = he.decode(line.line); // parse html entities
        let qline = l2.apostrophe ? hline : SmartQuotes.string(hline); // convert to smartquotes
        line.line = qline;
      }
      let csv = this.$subs.unparseSubs(lines, l2.code);
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
          `${this.youtubeVideosTableName(l2.id)}?fields=id,tv_show.*,talk.*`,
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
    },
    youtubeVideosTableSuffix(langId) {
      if (!langId) throw 'Directus.youtubeVideosTableSuffix: langId is not set!'
      let suffix = ''
      for (let key in YOUTUBE_VIDEOS_TABLES) {
        if (YOUTUBE_VIDEOS_TABLES[key].includes(langId)) {
          suffix = `_${key}`
        }
      }
      return suffix
    },
    youtubeVideosTableHasOnlyOneLanguage(langId) {
      if (!langId) throw 'Directus.youtubeVideosTableHasOnlyOneLanguage: langId is not set!'
      for (let key in YOUTUBE_VIDEOS_TABLES) {
        if (YOUTUBE_VIDEOS_TABLES[key].includes(langId)) {
          return YOUTUBE_VIDEOS_TABLES[key].length === 1
        }
      }
    },
    youtubeVideosTableName(langId) {
      return `items/youtube_videos${this.youtubeVideosTableSuffix(langId)}`
    },
    async checkShows(videos, langId, adminMode = false) {
      let response = await this.get(
        `items/tv_shows?filter[l2][_eq]=${langId}&limit=500&timestamp=${adminMode ? Date.now() : 0
        }`
      );
      let shows = response.data || [];
      let showTitles = shows.map(show => show.title);
      let regex = new RegExp(
        showTitles.map(t => escapeRegExp(t)).join("|")
      );
      for (let video of videos) {
        if (regex.test(video.title)) {
          video.show = shows.find(show => video.title.includes(show.title));
        }
      }
      return videos;
    },
  })
}