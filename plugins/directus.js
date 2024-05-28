import DateHelper from "@/lib/date-helper";
import axios from "axios";
import he from "he"; // html entities
import {
  randBase64,
  proxy,
  escapeRegExp,
  logError,
  DIRECTUS_API_URL,
  PYTHON_SERVER,
  LP_DIRECTUS_TOOLS_URL,
  WEB_URL,
  reduceTags,
  parseQueryString,
} from "@/lib/utils";

export const YOUTUBE_VIDEOS_TABLES = {
  2: [
    1874, // Basque
    6858, // Vietnamese
  ],
  3: [
    3179, // Korean
  ],
  4: [
    7731, // Chinese
  ],
  5: [
    1824, // English
  ],
  6: [
    1540, // German
  ],
  7: [
    2780, // Japanese
  ],
  8: [
    1943, // French
  ],
  9: [
    5980, // Spanish
    1167, // Catalan
    5644, // Russian
  ],
  10: [
    6615, // Turkish - 32,150 videos
    5326, // Polish - 27,971 videos
    4677, // Dutch - 22,453 videos
  ],
  11: [
    2351, // Hebrew
    5332, // Portuguese
    1800, // Greek
    6736, // Ukrainian
    1222, // Czech
    346, // Arabic
    5892, // Slovak
    4247, // Malay
  ],
  12: [
    2645, // Italian
  ],
  13: [
    2601, // Indonesian - 19,154 videos
    6115, // Swedish - 15,236 videos
    4759, // Norwegian - 12,061 videos
    4448, // Min Nan - 8,717 videos
  ],
  14: [
    6325, // Thai - 15,576 videos
    4392, // Burmese
  ]
};

