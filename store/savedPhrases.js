import { logError } from "../lib/utils"

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
      let savedPhrases
      try {
        savedPhrases = JSON.parse(json)
      } catch (err) {
        logError(err)
      }
      if (savedPhrases) {
        state.savedPhrases = savedPhrases
        localStorage.setItem('zthSavedPhrases', JSON.stringify(savedPhrases))
      }
      state.savedPhrasesLoaded = true
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
    if (!state.savedPhrasesLoaded) commit('LOAD_SAVED_PHRASES')
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
    if (!$nuxt.$auth.loggedIn) return
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      token = token.replace('Bearer ', '')
      let payload = { saved_phrases: localStorage.getItem('zthSavedPhrases') }
      let path = `items/user_data/${dataId}?fields=id`
      await this.$directus.patch(path, payload)
    }
  },
  async importFromJSON({ commit, dispatch }, json) {
    commit('IMPORT_PHRASES_FROM_JSON', json)
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
  get: state => ({ l2, phrase, phrasebookId, pronunciation, exact, translations = {} } = {}) => {
    let phraseToTest = {
      phrase, phrasebookId, pronunciation, exact, translations
    }
    if (state.savedPhrases && state.savedPhrases[l2]) {
      let savedphrase = state.savedPhrases[l2].find(
        phrase => phrase.phrase === phraseToTest.phrase
      )
      return savedphrase
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
