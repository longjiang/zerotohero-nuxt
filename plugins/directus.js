import DateHelper from "@/lib/date-helper";
import axios from 'axios'
import SmartQuotes from "smartquotes";
import he from "he"; // html entities
import Helper from '@/lib/helper'
import { logError } from '@/lib/utils/error'

export const DIRECTUS_URL = 'https://directusvps.zerotohero.ca/'

export const DIRECTUS_API_URL = DIRECTUS_URL + 'zerotohero/'

export const LP_DIRECTUS_TOOLS_URL = DIRECTUS_URL + 'lp-directus8-tools/'

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
    tokenOptions(options = {}) {
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
    async get(path, params = {}) {
      let res = await axios.get(this.appendHostCors(DIRECTUS_API_URL + path), this.tokenOptions({ params })).catch(err => logError(err))
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
      let data = await Helper.proxy(
        `${LP_DIRECTUS_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2Id}&type=${showType}&id=${showId}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) return data
    },
    async getRandomEpisodeYouTubeId(langId, type) {
      let showFilter = type ? `&filter[${type}][nnull]=1` : "";
      let randBase64Char = Helper.randBase64(1);
      let url = `${this.youtubeVideosTableName(
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
    async deleteVideo({ id, l2Id }) {
      let res = await this.delete(`${this.youtubeVideosTableName(l2Id)}/${id}`)
      if (res?.status === 204) {
        return true
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
        query += `filter[l2][eq]=${l2Id}`
      }
      query = query ? '?' + query : ''
      let res = await this.get(`${this.youtubeVideosTableName(l2Id)}${query}`)
      if (res?.data?.data) {
        let videos = res.data.data
        return videos
      } else return []
    },
    async searchCaptions({ l2Id,
      tv_show,
      talk,
      terms,
      limit,
      timestamp }) {
      let params = {}
      params.suffix = this.youtubeVideosTableSuffix(l2Id)
      if (this.youtubeVideosTableHasOnlyOneLanguage(l2Id)) {
        // No language filter is necessary since the table only has one language
      } else {
        params.l2 = l2Id
      }
      if (tv_show) params.tv_show = tv_show
      if (talk) params.talk = talk
      if (terms) params.terms = terms.join(',')
      if (timestamp) params.timestamp = timestamp
      if (limit) params.limit = limit
      let res = await axios.get(this.appendHostCors(LP_DIRECTUS_TOOLS_URL + 'videos'), { params }).catch(err => logError(err))
      if (res?.data) {
        let videos = res.data
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
      let csv = app.$subs.unparseSubs(lines, l2.code);
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
          return this.postVideo(video, l2, Math.floor(limit / 2), tries + 1); // Try with half the lines each time
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
        `items/tv_shows?filter[l2][eq]=${langId}&limit=500&timestamp=${adminMode ? Date.now() : 0
        }`
      );
      let shows = response.data?.data || [];
      let showTitles = shows.map(show => show.title);
      let regex = new RegExp(
        showTitles.map(t => Helper.escapeRegExp(t)).join("|")
      );
      for (let video of videos) {
        if (regex.test(video.title)) {
          video.show = shows.find(show => video.title.includes(show.title));
        }
      }
      return videos;
    },
    async sendPasswordResetEmail({ email }) {
      let host = process.server ? process.env.baseUrl : window.location.protocol + '//' + window.location.hostname + ':' + window.location.port
      let reset_url = `${host}/password-reset`
      let res = await this.post(
        `auth/password/request`,
        {
          email,
          reset_url,
        }
      );
      return res && res.status === 200
    },
    async resetPassword({ token, password }) {
      let res = await this.post(
        `auth/password/reset`,
        {
          token,
          password,
        }
      );
      return res && res.status === 200
    },
    // Initialize the user data record if there isn't one
    async createNewUserDataRecord(token, payload = {}) {
      let res = await this.post(`items/user_data`, payload)
        .catch((err) => {
          console.log(
            "Axios error in savedWords.js: err, url, payload",
            err,
            url,
            payload
          );
        });
      if (res && res.data && res.data.data) {
        let userDataId = res.data.data.id;
        return userDataId;
      }
    },
    async initAndGetUserData() {
      if (app.$auth && app.$auth.loggedIn) {
        let user = app.$auth.user;
        let token = app.$auth.strategy.token.get()
          ? app.$auth.strategy.token.get().replace("Bearer ", "")
          : undefined;
        if (user) {
          if (!token) {
            await app.$auth.setUser(null); // Remind the user that they no longer have credentials
            app.$toast.error(`Sorry, but you need to login again.`, {
              position: "top-center",
              duration: 5000,
            });
            app.$router.push({
              name: "login",
            });
          } else {
            document.cookie = "directus-zerotohero-session=" + token;
            token = token.replace("Bearer ", "");
            let userDataRes = await this.get(
              `items/user_data?filter[owner][eq]=${user.id
              }&timestamp=${Date.now()}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (userDataRes && userDataRes.data && userDataRes.data.data) {
              if (userDataRes.data.data[0]) {
                let { id, saved_words, saved_phrases, history, progress, settings } =
                  userDataRes.data.data[0];
                console.log({settings})
                app.$auth.$storage.setUniversal("dataId", id);
                app.store.dispatch("savedWords/importFromJSON", saved_words);
                app.store.dispatch(
                  "savedPhrases/importFromJSON",
                  saved_phrases
                );
                app.store.dispatch("history/importFromJSON", history);
                app.store.dispatch("progress/importFromJSON", progress);
                app.store.dispatch("settings/importFromJSON", settings);
              } else {
                // No user data found, let's create it
                let dataId = await this.createNewUserDataRecord(token);
                app.$auth.$storage.setUniversal("dataId", dataId);
              }
            }
          }
        }
      } else {
        return false;
      }
    },
  })
}