import { proxy, logError } from '@/lib/utils'

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

const LP_DIRECTUS8_TOOLS_URL = 'https://directusvps.zerotohero.ca/lp-directus8-tools/'

export const actions = {
  async load({ state, rootGetters, commit }, { l2, adminMode }) {
    if (state.statsLoaded[l2.code]) return
    try {
      let stats = {}
      let tableSuffix = this.$directus.youtubeVideosTableName(l2.id).replace(`items/youtube_videos`, '')
      let data = await proxy(
        `${LP_DIRECTUS8_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=new_videos`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      data = Number(data) // NaN is falsy
      if (data) stats.newVideos = data

      let music = rootGetters["shows/music"]({ l2 })
      if (music) {
        data = await proxy(
          `${LP_DIRECTUS8_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${music.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        data = Number(data) // NaN is falsy
        if (data) stats.music = data
      }


      let movies = rootGetters["shows/movies"]({ l2 })
      if (movies) {
        data = await proxy(
          `${LP_DIRECTUS8_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${movies.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        data = Number(data) // NaN is falsy
        if (data) stats.movies = data
      }


      let news = rootGetters["shows/news"]({ l2 })
      if (news) {
        data = await proxy(
          `${LP_DIRECTUS8_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=talk&id=${news.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        data = Number(data) // NaN is falsy
        if (data) stats.news = data
      }


      data = await proxy(
        `${LP_DIRECTUS8_TOOLS_URL}count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      data = Number(data) // NaN is falsy
      if (data) stats.allVideos = data


      commit('LOAD', { l2, stats })
    } catch (err) {
      logError(err)
    }
  },
}