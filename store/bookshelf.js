import Helper from '@/lib/helper'
import Config from '@/lib/config'

export const state = () => {
  return {
    items: [],
    loaded: false
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let item
      try {
        item = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (item) {
        state.items = item
        localStorage.setItem('zthBookshelf', JSON.stringify(state.items))
      }
      state.loaded = true
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let items = JSON.parse(localStorage.getItem('zthBookshelf') || '[]')
      items = Helper.uniqueByValue(items, 'id')
      state.items = items || state.items
      state.loaded = true
    }
  },
  ADD(state, itemData) {
    if (typeof localStorage !== 'undefined') {
      let prevVersionOfSameItemIndex = state.items.findIndex(i => i.id === itemData.id)
      if (prevVersionOfSameItemIndex !== -1)
        state.items[prevVersionOfSameItemIndex] = itemData
      else state.items.push(itemData)
      localStorage.setItem('zthBookshelf', JSON.stringify(state.items))
      this._vm.$set(state, 'items', state.items)
    }
  },
  UPDATE(state, itemData) {
    if (typeof localStorage !== 'undefined') {
      let prevVersionOfSameItemIndex = state.items.findIndex(i => i.id === itemData.id)
      console.log({prevVersionOfSameItemIndex},itemData, itemData.id, state.items[0].id)
      if (prevVersionOfSameItemIndex !== -1)
        state.items[prevVersionOfSameItemIndex] = itemData
      localStorage.setItem('zthBookshelf', JSON.stringify(state.items))
      this._vm.$set(state, 'items', state.items)
    }
  },
  REMOVE(state, itemData) {
    if (typeof localStorage !== 'undefined' && state.items) {
      const keepers = state.items.filter(
        item => item.id !== itemData.id
      )
      localStorage.setItem('zthBookshelf', JSON.stringify(keepers))
      this._vm.$set(state, 'items', keepers)
    }
  },
  REMOVE_ALL(state) {
    if (typeof localStorage !== 'undefined' && state.items) {
      let item = [].concat(state.items)
      item = []
      localStorage.setItem('zthBookshelf', JSON.stringify(item))
      this._vm.$set(state, 'items', item)
    }
  }
}
export const actions = {
  load({ commit }) {
    if (!state.loaded) commit('LOAD')
  },
  add({ commit, dispatch }, itemData) {
    if (!state.loaded) {
      dispatch('load')
    }
    commit('ADD', Object.assign({}, itemData))
    dispatch('push')
  },
  update({ commit, dispatch }, itemData) {
    if (!state.loaded) {
      dispatch('load')
    }
    commit('UPDATE', Object.assign({}, itemData))
    dispatch('push')
  },
  remove({ commit, dispatch }, itemData) {
    commit('REMOVE', Object.assign({}, itemData))
    dispatch('push')
  },
  removeAll({ commit, dispatch }) {
    commit('REMOVE_ALL')
    dispatch('push')
  },
  async importFromJSON({ commit }, json) {
    commit('IMPORT_FROM_JSON', json)
  },
  async push({ rootState }) {
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      let payload = { bookshelf: localStorage.getItem('zthBookshelf') }
      let path = `items/user_data/${dataId}?fields=id`
      await this.$directus.patch(path, payload)
    }
  }
}
export const getters = {
  has: state => itemData => {
    if (state.items) {
      let hasitemData = false
      hasitemData = state.items.find(
        item => item.id && item.id === itemData.id
      )
      return hasitemData
    }
  },
  count: state => () => {
    if (state.items) {
      return state.items.length
    } else {
      return 0
    }
  }
}

