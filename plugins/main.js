import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VueObserveVisibility from 'vue-observe-visibility'
import VueAnalytics from 'vue-analytics'
import VueDisqus from 'vue-disqus'
import VueSimpleSVG from 'vue-simple-svg'

Vue.config.productionTip = false

Vue.use(VTooltip)
Vue.use(VueSimpleSVG)
Vue.use(VueObserveVisibility)
Vue.use(VueAnalytics, {
  id: 'UA-1846573-21'
})
Vue.use(VueDisqus)


// https://stackoverflow.com/questions/44371639/how-to-remove-html-tags-from-rendered-text
Vue.filter('striphtml', function (value) {
  var div = document.createElement('div')
  div.innerHTML = value
  var text = div.textContent || div.innerText || ''
  return text
})

https://stackoverflow.com/questions/35070271/vue-js-components-how-to-truncate-the-text-in-the-slot-element-in-a-component
Vue.filter('truncate', function(text, length, clamp){
  clamp = clamp || '...'
  var node = document.createElement('div')
  node.innerHTML = text
  var content = node.textContent
  return content.length > length ? content.slice(0, length) + clamp : content
})



