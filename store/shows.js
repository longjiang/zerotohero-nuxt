import { CATEGORIES } from "@/lib/youtube";
import { LANGS_WITH_CONTENT } from '@/lib/utils/servers'
import Helper from '@/lib/helper'
import Vue from 'vue'

export const state = () => {
  return {
    tvShows: {},
    talks: {},
    stats: {},
    showsLoaded: {},
    categories: {},
  }
}

export const categories = (l2, tvShows, talks) => {
  if (!l2 || !LANGS_WITH_CONTENT.includes(l2.code)) return {};
  tvShows = tvShows[l2.code] || []
  talks = talks[l2.code] || []
  let shows = [...tvShows, ...talks]
  shows = shows.filter(s => !['News', 'Music', 'Movies'].includes(s.title))
  let categories = {};
  let ids = shows.map((show) => show.category).filter((c) => c);
  for (let id in CATEGORIES) {
    if (ids.includes(Number(id))) categories[id] = CATEGORIES[id];
  }
  return categories;
}

export const mutations = {
  LOAD_SHOWS(state, { l2, tvShows, talks }) {
    state.tvShows[l2.code] = tvShows;
    state.talks[l2.code] = talks;
    state.showsLoaded[l2.code] = true

    state.categories = categories(l2, state.tvShows, state.talks)
  },
  ADD_SHOW(state, { l2, type, show }) {
    state[type][l2.code].push(show);
  },
  REMOVE_SHOW(state, { l2, type, show }) {
    state[type][l2.code] = state[type][l2.code].filter((s) => s !== show);
  },
  UPDATE_SHOW(state, { l2, type, id, payload }) {
    let show = state[type][l2.code].find((s) => s.id === id);
    if (show) {
      for (let key in payload) {
        show[key] = payload[key]
      }
    }
  },
  REMOVE_EPISODE_FROM_SHOW(state, { l2, collection = 'tvShows', showId, episode }) {
    let show = state[collection][l2.code].find(s => s.id === showId)
    if (show.episodes) show.episodes = show.episodes.filter(e => e.youtube_id !== episode.youtube_id)
  },
  MODIFY_VIDEO(state, { video, key, value }) {
    Vue.set(video, key, value)
  },
  ADD_EPISODES_TO_SHOW(state, { l2, collection = 'tvShows', showId, episodes, sort = '-date' }) {
    let show = state[collection][l2.code].find(s => s.id === showId)
    if (show.episodes && show.episodes.length > 0) episodes = episodes.concat(show.episodes)
    episodes = Helper.uniqueByValue(episodes, 'youtube_id')
    if (sort === "-date") {
      episodes = episodes.sort((a, b) => b.date ? b.date.localeCompare(a.date) : 0);
    } else if (sort === 'title') {
      episodes = episodes.sort((a, b) => a.title ? a.title.localeCompare(b.title) : 0);
    }
    show.episodes = episodes
  },
  SET_EPISODE_COUNT(state, { l2, collection, showId, episodeCount }) {
    let show = state[collection][l2.code].find(s => s.id === Number(showId))
    show.episodeCount = episodeCount
  }
}

export const getMinLexDivByLevel = (shows) => {
  let lexDivs = shows.map(s => s.lex_div).filter(l => l > 0)
  lexDivs = lexDivs.sort((a, b) => a - b)
  let minLexDivByLevel = {}
  minLexDivByLevel[7] = lexDivs[lexDivs.length - 1]
  minLexDivByLevel[6] = lexDivs[Math.ceil(lexDivs.length / 2)]
  minLexDivByLevel[5] = lexDivs[Math.ceil(lexDivs.length / 2 / 2)]
  minLexDivByLevel[4] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2)]
  minLexDivByLevel[3] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2)]
  minLexDivByLevel[2] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2 / 2)]
  minLexDivByLevel[1] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2 / 2 / 2)]
  return minLexDivByLevel
}

export const levelByLexDiv = (lexDiv, minLexDivByLevel) => {
  if (!lexDiv) return
  for (let i = 1; i <= 7; i++) {
    if (lexDiv < minLexDivByLevel[i]) return i
  }
}

