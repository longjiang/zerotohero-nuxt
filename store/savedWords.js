// import { openDB, deleteDB, wrap, unwrap } from 'idb';

// let db = undefined

// let store = undefined

// const setupDB = async () => {
//   db = await openDB('zthSavedWords', 1, {
//     upgrade(db, oldVersion, newVersion, transaction) {
//       db.createObjectStore("zthSavedWords", { keyPath: "l2id" });
//     },
//   });
//   store = db.transaction('zthSavedWords')
// }
import Config from '@/lib/config'

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
        localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
        this._vm.$set(state, 'savedWords', savedWords)
        buildIndex(l2, state)
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
  IMPORT_WORDS_FROM_JSON(state, json) {
    if (typeof localStorage !== 'undefined') {
      state.savedWords = JSON.parse(json)
      for (let l2 in state.savedWords) {
        buildIndex(l2, state)
      }
      localStorage.setItem('zthSavedWords', JSON.stringify(state.savedWords))
    }
  },
  REMOVE_SAVED_WORD(state, { l2, word }) {
    if (typeof localStorage !== 'undefined' && state.savedWords[l2]) {
      const keepers = state.savedWords[l2].filter(
        item => item.id != word.id
      )
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[l2] = keepers
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
      buildIndex(l2, state)
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
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
      buildIndex(l2, state)
    }
  }
}
export const actions = {
  load({ commit, dispatch }) {
    commit('LOAD_SAVED_WORDS')
    dispatch('pull')
  },
  async add({ dispatch, commit }, { l2, word, wordForms }) {
    commit('ADD_SAVED_WORD', { l2, word, wordForms })
    dispatch('push')
  },
  importWords({ commit, dispatch }, rows) {
    commit('IMPORT_WORDS', rows)
    dispatch('push')
  },
  remove({ commit, dispatch }, options) {
    commit('REMOVE_SAVED_WORD', options)
    dispatch('push')
  },
  removeAll({ commit, dispatch }, options) {
    commit('REMOVE_ALL_SAVED_WORDS', options)
    dispatch('push')
  },
  async push({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let payload = { saved_words: JSON.stringify(state.savedWords) }
      await axios.patch(`${Config.wiki}items/user_data/${user.id}?access_token=${user.token}`, payload)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, saved_words: JSON.stringify(state.savedWords) })
          }
        })
    }
  },
  async pull({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let res = await axios.get(`${Config.wiki}items/user_data/${user.id}?fields=saved_words&access_token=${user.token}`)
        .catch(async (err) => {
          if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 203) {
            // Initialize the user data record if there isn't one
            await axios.post(`${Config.wiki}items/user_data?access_token=${user.token}`, { id: user.id, saved_words: JSON.stringify(state.savedWords) })
          }
        })
      if (res && res.data && res.data.data) {
        commit('IMPORT_WORDS_FROM_JSON', res.data.data.saved_words)
      }
    }
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
        let savedWords = state.formIndex[l2][search] || []
        if (savedWords) return savedWords[0]
      }
      return savedWord
    }
  },
  count: state => ({ l2 }) => {
    if (state.savedWords[l2]) {
      return state.savedWords[l2].length
    } else {
      return 0
    }
  }
}

