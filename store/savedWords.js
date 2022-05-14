import { openDB, deleteDB, wrap, unwrap } from 'idb';

let db = undefined

let store = undefined

const setupDB = async () => {
  db = await openDB('zthSavedWords', 1, {
    upgrade(db, oldVersion, newVersion, transaction) {
      db.createObjectStore("zthSavedWords", { keyPath: "l2id" });
    },
  });
  store = db.transaction('zthSavedWords')
}

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
          forms: options.wordForms,
          date: Date.now()
        })
        localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
        this._vm.$set(state, 'savedWords', savedWords)
      }
    }
  },
  IMPORT_WORDS(state, rows) {
    if (typeof localStorage !== 'undefined') {
      for (let { id, forms, l2 } of rows) {
        if (!state.savedWords[l2]) {
          state.savedWords[l2] = []
        }
        if (
          !state.savedWords[l2].find(item => item.id === id)
        ) {
          let savedWords = Object.assign({}, state.savedWords)
          savedWords[l2].push({
            id,
            forms: forms.split(',')
          })
        }
      }
      localStorage.setItem('zthSavedWords', JSON.stringify(state.savedWords))
    }
  },
  REMOVE_SAVED_WORD(state, options) {
    if (typeof localStorage !== 'undefined' && state.savedWords[options.l2]) {
      const keepers = state.savedWords[options.l2].filter(
        item => item.id != options.word.id
      )
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[options.l2] = keepers
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  },
  REMOVE_ALL_SAVED_WORDS(state, options = {}) {
    if (typeof localStorage !== 'undefined') {
      let savedWords = Object.assign({}, state.savedWords)
      if (options.l2) {
        if (state.savedWords[options.l2]) {
          savedWords[options.l2] = []
        }
      } else {
        savedWords = {}
      }
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  }
}
export const actions = {
  add({ commit, dispatch }, options) {
    commit('ADD_SAVED_WORD', options)
  },
  importWords({ commit, dispatch }, rows) {
    commit('IMPORT_WORDS', rows)
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_WORD', options)
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_WORDS', options)
  }
}
export const getters = {
  has: state => ({ l2, id, text }) => {
    if (state.savedWords[l2]) {
      let savedWord = false
      if (id) {
        savedWord = state.savedWords[l2].find(
          item => item.id && item.id == id
        )
      } else if (text) {
        let search = text.toLowerCase()
        savedWord = state.savedWords[l2].find(
          item => {
            let forms = item.forms
            // Take care of edge cases where a user has used an old version of the site and imported word forms as a string rather than array.
            if (typeof forms === 'string') forms = forms.split(',')
            return forms.includes(search)
          }
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

