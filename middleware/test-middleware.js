import Dict from '@/lib/dict'
import Vue from 'vue'

export default async function ({ app, store, params, i18n }) {
  if (params.l1 && params.l2) {
    if (store.state.settings.l1 && store.state.settings.l1.code === params.l1 && store.state.settings.l2 && store.state.settings.l2.code === params.l2) {
      return
    } else {
      console.log('changing languages')
      let l1 = app.$languages.getSmart(params.l1)
      let l2 = app.$languages.getSmart(params.l2)
      store.commit('settings/SET_L1', l1)
      store.commit('settings/SET_L2', l2)
      i18n.locale = l1.code;
      i18n.silentTranslationWarn = true;
      if (l1.translations) {
        i18n.setLocaleMessage(
          l1.code,
          l1.translations
        )
      }

      let dictionaries = l1.dictionaries // ['freedict']
        ? l1.dictionaries[l2["iso639-3"]]
        : undefined;
      
      if (dictionaries) {
        store.commit('settings/SET_DICTIONARY_NAME', dictionaries[0])
      }
      

      if (["zh", "ko", "ja"].includes(params.l2)) {
        // let hanzi = await (await import(`@/lib/hanzi.js`)).default.load()
        // store.commit('settings/SET_HANZI', hanzi)
        // let unihan = await (await import(`@/lib/unihan.js`)).default.load()
        // store.commit('settings/SET_UNIHAN', unihan)
      }

      if (["zh"].includes(params.l2)) {
        // let grammar = await (await import(`@/lib/grammar.js`)).default.load()
        // store.commit('settings/SET_GRAMMAR', grammar)
      }
    }
  }
}