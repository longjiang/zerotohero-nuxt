import shareMutations from 'vuex-shared-mutations'

export default ({ store }) => {
  window.onNuxtReady(nuxt => {
    shareMutations({
      predicate: ['savedWords/ADD_SAVED_WORD', 'savedWords/REMOVE_SAVED_WORD']
    })(store)
  })
}
