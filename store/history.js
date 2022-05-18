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
      state.history = JSON.parse(json)
      localStorage.setItem('zthhistory', JSON.stringify(state.history))
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
  load({ commit, dispatch }) {
    commit('LOAD_HISTORY')
    dispatch('pull')
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
  async push({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let payload = { history: JSON.stringify(state.history) }
      await axios.patch(`${Config.wiki}items/user_data/${user.id}?access_token=${user.token}`, payload)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, history: JSON.stringify(state.history) })
          }
        })
    }
  },
  async pull({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let res = await axios.get(`${Config.wiki}items/user_data/${user.id}?fields=history&access_token=${user.token}`)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, history: JSON.stringify(state.history) })
          }
        })
      if (res && res.data && res.data.data) {
        commit('IMPORT_HISTORY_FROM_JSON', res.data.data.history)
      }
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

