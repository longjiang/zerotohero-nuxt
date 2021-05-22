import Vue from 'vue'

export const state = () => ({
  l1: undefined,
  l2: undefined
})

export const mutations = {
  SET_L1(state, l1) {
    state.l1 = l1
    Vue.prototype.$l1 = l1
  },
  SET_L2(state, l2) {
    state.l2 = l2
    Vue.prototype.$l2 = l2
  }
}