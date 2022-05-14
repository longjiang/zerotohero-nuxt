import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueObserveVisibility from 'vue-observe-visibility'
import VueSimpleSVG from 'vue-simple-svg'
import VueGtag from 'vue-gtag'
import Languages from '@/lib/languages'
import ModuleLoader from '~/lib/module-loader'
import WorkerModuleLoader from '~/lib/worker-module-loader'
import { i18n } from '~/plugins/i18n.js'
import VueMq from 'vue-mq'
import VueSmoothScroll from 'vue2-smooth-scroll'


Vue.config.productionTip = false

Vue.use(VTooltip)
Vue.use(VueSimpleSVG)
Vue.use(VueObserveVisibility)
Vue.use(i18n)
Vue.use(VueSmoothScroll)
Vue.use(VueMq, {
  breakpoints: { // default breakpoints - customize this
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: 1400,
    xxl: Infinity
  },
  defaultBreakpoint: 'sm' // customize this for SSR
})


// https://stackoverflow.com/questions/44371639/how-to-remove-html-tags-from-rendered-text
Vue.filter('striphtml', function (value) {
  var div = document.createElement('div')
  div.innerHTML = value
  var text = div.textContent || div.innerText || ''
  return text
})

// https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function (text, length, clamp) {
  clamp = clamp || '...'
  var node = document.createElement('div')
  node.innerHTML = text
  var content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
})

export default async ({ app, store, route }, inject) => {
  Vue.use(VueGtag, {
    config: { id: 'UA-1846573-21' }
  }, app.router)
  // Make legacy hash URLs work
  // https://qvault.io/javascript/vue-history-mode-support-legacy-hash-urls/
  app.router.beforeEach((to, from, next) => {
    // Redirect if fullPath begins with a hash (ignore hashes later in path)
    if (to.fullPath.substr(0, 2) === '/#') {
      const path = to.fullPath.substr(2);
      next(path);
      return;
    }
    next();
  })
  if (!app.$languages) {

    if (process.server) {
      let l1Code = route.params.l1
      let l2Code = route.params.l2
      if (l1Code && l2Code) {
        let languages = await Languages.load([l1Code, l2Code])
        inject('languages', languages)
      }
    } else {
      let languages = await Languages.load()
      inject('languages', languages)
    }
  }

  inject('hasFeature', (feature) => {
    return app.$languages
      .getFeatures({
        l1: store.state.settings.l1,
        l2: store.state.settings.l2,
      }, process.browser)
      .includes(feature);
  });
  inject('getDictionary', async () => {
    if (store.state.settings.l1 && store.state.settings.l1 && store.state.settings.dictionaryName) {
      if (process.client) {
        let dictionary = WorkerModuleLoader.load(store.state.settings.dictionaryName, { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] || store.state.settings.l2["glottologId"] })
        return dictionary
      }
      /* We disable this for now to save bandwidth on Vercel
      else if (process.server) {
        let dictionary = ModuleLoader.load('dictionaries/' + store.state.settings.dictionaryName + '-server', { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] || store.state.settings.l2["glottologId"] })
        return dictionary
      }
      */
    }
  })
  inject('getGrammar', async () => {
    let grammar = ModuleLoader.load('grammar')
    return grammar
  })
  inject('getHanzi', async () => {
    let hanzi = ModuleLoader.load('hanzi')
    return hanzi
  })
  inject('getUnihan', async () => {
    let unihan = ModuleLoader.load('unihan')
    return unihan
  })
}