import { logError, uniqueByValue } from '@/lib/helper'

export const state = () => {
  return {
    /**
     * A historyItem represents a history item saved in the system.
     * 
     * @property {string} id - A unique identifier for the history item (automatically generated).
     * @property {string} owner - Foreign Key. Identifies which user the record pertains to.
     * @property {number} video_id - Foreign Key. Identifies which video the record pertains to.
     * @property {string} l2 - Foreign Key. The internal language ID of the user's secondary language.
     * @property {number} date - Timestamp. This indicates when the user viewed the video. You can use this to show the user's most recently watched videos.
     * @property {number} last_position - Integer. This represents the timestamp (in seconds) where the user last stopped/paused the video. This can be useful if you want to allow users to continue watching from where they left off.
     */
    watchHistory: [], // Array of historyItem objects
    watchHistoryLoaded: false
  }
}
export const mutations = {
  // Load the user's history from Directus and store it in the Vuex state.
  LOAD_WATCH_HISTORY(state, watchHistoryItems) {
    // Load the user's history from the Directus server
    state.watchHistoryItems = watchHistoryItems
    state.watchHistoryLoaded = true
  },
  // Add a new history item to the user's history.
  ADD_HISTORY_ITEM(state, historyItem) {
    state.watchHistory.push(historyItem)
  },
  // Update a history item.
  UPDATE_HISTORY_ITEM(state, historyItem) {
    const index = state.watchHistory.findIndex(item => item.id === historyItem.id)
    if (index !== -1) {
      state.watchHistory[index] = historyItem
    } 
  },
  // Remove a specific history item from the user's history.
  REMOVE_HISTORY_ITEM(state, historyItem) {
    state.watchHistory = state.watchHistory.filter(item => item.id !== historyItem.id)
  },
  // Remove all history items from the user's history.
  REMOVE_ALL_HISTORY(state) {
    state.watchHistory = []
  }
}
export const actions = {
  // Load the user's history if it hasn't been loaded yet.
  async load({ commit, rootState }) {
    if (!state.watchHistoryLoaded) {
      if (!$nuxt.$auth.loggedIn) return
      let user = rootState.auth.user
      let token = $nuxt.$auth.strategy.token.get()
      if (user && user.id && token) {
        let path = 'items/user_watch_history'
        const response = await this.$directus.get(path, { 'filter[owner][eq]': user.id })
        if (response.status !== 200) {
          logError('Error loading watch history from the server', response)
          return
        } else {
          const watchHistoryItems = response.data || []
          commit('LOAD_WATCH_HISTORY', watchHistoryItems)
        }
      }
    }
  },
  // Add a history item to the Vuex state and sync it to the backend.
  async addOrUpdate({ state, commit, dispatch, getters }, historyItem) {
    if (!state.watchHistoryLoaded) {
      dispatch('load')
    }
    // First, check if this history item already exists in the user's history. If so, update it; otherwise, add it.
    let hasHistoryItem = getters.has(historyItem)
    if (hasHistoryItem) {
      // Update the history item in the Directus server
      let path = `items/user_watch_history/${historyItem.id}`
      await this.$directus.patch(path, historyItem)
      commit('UPDATE_HISTORY_ITEM', historyItem)
    } else {
      // Add the history item to the Directus server
      let path = 'items/user_watch_history'
      await this.$directus.post(path, historyItem)
      commit('ADD_HISTORY_ITEM', historyItem)
    }    
  },
  // Remove a history item from the Vuex state and sync it to the backend.
  async remove({ commit, dispatch }, historyItem) {
    // Remove the history item from the Directus server
    let path = `items/user_watch_history/${historyItem.id}`
    await this.$directus.delete(path)
    commit('REMOVE_HISTORY_ITEM', historyItem)
  },
  // Remove all history items from the Vuex state and sync it to the backend.
  async removeAll({ commit, dispatch }) {
    // Using the remove action, remove all history items one by one, from the last to the first.
    let historyItems = state.watchHistory
    for (let i = historyItems.length - 1; i >= 0; i--) {
      await dispatch('remove', historyItems[i])
    }
  },
}
export const getters = {
  // Check if a specific history item exists in the user's history.
  has: state => historyItem => {
    if (state.watchHistory) {
      let hasHistoryItem = false
      hasHistoryItem = state.watchHistory.find(
        item => item.path && item.path === historyItem.path
      )
      return hasHistoryItem
    }
  },
  // Get the total count of items in the user's history.
  count: state => () => {
    if (state.watchHistory) {
      return state.watchHistory.length
    } else {
      return 0
    }
  }
}

