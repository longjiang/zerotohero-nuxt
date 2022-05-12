import Helper from '@/lib/helper'

export const state = () => {
  return {
    history: [],
    historyLoaded: false
  }
}
export const mutations = {
  LOAD_HISTORY(state) {
    if (typeof localStorage !== 'undefined') {
      let history = JSON.parse(localStorage.getItem('zthHistory') || '[]')
      history = Helper.uniqueByValue(history, 'id')
      state.history = history || state.history
      state.historyLoaded = true
    }
  },
  ADD_HISTORY_ITEM(state, historyItem) {
    if (typeof localStorage !== 'undefined') {
      if (!state.historyLoaded) {
        this.dispatch('load')
      }
      let history = state.history
      let prevVersionOfSameItemIndex = history.findIndex(i => i.id === historyItem.id)
      historyItem.date = Date.now()
      if (prevVersionOfSameItemIndex !== -1)
        history[prevVersionOfSameItemIndex] = historyItem
      else history.push(historyItem)
      localStorage.setItem('zthHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  },
  REMOVE_HISTORY_ITEM(state, historyItem) {
    if (typeof localStorage !== 'undefined' && state.history) {
      const keepers = state.history.filter(
        item => item.id !== historyItem.id
      )
      let history = [].concat(state.history)
      history = keepers
      localStorage.setItem('zthHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  },
  REMOVE_ALL_HISTORY(state) {
    if (typeof localStorage !== 'undefined' && state.history) {
      let history = [].concat(state.history)
      history = []
      localStorage.setItem('zthHistory', JSON.stringify(history))
      this._vm.$set(state, 'history', history)
    }
  }
}
export const actions = {
  load({ commit, dispatch }) {
    commit('LOAD_HISTORY')
  },
  add({ commit, dispatch }, historyItem) {
    commit('ADD_HISTORY_ITEM', Object.assign({}, historyItem))
  },
  remove({ commit, dispatch }, historyItem) {
    commit('REMOVE_HISTORY_ITEM', Object.assign({}, historyItem))
  },
  removeAll({ commit, dispatch }) {
    commit('REMOVE_ALL_HISTORY')
  }
}
export const getters = {
  has: state => historyItem => {
    if (state.history) {
      let hasHistoryItem = false
      hasHistoryItem = state.history.find(
        item => item.path && item.path === historyItem.path
      )
      return hasHistoryItem
    }
  },
  count: state => () => {
    if (state.history) {
      return state.history.length
    } else {
      return 0
    }
  }
}

