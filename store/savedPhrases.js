import Config from '@/lib/config'

export const state = () => {
  return {
    savedPhrases: {},
    savedPhrasesLoaded: false
  }
}
export const mutations = {
  LOAD_SAVED_PHRASES(state) {
    if (typeof localStorage !== 'undefined') {
      let savedPhrases = JSON.parse(localStorage.getItem('zthSavedPhrases') || '{}')
      state.savedPhrases = savedPhrases || state.savedPhrases
      state.savedPhrasesLoaded = true
    }
  },
  ADD_SAVED_PHRASE(state, { l2, phrase, phrasebookId, pronunciation, exact, translations = {} } = {}) {
    if (typeof localStorage !== 'undefined') {
      let phraseToSave = {
        phrase, phrasebookId, pronunciation, exact,
        date: Date.now()
      }
      for (let key in translations) {
        phraseToSave[key] = translations[key]
      }
      if (!state.savedPhrases[l2]) {
        state.savedPhrases[l2] = []
      }
      if (
        !state.savedPhrases[l2].find(phrase => phrase.phrase === phraseToSave.phrase)
      ) {
        let savedPhrases = Object.assign({}, state.savedPhrases)
        savedPhrases[l2].push(phraseToSave)
        localStorage.setItem('zthSavedPhrases', JSON.stringify(savedPhrases))
        this._vm.$set(state, 'savedPhrases', savedPhrases)
      }
    }
  },
  IMPORT_PHRASES(state, rows) {
    if (typeof localStorage !== 'undefined') {
      for (let row of rows) {
        if (!state.savedPhrases[row.l2]) {
          state.savedPhrases[row.l2] = []
        }
        if (
          !state.savedPhrases[row.l2].find(p => p.phrase === row.phrase)
        ) {
          state.savedPhrases[row.l2].push(row)
        }
      }
      localStorage.setItem('zthSavedPhrases', JSON.stringify(state.savedPhrases))
    }
  },
  IMPORT_PHRASES_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      state.savedPhrases = JSON.parse(json) || state.savedPhrases
      localStorage.setItem('zthSavedPhrases', JSON.stringify(state.savedPhrases))
    }
  },
  REMOVE_SAVED_PHRASE(state, { l2, phrase, phrasebookId, pronunciation, exact, translations = {} } = {}) {
    if (typeof localStorage !== 'undefined' && state.savedPhrases[l2]) {
      let phraseToRemove = {
        phrase, phrasebookId, pronunciation, exact, translations
      }
      let phrases = state.savedPhrases[l2]
      if (phrases) {
        const index = phrases.findIndex(
          phrase => phrase.phrase === phraseToRemove.phrase
        )
        if (index !== -1) {
          phrases.splice(index, 1)
          let savedPhrases = Object.assign({}, state.savedPhrases)
          savedPhrases[l2] = phrases
          localStorage.setItem('zthSavedPhrases', JSON.stringify(savedPhrases))
          this._vm.$set(state, 'savedPhrases', savedPhrases)
        }
      }
    }
  },
  REMOVE_ALL_SAVED_PHRASES(state, { l2 } = {}) {
    if (typeof localStorage !== 'undefined') {
      let savedPhrases = Object.assign({}, state.savedPhrases)
      console.log('l2', l2)
      if (l2) {
        if (state.savedPhrases[l2]) {
          savedPhrases[l2] = []
        }
      } else {
        savedPhrases = {}
      }
      localStorage.setItem('zthSavedPhrases', JSON.stringify(savedPhrases))
      this._vm.$set(state, 'savedPhrases', savedPhrases)
    }
  }
}
export const actions = {
  load({ commit, dispatch }) {
    commit('LOAD_SAVED_PHRASES')
    dispatch('pull')
  },
  add({ commit, dispatch }, options) {
    commit('ADD_SAVED_PHRASE', options)
    dispatch('push')
  },
  importPhrases({ commit, dispatch }, rows) {
    commit('IMPORT_PHRASES', rows)
    dispatch('push')
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_PHRASE', options)
    dispatch('push')
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_PHRASES', options)
    dispatch('push')
  },
  async push({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let payload = { saved_phrases: JSON.stringify(state.savedPhrases) }
      await axios.patch(`${Config.wiki}items/user_data/${user.id}?access_token=${user.token}`, payload)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, saved_phrases: JSON.stringify(state.savedPhrases) })
          }
        })
    }
  },
  async pull({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let res = await axios.get(`${Config.wiki}items/user_data/${user.id}?fields=saved_phrases&access_token=${user.token}`)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, saved_phrases: JSON.stringify(state.savedPhrases) })
          }
        })
      if (res && res.data && res.data.data) {
        commit('IMPORT_PHRASES_FROM_JSON', res.data.data.saved_phrases)
      }
    }
  }
}
export const getters = {
  has: state => ({ l2, phrase, phrasebookId, pronunciation, exact, translations = {} } = {}) => {
    let phraseToTest = {
      phrase, phrasebookId, pronunciation, exact, translations
    }
    if (state.savedPhrases && state.savedPhrases[l2]) {
      let savedphrase = false
      savedphrase = state.savedPhrases[l2].find(
        phrase => phrase.phrase === phraseToTest.phrase
      )
      return savedphrase ? true : false
    }
  },
  count: state => ({ l2 }) => {
    if (state.savedPhrases && state.savedPhrases[l2]) {
      return state.savedPhrases[l2].length
    } else {
      return 0
    }
  }
}
