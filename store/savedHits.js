import deepEqual from 'deep-equal'

let localStorage = process.browser ? localStorage : false

const savedHits = {
    namespaced: true,
    state: {
      savedHits: localStorage ? JSON.parse(localStorage.getItem('zthSavedHits')) : {} || {}
    },
    mutations: {
      ADD_SAVED_HIT(state, options) {
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
        Vue.set(state, 'savedHits', savedHits)
      },
      REMOVE_SAVED_HIT(state, options) {
        let hitToRemove = {
          terms: options.terms,
          videoId: options.hit.video.id,
          lineIndex: options.hit.lineIndex
        }
        console.log(hitToRemove)
        if (state.savedHits[options.l2]) {
          let savedHits = Object.assign({}, state.savedHits)
          savedHits[options.l2] = savedHits[options.l2].filter(
            hit =>
              !(hit.terms.join(',') === hitToRemove.terms.join(',')
                && hit.videoId === hitToRemove.videoId
                && hit.lineIndex === hitToRemove.lineIndex)
          )
          localStorage.setItem('zthSavedHits', JSON.stringify(savedHits))
          Vue.set(state, 'savedHits', savedHits)
        }
      },
      REMOVE_ALL_SAVED_HITS(state, options) {
        if (state.savedHits[options.l2]) {
          let savedHits = Object.assign({}, state.savedHits)
          savedHits[options.l2] = []
          localStorage.setItem('zthSavedHits', JSON.stringify(savedHits))
          Vue.set(state, 'savedHits', savedHits)
        }
      }
    },
    actions: {
      add({ commit, dispatch }, options) {
        commit('ADD_SAVED_HIT', options)
      },
      remove({ commit, dispatch }, options) {
        commit('REMOVE_SAVED_HIT', options)
      },
      removeAll({ commit, dispatch }, options) {
        commit('REMOVE_ALL_SAVED_HITS', options)
      }
    },
    getters: {
      has: state => options => {
        let hitToTest = {
          terms: options.terms,
          videoId: options.hit.video.id,
          lineIndex: options.hit.lineIndex
        }
        if (state.savedHits[options.l2]) {
          let savedHit = false
          savedHit = state.savedHits[options.l2].find(
            hit => deepEqual(hit, hitToTest)
          )
          return savedHit
        }
      }
    }
  }