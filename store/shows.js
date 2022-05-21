import Config from '@/lib/config'
import axios from 'axios'

export const state = () => {
  return {
    tvShows: {},
    talks: {},
    showsLoaded: {}
  }
}

export const mutations = {
  LOAD_SHOWS(state, { l2, tvShows, talks }) {
    state.tvShows[l2.code] = tvShows;
    state.talks[l2.code] = talks;
    state.showsLoaded[l2.code] = true
  },
  ADD_SHOW(state, { l2, type, show }) {
    state[type][l2.code].push(show);
  },
  REMOVE_SHOW(state, { l2, type, show }) {
    state[type][l2.code] = state[type][l2.code].filter((s) => s !== show);
  },
}

export const actions = {
  async load(context, { l2, adminMode, limit = 500 }) {
    let tvShows = []
    let talks = []
    try {

      let response = await axios.get(
        `${Config.wiki}items/tv_shows?filter[l2][eq]=${l2.id
        }${adminMode ? '' : '&filter[hidden][empty]=true'}&limit=${limit}&timestamp=${adminMode ? Date.now() : 0}`
      );

      if (response.data.data) {
        tvShows = response.data.data.sort((x, y) => {
          let sort = 0
          if (x.title && y.title)
            sort = (x.title || '').localeCompare(y.title, l2.locales[0])
          return sort
        });
      }

      response = await axios.get(
        `${Config.wiki}items/talks?filter[l2][eq]=${l2.id
        }${adminMode ? '' : '&filter[hidden][empty]=true'}&limit=${limit}&timestamp=${adminMode ? Date.now() : 0}`
      );
      if (response.data.data) {
        talks = response.data.data.sort((x, y) => {
          let sort = 0
          if (x.title && y.title)
            sort = (x.title || "").localeCompare(y.title, l2.locales[0])
          return sort
        });
      }
    } catch (err) {
    }

    context.commit('LOAD_SHOWS', { l2, tvShows, talks })
  },
  async add(context, { l2, type, show }) {
    let response = await axios.post(
      `${Config.wiki}items/${type === 'tvShows' ? 'tv_shows' : 'talks'}`,
      show
    );
    if (response && response.data) {
      context.commit('ADD_SHOW', { l2, type, show: response.data.data })
      let show = Object.assign(response.data.data, { l2, type: type === 'tvShows' ? 'tv_show' : 'talk' })
      return show
    } else {
      return false
    }
  },
  async remove(context, { l2, type, show }) {
    let token = $nuxt.$auth.strategy.token.get()
    if (!token) return
    token = token.replace('Bearer ', '')
    let response = await axios.delete(
      `${Config.wiki}items/${type === 'tvShows' ? 'tv_shows' : 'talks'}/${show.id}${
        this.$auth.user ? "?access_token=" + token : ""
      }`
    );
    // response.data could be "" (empty string), which evaluates to undefined.
    if (response) {
      context.commit('REMOVE_SHOW', { l2, type, show })
    }
    return true
  },
}