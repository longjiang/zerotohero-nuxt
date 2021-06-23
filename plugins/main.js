import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueObserveVisibility from 'vue-observe-visibility'
import VueDisqus from 'vue-disqus'
import VueSimpleSVG from 'vue-simple-svg'
import VueAnalytics from 'vue-analytics'
import Languages from '@/lib/languages'
import ModuleLoader from '~/lib/module-loader'
import WorkerModuleLoader from '~/lib/worker-module-loader'
import { i18n } from '~/plugins/i18n.js'
import Vue2TouchEvents from 'vue2-touch-events'
 
Vue.config.productionTip = false

Vue.use(VTooltip)
Vue.use(VueSimpleSVG)
Vue.use(VueObserveVisibility)
Vue.use(VueDisqus)
Vue.use(i18n)
Vue.use(VueAnalytics, {
  id: 'UA-1846573-21'
})
Vue.use(Vue2TouchEvents)

// https://stackoverflow.com/questions/44371639/how-to-remove-html-tags-from-rendered-text
Vue.filter('striphtml', function (value) {
  var div = document.createElement('div')
  div.innerHTML = value
  var text = div.textContent || div.innerText || ''
  return text
})

https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function (text, length, clamp) {
  clamp = clamp || '...'
  var node = document.createElement('div')
  node.innerHTML = text
  var content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
})

export default ({ app, store }, inject) => {
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
    inject('languages', Languages.load())
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
      if (process.server) {
        let dictionary = ModuleLoader.load('dictionaries/' + store.state.settings.dictionaryName + '-server', { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] })
        return dictionary
      } else {
        let dictionary = WorkerModuleLoader.load(store.state.settings.dictionaryName, { l1: store.state.settings.l1["iso639-3"], l2: store.state.settings.l2["iso639-3"] })
        return dictionary
      }
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