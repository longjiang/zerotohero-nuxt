import Config from '@/lib/config'

export const state = () => {
  return {
    stats: {},
    statsLoaded: {}
  }
}

export const mutations = {
  LOAD(state, { l2, stats }) {
    state.stats[l2.code] = stats;
    state.statsLoaded[l2.code] = true
  },
}

export const actions = {
  async load({ state, rootGetters, commit }, { l2, adminMode }) {
    if (state.statsLoaded[l2.code]) return
    try {
      let stats = {}
      let tableSuffix = Config.youtubeVideosTableName(l2.id).replace(`${Config.wiki}items/youtube_videos`, '')
      let res = await axios.get(
        `https://db2.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=new_videos&timestamp=${adminMode ? Date.now() : 0}`
      );
      if (res && res.data) stats.newVideos = res.data

      let music = rootGetters["shows/music"]({ l2 })
      if (music) {
        res = await axios.get(
          `https://db2.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${music.id}&timestamp=${adminMode ? Date.now() : 0}`
        );
        if (res && res.data) stats.music = res.data
      }


      let movies = rootGetters["shows/movies"]({ l2 })
      if (movies) {
        res = await axios.get(
          `https://db2.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${movies.id}&timestamp=${adminMode ? Date.now() : 0}`
        );
        if (res && res.data) stats.movies = res.data
      }


      let news = rootGetters["shows/news"]({ l2 })
      if (news) {
        res = await axios.get(
          `https://db2.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=talk&id=${news.id}&timestamp=${adminMode ? Date.now() : 0}`
        );
        if (res && res.data) stats.news = res.data
      }


      res = await axios.get(
        `https://db2.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&timestamp=${adminMode ? Date.now() : 0}`
      );
      if (res && res.data) stats.allVideos = res.data


      commit('LOAD', { l2, stats })
    } catch (err) {
      Helper.logError(err)
    }
  },
}