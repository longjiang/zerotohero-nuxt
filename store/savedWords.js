import { groupArrayBy, logError } from '../lib/helper'


export const state = () => {
  return {
    savedWords: {},
    formIndex: {},
    idIndex: {},
    savedWordsLoaded: false
  }
}



const buildIndex = (l2, state) => {
  let formIndex = {}
  let idIndex = {}
  for (let savedWord of state.savedWords[l2]) {
    for (let form of savedWord.forms) {
      formIndex[form] = [savedWord].concat(formIndex[form] || [])
    }
    idIndex[savedWord.id] = savedWord
  }
  return { formIndex, idIndex }
}

const parseSavedWordsCSV = (csv) => {
  let parsed = Papa.parse(csv, { header: true })
  let rows = parsed.data
  for (let sW of rows) {
    sW.forms = sW.forms?.split(',') || [sW.head]
  }
  let savedWords = groupArrayBy(rows, 'l2')
  return savedWords
}

export const mutations = {
  ADD_SAVED_WORD(state, { l2, word, wordForms, context }) {
    if (typeof localStorage !== 'undefined') {
      if (!state.savedWords[l2]) {
        state.savedWords[l2] = []
      }
      if (!state.savedWords[l2].find(item => item.id === word.id)) {
        let savedWords = Object.assign({}, state.savedWords)
        let savedWord = {
          id: word.id,
          forms: [...wordForms],
          date: Date.now(),
          context // { form, text, starttime = undefined, youtube_id = undefined }
        }
        savedWords[l2].push(savedWord)
        localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
  
        // 状態を更新する
        this._vm.$set(state, 'savedWords', savedWords)
  
        // インデックスをインクリメンタルに更新
        for (let form of wordForms) {
          if (!state.formIndex[l2]) {
            state.formIndex[l2] = {}
          }
          if (!state.formIndex[l2][form]) {
            state.formIndex[l2][form] = []
          }
          state.formIndex[l2][form].unshift(savedWord)
        }
  
        if (!state.idIndex[l2]) {
          state.idIndex[l2] = {}
        }
        state.idIndex[l2][word.id] = savedWord
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
        for (let sW of savedWords[l2]) {
          if (!state.idIndex[l2][sW.id])
            state.savedWords[l2].push(sW)
        }
      }
      for (let l2 in state.savedWords) {
        let { formIndex, idIndex } = buildIndex(l2, state)
        state.formIndex[l2] = formIndex
        state.idIndex[l2] = idIndex
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
        logError(err)
      }
      if (savedWords) {
        state.savedWords = savedWords
        for (let l2 in state.savedWords) {
          let { formIndex, idIndex } = buildIndex(l2, state)
          state.formIndex[l2] = formIndex
          state.idIndex[l2] = idIndex
        }
        localStorage.setItem('zthSavedWords', JSON.stringify(state.savedWords))
      }
      state.savedWordsLoaded = true
    }
  },
  REMOVE_SAVED_WORD(state, { l2, word }) {
    if (typeof localStorage !== 'undefined' && state.savedWords[l2]) {
      // 指定された単語を削除する
      const keepers = state.savedWords[l2].filter(
        item => item.id != word.id
      )
      let savedWords = Object.assign({}, state.savedWords)
      savedWords[l2] = keepers
      localStorage.setItem('zthSavedWords', JSON.stringify(savedWords))
      this._vm.$set(state, 'savedWords', savedWords)
  
      // インデックスから削除
      if (state.formIndex[l2]) {
        for (let form of word.saved.forms) {
          if (state.formIndex[l2][form]) {
            state.formIndex[l2][form] = state.formIndex[l2][form].filter(
              item => item.id !== word.id
            )
            // フォームが空になったら削除する
            if (state.formIndex[l2][form].length === 0) {
              delete state.formIndex[l2][form]
            }
          }
        }
      }
  
      if (state.idIndex[l2]) {
        delete state.idIndex[l2][word.id]
      }
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

      let { formIndex, idIndex } = buildIndex(l2, state)
      state.formIndex[l2] = formIndex
      state.idIndex[l2] = idIndex
    }
  }
}
export const actions = {
  // If the user is offline or not logged in, load locally
  async load({ commit, dispatch }) {
    if (state.savedWordsLoaded) return
    if (typeof localStorage !== 'undefined') {
      let json = localStorage.getItem('zthSavedWords') || '{}'
      commit('IMPORT_WORDS_FROM_JSON', json)
    }
  },
  add({ dispatch, commit }, { l2, word, wordForms, context }) {
    commit('ADD_SAVED_WORD', { l2, word, wordForms, context })
    dispatch('push')
  },
  importWords({ commit, dispatch }, csv) {
    commit('IMPORT_WORDS', csv)
    dispatch('push')
  },
  importFromJSON({ commit, dispatch }, json) {
    commit('IMPORT_WORDS_FROM_JSON', json)
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
    if (!$nuxt.$auth.loggedIn) return
    let user = rootState.auth.user
    let token = $nuxt.$auth.strategy.token.get()
    let dataId = this.$auth.$storage.getUniversal('dataId');
    if (user && user.id && dataId && token) {
      token = token.replace('Bearer ', '')
      let payload = { saved_words: localStorage.getItem('zthSavedWords') }
      let path = `items/user_data/${dataId}?fields=id`
      await this.$directus.patch(path, payload)
    }
  }
}

// 「今日」の単語を抽出する関数
export const getTodayWords = (words) => {
  const now = new Date();
  const userTimezoneOffset = now.getTimezoneOffset() * 60000; // 分 → ミリ秒
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - userTimezoneOffset;
  const endOfDay = startOfDay + 86400000; // 24時間

  return words.filter(word => {
    const wordDate = new Date(word.date - userTimezoneOffset).getTime();
    return wordDate >= startOfDay && wordDate < endOfDay;
  });
}


export const getters = {
  has: state => ({ l2, id, text }) => {
    if (state.savedWords[l2]) {
      let savedWord = false
      if (id) {
        savedWord = state.idIndex[l2][id]
      } else if (text) {
        let search = text
        let savedWords = state.formIndex[l2][search] || []
        if (savedWords) return savedWords[0]
      }
      return savedWord
    }
  },
  todayWordCount: state => ({ l2 }) => {
    if (state.savedWords[l2]) {
      let todayWords = getTodayWords(state.savedWords[l2])
      return todayWords.length
    } else {
      return 0
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

