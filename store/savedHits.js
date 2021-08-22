import deepEqual from 'deep-equal'

export const state = () => {
  return {
    savedHits: {},
    savedHitsLoaded: false
  }
}
export const mutations = {
  LOAD_SAVED_HITS(state) {
    if (typeof localStorage !== 'undefined') {
      let savedHits = JSON.parse(localStorage.getItem('zthSavedHits') || '{}')
      state.savedHits = savedHits || state.savedHits
      console.log(state.savedHits)
      state.savedHitsLoaded = true
    }
  },
  ADD_SAVED_HIT(state, options) {
    if (typeof localStorage !== 'undefined') {
      let hitToSave = {
        terms: options.terms,
        videoId: options.hit.video.id,
        lineIndex: options.hit.lineIndex
      }
      if (!state.savedHits[options.l2]) {
        state.savedHits[options.l2] = []
      }
      let savedHits = Object.assign({}, state.savedHits)
      savedHits[options.l2].push(hitToSave)
      localStorage.setItem('zthSavedHits', JSON.stringify(savedHits))
      this._vm.$set(state, 'savedHits', savedHits)
    }
  },
  REMOVE_SAVED_HIT(state, { terms, hit, l2 } = {}) {
    let hitToRemove = {
      terms: terms,
      videoId: hit.video.id,
      lineIndex: hit.lineIndex
    }
    console.log('hitToRemove', hitToRemove)
    if (typeof localStorage !== 'undefined' && state.savedHits[l2]) {
      let savedHits = Object.assign({}, state.savedHits)
      savedHits[l2] = savedHits[l2].filter(
        hit => {
          let remove = (hit.terms[0] === hitToRemove.terms[0])
            && (hit.videoId === hitToRemove.videoId)
            && (hit.lineIndex === hitToRemove.lineIndex)
          return !remove
        }
      )
      localStorage.setItem('zthSavedHits', JSON.stringify(savedHits))
      this._vm.$set(state, 'savedHits', savedHits)
    }
  },
  REMOVE_ALL_SAVED_HITS(state, options) {
    if (typeof localStorage !== 'undefined' && state.savedHits[options.l2]) {
      let savedHits = Object.assign({}, state.savedHits)
      savedHits[options.l2] = []
      localStorage.setItem('zthSavedHits', JSON.stringify(savedHits))
      this._vm.$set(state, 'savedHits', savedHits)
    }
  }
}
export const actions = {
  add({ commit, dispatch }, options) {
    commit('ADD_SAVED_HIT', options)
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_HIT', options)
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_HITS', options)
  }
}
export const getters = {
  has: state => options => {
    let hitToTest = {
      terms: options.terms,
      videoId: options.hit.video.id,
      lineIndex: options.hit.lineIndex
    }
    if (state.savedHits[options.l2]) {
      let savedHit = false
      savedHit = state.savedHits[options.l2].find(
        hit => hit.terms[0] === hitToTest.terms[0] && hit.videoId === hitToTest.videoId && hit.lineIndex === hitToTest.lineIndex
      )
      return savedHit
    }
  }
}