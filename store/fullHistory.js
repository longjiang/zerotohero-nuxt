import { logError } from '../lib/helper'

export const state = () => {
  return {
    fullHistory: [],
    fullHistoryLoaded: false,
    lastL1L2: null, // The last language pair the user used. e.g. {l1: 'en', l2: 'zh'}
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let history
      try {
        history = JSON.parse(json)
      } catch (err) {
        logError(err)
      }
      if (history) {
        state.fullHistory = history
        localStorage.setItem('zthFullHistory', JSON.stringify(state.fullHistory))
      }
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let history = JSON.parse(localStorage.getItem('zthFullHistory') || '[]')
      let lastL1L2 = JSON.parse(localStorage.getItem('zthLastL1L2'))
      state.fullHistory = history || state.fullHistory
      state.lastL1L2 = lastL1L2 || state.lastL1L2
      state.fullHistoryLoaded = true
    }
  },
  ADD(state, path) {
    if (typeof localStorage !== 'undefined') {
      let history = state.fullHistory
      let payload = {
        path,
        date: Date.now()
      }
      history.push(payload)
      // trim history to the last 1000 items
      if (history.length > 1000) {
        history = history.slice(history.length - 1000)
      }
      localStorage.setItem('zthFullHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  },
  REMOVE(state, historyItem) {
    if (typeof localStorage !== 'undefined' && state.fullHistory) {
      const keepers = state.fullHistory.filter(
        item => item.id !== historyItem.id
      )
      let history = [].concat(state.fullHistory)
      history = keepers
      localStorage.setItem('zthFullHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  },
  REMOVE_ALL(state) {
    if (typeof localStorage !== 'undefined' && state.fullHistory) {
      let history = [].concat(state.fullHistory)
      history = []
      localStorage.setItem('zthFullHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  },
  SET_LAST_L1_L2(state, { l1, l2 }) {
    state.lastL1L2 = { l1, l2 }
    localStorage.setItem('zthLastL1L2', JSON.stringify(state.lastL1L2))
  }
}
export const actions = {
  load({ commit }) {
    if (!state.fullHistoryLoaded) commit('LOAD')
  },
  add({ state, commit, dispatch }, path) {
    if (!state.fullHistoryLoaded) {
      dispatch('load')
    }
    commit('ADD', path)
  },
  remove({ commit, dispatch }, historyItem) {
    commit('REMOVE', Object.assign({}, historyItem))
  },
  removeAll({ commit, dispatch }) {
    commit('REMOVE_ALL')
  },
  async importFromJSON({ commit }, json) {
    commit('IMPORT_FROM_JSON', json)
  },
  setLastL1L2({ commit }, { l1, l2 }) {
    commit('SET_LAST_L1_L2', { l1, l2 })
  }
}
export const getters = {
  has: state => historyItem => {
    if (state.fullHistory) {
      let hasHistoryItem = false
      hasHistoryItem = state.fullHistory.find(
        item => item.path && item.path === historyItem.path
      )
      return hasHistoryItem
    }
  },
  count: state => () => {
    if (state.fullHistory) {
      return state.fullHistory.length
    } else {
      return 0
    }
  },
  fullHistoryPathsByL1L2: state => ({l1, l2}) => {
    return state.fullHistory
      .filter((h) => h.path.includes(`/${l1.code}/${l2.code}`))
      .map((h) => h.path);
  },
}