export const actions = {
  async load(context, { l2, adminMode, limit = 1000 }) {
    let tvShows = []
    let talks = []
    try {

      let response = await this.$directus.get(
        `items/tv_shows?filter[l2][eq]=${l2.id
        }${adminMode ? '' : '&filter[hidden][empty]=true'}&limit=${limit}&timestamp=${adminMode ? Date.now() : 0}`
      );

      if (response.data.data) {
        tvShows = response.data.data
        tvShows.forEach(show => { show.tags = Helper.unique((show.tags || '').split(',')) })
        tvShows = tvShows.sort((x, y) => {
          let sort = 0
          if (x.title && y.title)
            sort = (x.title || '').localeCompare(y.title, l2.locales[0])
          return sort
        });
      }

      response = await this.$directus.get(
        `items/talks?filter[l2][eq]=${l2.id
        }${adminMode ? '' : '&filter[hidden][empty]=true'}&limit=${limit}&timestamp=${adminMode ? Date.now() : 0}`
      );
      if (response.data.data) {
        talks = response.data.data
        talks.forEach(show => { show.tags = Helper.unique((show.tags || '').split(',')) })
        talks = talks.sort((x, y) => {
          let sort = 0
          if (x.title && y.title)
            sort = (x.title || "").localeCompare(y.title, l2.locales[0])
          return sort
        });
      }
    } catch (err) {
    }
    let minLexDivByLevel = getMinLexDivByLevel([...tvShows, ...talks])
    for (let show of talks) {
      let level = levelByLexDiv(show.lex_div, minLexDivByLevel)
      show.level = level
    }
    for (let show of tvShows) {
      let level = levelByLexDiv(show.lex_div, minLexDivByLevel)
      show.level = level
    }
    context.commit('LOAD_SHOWS', { l2, tvShows, talks })
  },
  async add(context, { l2, type, show }) {
    let response = await this.$directus.post(
      `items/${type === 'tvShows' ? 'tv_shows' : 'talks'}`,
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
    let response = await this.$directus.delete(
      `items/${type === 'tvShows' ? 'tv_shows' : 'talks'}/${show.id}`
    );
    if (response?.status === 204) {
      context.commit('REMOVE_SHOW', { l2, type, show })
    }
    return true
  },
  async update(context, { l2, type, id, payload }) {
    let response = await this.$directus.patch(
      `items/${type === 'tvShows' ? 'tv_shows' : 'talks'}/${id}`,
      payload
    );
    if (response) {
      context.commit('UPDATE_SHOW', { l2, type, id, payload })
    }
    return true
  },
  async addEpisodesToShow({ commit }, { l2, collection = 'tvShows', showId, episodes, sort = '-date' }) {
    commit('ADD_EPISODES_TO_SHOW', { l2, collection, showId, episodes, sort })
  },
  async removeEpisodeFromShow({ commit }, { l2, collection = 'tvShows', showId, episode }) {
    commit('REMOVE_EPISODE_FROM_SHOW', { l2, collection, showId, episode })
  },
  async setEpisodeCount({ commit }, { l2, collection = 'tvShows', showId, episodeCount }) {
    commit('SET_EPISODE_COUNT', { l2, collection, showId, episodeCount })
  }
}



export const getters = {
  tvShow: state => ({ l2, id }) => {
    if (state.showsLoaded[l2.code]) {
      let show = state.tvShows[l2.code].find(s => s.id === Number(id))
      return show
    }
  },
  talk: state => ({ l2, id }) => {
    if (state.showsLoaded[l2.code])
      return state.talks[l2.code].find(s => s.id === Number(id))
  },
  movies: state => ({ l2 }) => {
    if (state.showsLoaded[l2.code])
      return state.tvShows[l2.code].find(s => s.title === 'Movies')
  },
  music: state => ({ l2 }) => {
    if (state.showsLoaded[l2.code])
      return state.tvShows[l2.code].find(s => s.title === 'Music')
  },
  news: state => ({ l2 }) => {
    if (state.showsLoaded[l2.code])
      return state.talks[l2.code].find(s => s.title === 'News')
  },
  audiobooks: state => ({ l2 }) => {
    if (state.showsLoaded[l2.code])
      return state.talks[l2.code].filter(s => s.audiobook)
  },
}

