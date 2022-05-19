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
import Helper from '@/lib/helper'


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

const parseSavedWordsCSV = (csv) => {
  let parsed = Papa.parse(csv, { header: true })
  let rows = parsed.data
  let savedWords = Helper.groupArrayBy(rows, 'l2')
  for (let sW of savedWords) {
    sW.forms = sW.forms.split(',')
  }
  return savedWords
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
  IMPORT_WORDS(state, csv) {
    if (typeof localStorage !== 'undefined') {
      let savedWords = parseSavedWordsCSV(csv)
      for (let l2 in savedWords) {
        if (!state.savedWords[l2]) {
          state.savedWords[l2] = []
        }
        for (let sW of savedWords) {
          if (!state.idIndex[l2][sW.id])
            state.savedWords[l2].push(sW)
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
      let savedWords
      try {
        savedWords = JSON.parse(json)
      } catch (err) {
        console.log(err)
      }
      if (savedWords) {
        state.savedWords = savedWords
        for (let l2 in state.savedWords) {
          buildIndex(l2, state)
        }
        localStorage.setItem('zthSavedWords', JSON.stringify(state.savedWords))
      }
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
  add({ dispatch, commit }, { l2, word, wordForms }) {
    commit('ADD_SAVED_WORD', { l2, word, wordForms })
    dispatch('push')
  },
  importWords({ commit, dispatch }, csv) {
    commit('IMPORT_WORDS', csv)
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
    console.log('🦵 pushing')
    let user = rootState.auth.user
    console.log(user, user.id, user.token, rootState.auth.token)
    if (user && user.id && user.token && user.dataId) {
      let payload = { saved_words: localStorage.getItem('zthSavedWords') }
      let url = `${Config.wiki}items/user_data/${user.dataId}?access_token=${user.token}`
      await axios.patch(url, payload)
        .catch(async (err) => {
          console.log('Axios error in savedWords.js: err, url, payload', err, url, payload)
        })
    }
  },
  async pull({ commit, state, rootState }) {
    let user = rootState.auth.user
    if (user && user.id && user.token) {
      let res = await axios.get(`${Config.wiki}items/user_data?filter[owner][eq]=${user.id}&fields=id,saved_words&access_token=${user.token}`)
        .catch(async (err) => {
          console.log(err)
        })
      if (res && res.data && res.data.data) {
        if (res.data.data[0]) {
          user.dataId = res.data.data[0].id
          commit('IMPORT_WORDS_FROM_JSON', res.data.data[0].saved_words)
        } else {
          // No user data found, let's create it
          user.dataId = createNewUserDataRecord(user.token, { saved_words: JSON.stringify(state.savedWords) })
        }
      }
    }
  }
}

// Initialize the user data record if there isn't one
const createNewUserDataRecord = async (token, payload) => {
  res = await axios.post(`${Config.wiki}items/user_data?access_token=${token}`, payload).catch((err) => {
    console.log('Axios error in savedWords.js: err, url, payload', err, url, payload)
  })
  if (res && res.data && res.data.data) {
    let userDataId = res.data.data.id
    return userDataId
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

