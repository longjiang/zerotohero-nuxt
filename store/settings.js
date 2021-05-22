import Vue from 'vue'

export const state = () => ({
  l1: undefined,
  l2: undefined,
  dictionary: undefined,
  dictionaryName: undefined,
  hanzi: undefined,
  unihan: undefined,
  grammar: undefined
})

export const mutations = {
  SET_L1(state, l1) {
    state.l1 = l1
  },
  SET_L2(state, l2) {
    state.l2 = l2
  },
  SET_DICTIONARY(state, dictionary) {
    state.dictionary = dictionary
  },
  SET_DICTIONARY_NAME(state, dictionaryName) {
    state.dictionaryName = dictionaryName
  },
  SET_HANZI(state, hanzi) {
    state.hanzi = hanzi
  },
  SET_GRAMMAR(state, grammar) {
    state.grammar = grammar
  },
  SET_UNIHAN(state, unihan) {
    state.unihan = unihan
  },
}