export default ({ app }, inject) => {
  inject("directus", {
    host: process.server
      ? process.env.baseUrl
      : window.location.protocol +
        "//" +
        window.location.hostname +
        ":" +
        window.location.port,

    tokenOptions(options = {}) {
      let token = app.$auth.strategy.token.get();
      if (token) {
        if (!options.headers) options.headers = {};
        options.headers.Authorization = token;
        return options;
      } else return options;
    },

    /**
     * We append a cors=... query string because directus server caching seems to 'remember' cors header, causing problems when multiple doamins try ti access
     * @param {String} url
     * @returns Url with cors string attached
     */
    appendHostCors(url) {
      let joiner = url.includes("?") ? "&" : "?";
      return url + joiner + `cors=${this.host}`;
    },

    async patch(path, payload) {
      let res = await axios
        .patch(
          this.appendHostCors(DIRECTUS_API_URL + path),
          payload,
          this.tokenOptions()
        )
        .catch((err) => logError(err));
      if (res) return res;
    },

    async post(path, payload, catchErrors = true) {
      let res = await axios
        .post(
          this.appendHostCors(DIRECTUS_API_URL + path),
          payload,
          this.tokenOptions()
        )
        .catch((err) => {
          if (catchErrors) logError(err);
          else 
            throw err;
        });
      if (res) return res;
    },

    async delete(path) {
      let res = await axios
        .delete(
          this.appendHostCors(DIRECTUS_API_URL + path),
          this.tokenOptions()
        )
        .catch((err) => logError(err));
      if (res) return res;
    },

    async get(path, params = {}) {
      let res = await axios
        .get(
          this.appendHostCors(DIRECTUS_API_URL + path),
          this.tokenOptions({ params })
        )
        .catch((err) => logError(err));
      if (res) return res;
    },

    async getData(path, params = {}) {
      let res = await this.get(path, params);
      if (res?.data?.data) {
        let data = res.data.data;
        return data;
      }
    },

    /**
     * Count the number of episodes in a show
     * @param {string} showType 'tv_show' or 'talk'
     * @param {number} showId
     * @param {number} l2Id
     * @returns
     */
    async countShowEpisodes(showType, showId, l2Id, adminMode = false) {
      let tableSuffix = this.youtubeVideosTableName(l2Id).replace(
        `items/youtube_videos`,
        ""
      );
      let data = await proxy(
        `${LP_DIRECTUS_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2Id}&type=${showType}&id=${showId}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) return data;
    },

    async getRandomEpisodeYouTubeId(langId, type) {
      let showFilter = type ? `&filter[${type}][nnull]=1` : "";
      let randBase64Char = randBase64(1);
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
      let res = await this.delete(`${this.youtubeVideosTableName(l2Id)}/${id}`);
      if (res?.status === 204) {
        return true;
      }
    },

    async patchVideo({ id, l2Id, payload, query }) {
      query = query ? `?${query}` : "";
      let queryURL = `${this.youtubeVideosTableName(l2Id)}/${id}${query}`;
      let res = await this.patch(queryURL, payload);
      if (res?.data?.data) {
        let data = res.data.data;
        return data;
      }
    },

    normalizeDifficulty(video) {
      if (!video.difficulty) {
        if (video.lex_div && video.word_freq) {
          let lex_div = video.lex_div;
          let word_freq = video.word_freq;
          let difficulty = lex_div / word_freq
          video.difficulty = difficulty;
        }
      }
      return video;
    },

    async getVideo({ id, l2Id }) {
      const suffix = this.youtubeVideosTableSuffix(l2Id);
      const url = LP_DIRECTUS_TOOLS_URL + `video/${suffix ? suffix : 0}/${id}`;
      let res = await axios.get(url).catch((err) => logError(err));
      if (res?.data) {
        let video = res.data;
        video = this.normalizeDifficulty(video);
        return video;
      }
    },

    async getVideos({ l2Id, query = "", params = {}, subs = false, tags = false } = {}) {
      // You can use either a query string or params object
      if (query) {
        params = parseQueryString(query);
      }
      let fields = 'id,l2,title,youtube_id,tv_show,talk,date,lex_div,word_freq,difficulty,views,category,locale,duration,made_for_kids,views,likes,comments,type';
      if (subs) fields += ',subs_l2,subs_l1';
      if (tags) fields += ',tags';
      params.fields = params.fields || fields;
      // No language filter is necessary since the table only has one language
      if (!this.youtubeVideosTableHasOnlyOneLanguage(l2Id)) {
        params['filter[l2][eq]'] = l2Id;
      }
      let res = await this.get(`${this.youtubeVideosTableName(l2Id)}`, params);
      if (res?.data?.data) {
        let videos = res.data.data;
        videos = videos.map((video) => this.normalizeDifficulty(video));
        return videos;
      } else return [];
    },

    async searchCaptions({ l2Obj, tv_show, category, terms, limit, sort, timestamp }) {
      if (!l2Obj) throw "Directus.searchCaptions: l2Obj is not set!";

      let url
      let params = {}
      // const server = 'php' // 'python' or 'php'
      const server = 'python' // 'python' or 'php'
      if (server === 'python') {
        const l2_code = l2Obj.code;
        params.l2 = l2_code;
        url = PYTHON_SERVER + "subs-search";
      }
      else if (server === 'php') {
        const l2Id = l2Obj.id;
        let suffix = this.youtubeVideosTableSuffix(l2Id);
        params.l2 = l2Id
        params.suffix = suffix ? '_' + suffix : ''
        url = LP_DIRECTUS_TOOLS_URL + "videos";
      }
      if (tv_show) params.tv_show = tv_show;
      if (category) params.category = category;
      if (terms) params.terms = terms.join(",");
      if (timestamp) params.timestamp = timestamp;
      if (limit) params.limit = limit;
      if (sort) params.sort = sort;
      let res = await axios
        .get(this.appendHostCors(url), { params })
        .catch((err) => logError(err));
      if (res?.data) {
        let videos = res.data;
        return videos;
      } else return [];
    },

    async postVideo(video, l2, limit = false, tries = 0) {
      let lines = video.subs_l2 || [];
      if (limit) lines = lines.slice(0, limit);
      for (let line of lines) {
        line.line = he.decode(line.line); // parse html entities
      }
      let csv = app.$subs.unparseSubs(lines, l2.code);
      let {
        youtube_id,
        title,
        channel,
        channel_id,
        date,
        tags,
        category,
        locale,
        duration,
        made_for_kids,
        views,
        likes,
        comments,
      } = video;
      tags = tags ? tags.split(",") : [];
      let data = {
        youtube_id,
        title: title || "Untitled",
        l2: l2.id,
        subs_l2: csv.replace(/&quot;/g, "”"),
        channel_id: channel ? channel.id : channel_id,
        date: DateHelper.unparseDate(date),
        tags: reduceTags(tags, 200), // The database field is limited to 200 characters
        category,
        locale,
        duration,
        made_for_kids: made_for_kids ? 1 : 0,
        views,
        likes,
        comments,
      };
      if (video.tv_show) data.tv_show = video.tv_show.id;
      if (video.talk) data.talk = video.talk.id;
      try {
        let response = await this.post(
          `${this.youtubeVideosTableName(l2.id)}?fields=id,tv_show,talk`,
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

    // Returns '' (empty string), '1', '2, '3', etc.
    youtubeVideosTableSuffix(langId) {
      langId = parseInt(langId);
      if (!langId)
        throw "Directus.youtubeVideosTableSuffix: langId is not set!";
      let suffix = "";
      for (let key in YOUTUBE_VIDEOS_TABLES) {
        if (YOUTUBE_VIDEOS_TABLES[key].includes(langId)) {
          suffix = key;
        }
      }
      return suffix;
    },

    youtubeVideosTableHasOnlyOneLanguage(langId) {
      if (!langId)
        throw "Directus.youtubeVideosTableHasOnlyOneLanguage: langId is not set!";
      for (let key in YOUTUBE_VIDEOS_TABLES) {
        if (YOUTUBE_VIDEOS_TABLES[key].includes(langId)) {
          return YOUTUBE_VIDEOS_TABLES[key].length === 1;
        }
      }
    },

    youtubeVideosTableName(langId) {
      let suffix = this.youtubeVideosTableSuffix(langId);
      if (suffix) suffix = "_" + suffix;
      return `items/youtube_videos${suffix}`;
    },

    async checkShows(videos, langId, adminMode = false) {
      let response = await this.get(
        `items/tv_shows?filter[l2][eq]=${langId}&limit=500&timestamp=${
          adminMode ? Date.now() : 0
        }`
      );
      let shows = response.data?.data || [];
      let showTitles = shows.map((show) => show.title);
      let regex = new RegExp(showTitles.map((t) => escapeRegExp(t)).join("|"));
      for (let video of videos) {
        if (regex.test(video.title)) {
          video.show = shows.find((show) => video.title.includes(show.title));
        }
      }
      return videos;
    },

    async sendPasswordResetEmail({ email }) {
      let host = WEB_URL;
      if (process.server) host = process.env.baseUrl;
      let reset_url = `${host}/password-reset`;
      let res = await this.post(`auth/password/request`, {
        email,
        reset_url,
      }, false); // Don't catch errors
      return res && res.status === 200;
    },

    async resetPassword({ token, password }) {
      let res = await this.post(`auth/password/reset`, {
        token,
        password,
      });
      return res && res.status === 200;
    },

    // Initialize the user data record if there isn't one
    async createNewUserDataRecord(token, payload = {}) {
      let res = await this.post(`items/user_data`, payload).catch((err) => {
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

    /**
     * Initialize and fetch the user data if they are logged in.
     * If no user data is found, create and store it.
     * If the user is not logged in or the token is invalid, log out and redirect.
     */
    async fetchOrCreateUserData() {
      // Check if the user is logged in, return false if not
      if (!this.isLoggedIn()) {
        return false;
      }

      // Get the user's authentication token
      const token = this.getToken();
      // If the token is not available, log out and redirect the user
      if (!token) {
        this.logoutAndRedirect();
        return;
      }

      // Fetch the user's data using the token
      const userData = await this.fetchUserData(token);
      // If no user data is found, create and store new user data
      if (!userData) {
        await this.createAndStoreUserData(token);
      } else {
        // If user data is found, store it in the application
        this.storeUserData(userData);
      }
    },

    isLoggedIn() {
      return app.$auth && app.$auth.loggedIn && app.$auth.user;
    },

    async getCurrentUser() {
      // Make sure to bust cache
      let res = await this.get(`users/me?timestamp=${Date.now()}`);
      let user = res?.data?.data;
      return user;
    },

    getToken() {
      const token = app.$auth.strategy.token.get();
      return token ? token.replace("Bearer ", "") : undefined;
    },

    logoutAndRedirect() {
      app.$auth.setUser(null);
      app.$toast.error($tb("Sorry, but you need to login again."), {
        position: "top-center",
        duration: 5000,
      });
      app.$router.push({ name: "login" });
    },

    async fetchUserData(token) {
      const user = app.$auth.user;
      const userDataRes = await this.get(
        `items/user_data?fields=id,owner,saved_words,saved_phrases,saved_hits,saved_collocations,settings,progress,bookshelf&filter[owner][eq]=${
          user.id
        }&limit=1&timestamp=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return (
        userDataRes &&
        userDataRes.data &&
        userDataRes.data.data &&
        userDataRes.data.data[0]
      );
    },

    async createAndStoreUserData(token) {
      const dataId = await this.createNewUserDataRecord(token);
      app.$auth.$storage.setUniversal("dataId", dataId);
    },

    storeUserData({
      id,
      saved_words,
      saved_phrases,
      history,
      progress,
      settings,
    }) {
      app.$auth.$storage.setUniversal("dataId", id);
      app.store.dispatch("savedWords/importFromJSON", saved_words);
      app.store.dispatch("savedPhrases/importFromJSON", saved_phrases);
      // app.store.dispatch("history/importFromJSON", history);
      app.store.dispatch("progress/importFromJSON", progress);
      app.store.dispatch("settings/importFromJSON", settings);
    },

    async checkSubscription() {
      let res = await this.get(
        `items/subscriptions?filter[owner][eq]=${
          app.$auth.user.id
        }&timestamp=${Date.now()}`
      );
      if (res && res.data && res.data.data) {
        if (res.data.data[0]) {
          let subscription = res.data.data[0];
          app.$auth.$storage.setUniversal("subscription", subscription);
          return subscription;
        } else {
          return false;
        }
      }
    },

    async subscriptionExpired() {
      let subscription = await this.checkSubscription();
      if (subscription) {
        if (subscription.type === "lifetime") return false;
        let now = new Date();
        let expires = new Date(subscription.expires_on);
        let expired = now > expires;
        return expired;
      }
      return true;
    },
  });
};
