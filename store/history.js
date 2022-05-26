import Helper from '@/lib/helper'
import Config from '@/lib/config'

export const state = () => {
  return {
    history: [],
    historyLoaded: false
  }
}
export const mutations = {
  IMPORT_HISTORY_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let history
      try {
        history = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (history) {
        state.history = history
        localStorage.setItem('zthHistory', JSON.stringify(state.history))
      }
      state.historyLoaded = true
    }
  },
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
  load({ commit }) {
    if (!state.historyLoaded) commit('LOAD_HISTORY')
  },
  add({ commit, dispatch }, historyItem) {
    commit('ADD_HISTORY_ITEM', Object.assign({}, historyItem))
    dispatch('push')
  },
  remove({ commit, dispatch }, historyItem) {
    commit('REMOVE_HISTORY_ITEM', Object.assign({}, historyItem))
    dispatch('push')
  },
  removeAll({ commit, dispatch }) {
    commit('REMOVE_ALL_HISTORY')
    dispatch('push')
  },
  async importFromJSON({commit}, json) {
    commit('IMPORT_HISTORY_FROM_JSON', json)
  },
  async push({ rootState }) {
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      let payload = { history: localStorage.getItem('zthHistory') }
      let url = `${Config.wiki}items/user_data/${dataId}?fields=id`
      await this.$authios.patch(url, payload)
        .catch(async (err) => {
          console.log('Axios error in history.js: err, url, payload', err, url, payload)
        })
    }
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

