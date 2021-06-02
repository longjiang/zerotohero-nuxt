import Config from '@/lib/config'
import Helper from '@/lib/helper'

export const state = () => {
  return {
    shows: [],
    showsLoaded: false
  }
}

export const mutations = {
  async LOAD_TV_SHOWS(state, shows) {
    state.shows = shows;
    state.showsLoaded = true
  },
}

export const actions = {
  async load (context, {l2, adminMode}) {
    let response = await axios.get(
      `${Config.wiki}items/tv_shows?sort=title&filter[l2][eq]=${l2.id
      }&limit=500&timestamp=${adminMode ? Date.now() : 0}`
    );
    let shows =
      response.data.data.sort((x, y) =>
        x.title.localeCompare(y.title, l2.code)
      ) || [];
    shows = Helper.uniqueByValue(shows, "youtube_id");
    context.commit('LOAD_TV_SHOWS', shows)
  }
}
