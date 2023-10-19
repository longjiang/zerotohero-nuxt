import { proxy, logError, DIRECTUS_URL } from '@/lib/utils'

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

const LP_DIRECTUS8_TOOLS_URL = `${DIRECTUS_URL}lp-directus8-tools/`

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