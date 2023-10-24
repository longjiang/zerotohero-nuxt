import { logError } from '../lib/helper'
import Vue from 'vue';


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
    l2Id: null, // The internal language ID of the current language
    watchHistory: [], // Array of historyItem objects for the current language
    watchHistoryLoading: false, // Whether the user's history is currently being loaded from the server
    watchHistoryLoadedForL2Id: false // Whether the user's history has been loaded from the server for the current language
  }
}
export const mutations = {
  // Load the user's history from Directus and store it in the Vuex state.
  LOAD_WATCH_HISTORY(state, { l2Id, watchHistoryItems }) {
    // Load the user's history from the Directus server
    state.watchHistory = watchHistoryItems
    state.watchHistoryLoadedForL2Id = l2Id
    state.l2Id = l2Id
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
  },

  ADD_VIDEO_DETAILS(state, { watchHistory, video }) {
    Vue.set( watchHistory, 'video', video )
  },
}
export const actions = {
  // Load the user's history if it hasn't been loaded yet.
  async load({ commit, rootState }, l2Id) {
    if (state.watchHistoryLoadedForL2Id !== l2Id && !state.watchHistoryLoading) {
      if (!$nuxt.$auth.loggedIn) return
      state.watchHistoryLoading = true
      let user = rootState.auth.user
      let token = $nuxt.$auth.strategy.token.get()
      if (user && user.id && token) {
        let path = 'items/user_watch_history'
        let response = await this.$directus.get(path, { 'filter[owner][eq]': user.id, 'filter[l2][eq]': l2Id, 'sort': '-id' })
        if (response?.status !== 200) {
          logError('Error loading watch history from the server', response)
          return
        } else {
          const watchHistoryItems = response.data?.data || []
          // let fields = "fields=id,l2,title,youtube_id,tv_show,talk,date,views,tags,category,locale,duration,made_for_kids,views,likes,comments,lex_div,word_freq,difficulty";
          // let filter = `filter[id][in]=${watchHistoryItems.map(item => item.video_id).join(',')}`
          // let query = `${fields}&${filter}`
          // let videos = await this.$directus.getVideos({ l2Id, query })
          // watchHistoryItems.forEach(item => {
          //   let video = videos.find(video => video.id === item.video_id)
          //   if (video) {
          //     item.video = video
          //   }
          // })
          commit('LOAD_WATCH_HISTORY', { watchHistoryItems, l2Id })
          console.log(`Watch History: ${watchHistoryItems.length} items loaded for L2 ${l2Id}`)
        }
      }
      state.watchHistoryLoading = false
    }
  },

  async fetchVideoDetails({ commit, state }, { l2Id, videoId }) {
    // Find the watchHistory item for this video in the state
    let watchHistory = state.watchHistory.find(like => like.video_id === videoId && like.l2 === l2Id)
    if (watchHistory && ! watchHistory.video) {
      let fields = "fields=id,l2,title,youtube_id,tv_show,talk,date,views,tags,category,locale,duration,made_for_kids,views,likes,comments";
      let filter = `filter[id][eq]=${videoId}`
      let query = `${fields}&${filter}`
      
      let videos = await this.$directus.getVideos({ l2Id, query })
      commit('ADD_VIDEO_DETAILS', { watchHistory, video: videos[0] })
    }
  },

  // Add a history item to the Vuex state and sync it to the backend.
  async addOrUpdate({ state, commit, dispatch, getters }, historyItem) {
    if (!historyItem.video_id) return
    if (state.watchHistoryLoadedForL2Id !== historyItem.l2) {
      await dispatch('load', historyItem.l2)
    }
    // First, check if this history item already exists in the user's history. If so, update it; otherwise, add it.
    let hasHistoryItem = getters.has(historyItem)
    if (hasHistoryItem) {
      // Update the history item in the Directus server
      let path = `items/user_watch_history/${hasHistoryItem.id}`
      let mergedHistoryItem = { ...hasHistoryItem, ...historyItem }
      // Do not save the `video` property to the server
      delete mergedHistoryItem.video
      await this.$directus.patch(path, mergedHistoryItem)
      commit('UPDATE_HISTORY_ITEM', historyItem)
      console.log(`Watch History: YouTube video ${historyItem.video_id} updated with new position ${historyItem.last_position}`)
    } else {
      // Add the history item to the Directus server
      let path = 'items/user_watch_history'
      // Do not save the `video` property to the server. We clone it and delte it from the clone.
      let payload = { ...historyItem }
      delete payload.video
      let response = await this.$directus.post(path, payload)
      if (response?.status !== 200) {
        logError('Error adding watch history item to the server', response)
        return
      } else {
        historyItem.id = response.data.data.id
      }
      console.log(`Watch History: YouTube video ${historyItem.video_id} added with position ${historyItem.last_position}`)
      commit('ADD_HISTORY_ITEM', historyItem)
    }    
  },
  // Remove a history item from the Vuex state and sync it to the backend.
  async remove({ commit }, historyItem) {
    // Remove the history item from the Directus server
    let path = `items/user_watch_history/${historyItem.id}`
    await this.$directus.delete(path)
    commit('REMOVE_HISTORY_ITEM', historyItem)
  },
  // Remove all history items from the Vuex state and sync it to the backend.
  async removeAll({ state, dispatch }) {
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
        item => {
          return item.video_id && item.video_id === historyItem.video_id
        }
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

