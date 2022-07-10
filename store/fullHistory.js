import Helper from '@/lib/helper'

export const state = () => {
  return {
    fullHistory: [],
    loaded: false
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let history
      try {
        history = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (history) {
        state.fullHistory = history
        localStorage.setItem('zthFullHistory', JSON.stringify(state.fullHistory))
      }
      state.loaded = true
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let history = JSON.parse(localStorage.getItem('zthFullHistory') || '[]')
      state.fullHistory = history || state.fullHistory
      state.loaded = true
    }
  },
  ADD(state, path) {
    if (typeof localStorage !== 'undefined') {
      let history = state.fullHistory
      history.push({
        path,
        date: Date.now()
      })
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
  }
}
export const actions = {
  load({ commit }) {
    if (!state.loaded) commit('LOAD')
  },
  add({ state, commit, dispatch }, path) {
    if (!state.loaded) {
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

