import Config from '@/lib/config'
import Helper from '@/lib/helper'

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
      let data = await Helper.proxy(
        `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=new_videos`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) stats.newVideos = data

      let music = rootGetters["shows/music"]({ l2 })
      if (music) {
        data = await Helper.proxy(
          `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${music.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        if (data) stats.music = data
      }


      let movies = rootGetters["shows/movies"]({ l2 })
      if (movies) {
        data = await Helper.proxy(
          `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=tv_show&id=${movies.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        if (data) stats.movies = data
      }


      let news = rootGetters["shows/news"]({ l2 })
      if (news) {
        data = await Helper.proxy(
          `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}&type=talk&id=${news.id}`,
          { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
        );
        if (data) stats.news = data
      }


      data = await Helper.proxy(
        `https://directusvps.zerotohero.ca/count.php?table_suffix=${tableSuffix}&lang_id=${l2.id}`,
        { cacheLife: adminMode ? 0 : 86400 } // cache the count for one day (86400 seconds)
      );
      if (data) stats.allVideos = data


      commit('LOAD', { l2, stats })
    } catch (err) {
      Helper.logError(err)
    }
  },
}