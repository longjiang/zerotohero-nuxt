export const state = () => {
  return {
    savedWords: {},
    savedWordsLoaded: false
  }
}
export const mutations = {
  LOAD_SAVED_WORDS(state) {
    if (typeof localStorage !== 'undefined') {
      let savedWords = JSON.parse(localStorage.getItem('zthSavedWords') || '{}')
      state.savedWords = savedWords || state.savedWords
      state.savedWordsLoaded = true
    }
  },
  ADD_SAVED_WORD(state, options) {
    if (typeof localStorage !== 'undefined') {
      if (!state.savedWords[options.l2]) {
        state.savedWords[options.l2] = []
      }
      if (
        !state.savedWords[options.l2].find(item => item.id === options.word.id)
      ) {
        let savedWords = Object.assign({}, state.savedWords)
        savedWords[options.l2].push({
          id: options.word.id,
          forms: options.wordForms
        })
        localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
        this._vm.$set(state, 'savedWords', savedWords)
      }
    }
  },
  REMOVE_SAVED_WORD(state, options) {
    if (typeof localStorage !== 'undefined' && state.savedWords[options.l2]) {
      const keepers = state.savedWords[options.l2].filter(
        item => item.id !== options.word.id
      )
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[options.l2] = keepers
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  },
  REMOVE_ALL_SAVED_WORDS(state, options) {
    if (typeof localStorage !== 'undefined' && state.savedWords[options.l2]) {
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[options.l2] = []
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  }
}
export const actions = {
  add({ commit, dispatch }, options) {
    commit('ADD_SAVED_WORD', options)
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_WORD', options)
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_WORDS', options)
  }
}
export const getters = {
  has: state => options => {
    if (state.savedWords[options.l2]) {
      let savedWord = false
      if (options.id) {
        savedWord = state.savedWords[options.l2].find(
          item => item.id && item.id === options.id
        )
      } else {
        savedWord = state.savedWords[options.l2].find(
          item => item.forms.map(form => form ? form.toLowerCase() : '').includes(options.text.toLowerCase())
        )
      }
      return savedWord
    }
  },
  count: state => options => {
    if (state.savedWords[options.l2]) {
      return state.savedWords[options.l2].length
    } else {
      return 0
    }
  }
}

