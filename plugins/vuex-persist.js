import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  new VuexPersistence({
    // supportCircular: true,
    reducer: (state) => ({ auth: state.auth }),
  }).plugin(store);
}