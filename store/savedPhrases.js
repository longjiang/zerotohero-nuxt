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
        phrase, phrasebookId, pronunciation, exact, translations
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
  REMOVE_ALL_SAVED_PHRASES(state, { l2 }) {
    if (typeof localStorage !== 'undefined' && state.savedPhrases[l2]) {
      let savedPhrases = Object.assign({}, state.savedPhrases)
      savedPhrases[l2] = []
      localStorage.setItem('zthSavedPhrases', JSON.stringify(savedPhrases))
      this._vm.$set(state, 'savedPhrases', savedPhrases)
    }
  }
}
export const actions = {
  add({ commit, dispatch }, options) {
    commit('ADD_SAVED_PHRASE', options)
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_PHRASE', options)
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_PHRASES', options)
  }
}
export const getters = {
  has: state => ({ l2, phrase, phrasebookId, pronunciation, exact, translations = {} } = {}) => {
    let phraseToTest = {
      phrase, phrasebookId, pronunciation, exact, translations
    }
    if (state.savedPhrases[l2]) {
      let savedphrase = false
      savedphrase = state.savedPhrases[l2].find(
        phrase => phrase.phrase === phraseToTest.phrase
      )
      return savedphrase ? true : false
    }
  },
  count: state => ({ l2 }) => {
    if (state.savedPhrases[l2]) {
      return state.savedPhrases[l2].length
    } else {
      return 0
    }
  }
}
