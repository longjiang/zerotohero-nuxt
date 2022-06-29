import DateHelper from "@/lib/date-helper";
import axios from 'axios'
import SmartQuotes from "smartquotes";
import he from "he"; // html entities
import YouTube from '@/lib/youtube'
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import { logError } from '@/lib/utils/error'

export const DIRECTUS_API_URL = 'https://directusvps.zerotohero.ca/zerotohero/'

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
    async deleteVideo() {

    },
    async patchVideo() {

    },
    async getVideo() {

    },
    async getVideos({ l2Id, query } = {}) {
      let res = await this.get(`${Config.youtubeVideosTableName(l2Id)}?${query}`)
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
}