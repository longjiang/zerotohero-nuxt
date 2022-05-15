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
    formIndex: {},
    idIndex: {},
    savedWordsLoaded: false
  }
}

const buildIndex = (l2, state) => {
  state.formIndex[l2] = {}
  state.idIndex[l2] = {}
  for (let savedWord of state.savedWords[l2]) {
    for (let form of savedWord.forms) {
      state.formIndex[l2][form] = [savedWord].concat(state.formIndex[l2][form] || [])
    }
    state.idIndex[l2][savedWord.id] = savedWord
  }
}

export const mutations = {
  LOAD_SAVED_WORDS(state) {
    if (typeof localStorage !== 'undefined') {
      let savedWords = JSON.parse(localStorage.getItem('zthSavedWords') || '{}')
      state.savedWords = savedWords || state.savedWords
      for (let l2 in state.savedWords) {
        buildIndex(l2, state)
      }
      state.savedWordsLoaded = true
    }
  },
  ADD_SAVED_WORD(state, { l2, word, wordForms }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.savedWords[l2]) {
        state.savedWords[l2] = []
      }
      if (
        !state.savedWords[l2].find(item => item.id === word.id)
      ) {
        let savedWords = Object.assign({}, state.savedWords)
        savedWords[l2].push({
          id: word.id,
          forms: wordForms,
          date: Date.now()
        })
        buildIndex(l2, state)
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
      for (let l2 in state.savedWords) {
        buildIndex(l2, state)
      }
      localStorage.setItem('zthSavedWords', JSON.stringify(state.savedWords))
    }
  },
  REMOVE_SAVED_WORD(state, { l2, word }) {
    if (typeof localStorage !== 'undefined' && state.savedWords[options.l2]) {
      const keepers = state.savedWords[l2].filter(
        item => item.id != word.id
      )
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[l2] = keepers
      buildIndex(l2, state)
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  },
  REMOVE_ALL_SAVED_WORDS(state, { l2 }) {
    if (typeof localStorage !== 'undefined') {
      let savedWords = Object.assign({}, state.savedWords)
      if (l2) {
        if (state.savedWords[l2]) {
          savedWords[l2] = []
        }
      } else {
        savedWords = {}
      }
      buildIndex(l2, state)
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
    }
  }
}
export const actions = {
  add({ commit }, options) {
    commit('ADD_SAVED_WORD', options)
  },
  importWords({ commit }, rows) {
    commit('IMPORT_WORDS', rows)
  },
  remove({ commit }, options) {
    commit('REMOVE_SAVED_WORD', options)
  },
  removeAll({ commit }, options) {
    commit('REMOVE_ALL_SAVED_WORDS', options)
  }
}
export const getters = {
  has: state => ({ l2, id, text }) => {
    if (state.savedWords[l2]) {
      let savedWord = false
      if (id) {
        savedWord = state.idIndex[l2][id]
      } else if (text) {
        let search = text.toLowerCase()
        let savedWords = state.savedWords[l2][search] || []
        if (savedWords) return savedWords[0]
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

