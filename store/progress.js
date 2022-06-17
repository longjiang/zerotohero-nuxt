import Config from '@/lib/config'
import Helper from '@/lib/helper'

export const DEFAULT_LEVEL = 1
export const DEFAULT_WEEKLY_HOURS = 7

export const state = () => {
  return {
    progress: {}, // Each language has its own progress
    progressLoaded: false
  }
}
export const mutations = {
  IMPORT_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      let progress
      try {
        progress = JSON.parse(json)
      } catch (err) {
        Helper.logError(err)
      }
      if (progress) {
        state.progress = progress
        localStorage.setItem('zthProgress', JSON.stringify(state.progress))
      }
      state.progressLoaded = true
    }
  },
  LOAD(state) {
    if (typeof localStorage !== 'undefined') {
      let progress = JSON.parse(localStorage.getItem('zthProgress') || '{}')
      state.progress = progress || state.progress
      state.progressLoaded = true
    }
  },
  REMOVE_L2_PROGRESS(state, { l2 }) {
    if (typeof localStorage !== 'undefined') {
      state.progress[l2.code] = null
      let progress = Object.assign({}, state.progress)
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  SET_LEVEL(state, { l2, level }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      progress[l2.code].level = level
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  SET_WEEKLY_HOURS(state, { l2, weeklyHours }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      progress[l2.code].weeklyHours = weeklyHours
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  SET_TIME(state, { l2, time }) {
    console.log(`⏳ Set time for ${l2.name} (${l2.code}): ${parseInt(time / 1000)} seconds`)
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      progress[l2.code].time = time
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
  ADD_CERTIFICATION(state, { l2, certification }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.progress[l2.code]) {
        state.progress[l2.code] = {}
      }
      let progress = Object.assign({}, state.progress)
      if (!progress[l2.code].certifications) progress[l2.code].certifications = []
      progress[l2.code].certifications.push(certification)
      localStorage.setItem('zthProgress', JSON.stringify(progress))
      this._vm.$set(state, 'progress', progress)
    }
  },
}
export const actions = {
  load({ commit }) {
    if (!state.progressLoaded) commit('LOAD')
    // Data from the server is loaded via default.vue's initAndGetUserData()
  },
  async importFromJSON({ commit }, json) {
    commit('IMPORT_FROM_JSON', json)
  },
  setLevel({ dispatch, commit }, { l2, level }) {
    commit('SET_LEVEL', { l2, level })
    dispatch('push')
  },
  setWeeklyHours({ dispatch, commit }, { l2, weeklyHours }) {
    commit('SET_WEEKLY_HOURS', { l2, weeklyHours })
    dispatch('push')
  },
  removeL2Progress({ dispatch, commit }, { l2 }) {
    commit('REMOVE_L2_PROGRESS', { l2 })
    dispatch('push')
  },
  async fetchProgressFromServer() {
    if (!$nuxt.$auth.loggedIn) return
    let dataId = this.$auth.$storage.getUniversal('dataId');
    let url = `${Config.wiki}items/user_data/${dataId}?fields=id,progress`
    let res = await this.$authios.get(url)
      .catch(async (err) => {
        Helper.logError(err, 'progress.js: setTime()')
      })
    if (res && res.data && res.data.data) {
      let progress = JSON.parse(res.data.data.progress)
      return progress
    } else {
      return false
    }
  },
  /**
   * 
   * @param {object} context 
   * @param {object} options { l2: language object, time: time in milliseconds, autoLog: whether this action is dispatched from the auto time logger }
   */
  async setTime({ dispatch, commit }, { l2, time, autoLog }) {
    if (autoLog) {
      // every minute
      if (time % 60000 === 0) {
        let progress = await dispatch('fetchProgressFromServer')
        if (progress?.[l2.code]) {
          let timeFromServer = progress[l2.code].time
          if (time > timeFromServer) {
            commit('SET_TIME', { l2, time })
            console.log(`✅ New time is ${(time - timeFromServer) / 1000}s greater than time on server, pushing...`)
            dispatch('push')
          } else {
            commit('SET_TIME', { l2, time: progress[l2.code].time })
          }
        }
      } else {
        commit('SET_TIME', { l2, time })
      }
    } else {
      commit('SET_TIME', { l2, time })
      dispatch('push')
    }
  },
  async push({ rootState }) {
    if (!$nuxt.$auth.loggedIn) return
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      let payload = { progress: localStorage.getItem('zthProgress') }
      let url = `${Config.wiki}items/user_data/${dataId}?fields=id`
      console.log('🕙 Saving progress to the server...')
      await this.$authios.patch(url, payload)
        .catch(async (err) => {
          Helper.logError(err, 'progress.js: push()')
        })
    }
  }
}
export const getters = {
  level: state => l2 => {
    if (state.progress[l2.code]) return state.progress[l2.code].level || DEFAULT_LEVEL
  },
  time: state => l2 => {
    let time = 0
    if (state.progress[l2.code] && state.progress[l2.code].time) time = state.progress[l2.code].time
    return time
  },
  weeklyHours: state => l2 => {
    let weeklyHours = DEFAULT_WEEKLY_HOURS
    if (state.progress[l2.code] && state.progress[l2.code].weeklyHours) weeklyHours = state.progress[l2.code].weeklyHours || DEFAULT_WEEKLY_HOURS
    return weeklyHours
  }
}

