export default async function ({ app, route, params, i18n }, inject) {
  if (typeof app.$l1 === 'undefined' || typeof app.$l2 === 'undefined' || app.$l1.code !== params.l1 || app.$l2.code !== params.l2) {

    let l1 = app.$languages.getSmart(params.l1)
    let l2 = app.$languages.getSmart(params.l2)
    inject('l1', l1)
    inject('l2', l2)
    i18n.locale = l1.code;
    i18n.silentTranslationWarn = true;
    if (l1.translations) {
      i18n.setLocaleMessage(
        l1.code,
        l1.translations
      )
    }

    inject('hasFeature', (feature) => {
      return app.$languages
        .getFeatures({
          l1: l1,
          l2: l2,
        })
        .includes(feature);
    });

    let dictionaries = l1.dictionaries // ['freedict']
      ? l1.dictionaries[l2["iso639-3"]]
      : undefined;
    if (typeof app.$dictionary === 'undefined' && dictionaries) {
      let dictionaryName = dictionaries[0]
      let dictionary = Dict.load({
        dict: dictionaries[0],
        l1: l1["iso639-3"],
        l2: l2["iso639-3"],
        worker: process.browser
      })
      inject('dictionaryName', dictionaryName); // 'freedict'
      inject('dictionary', dictionary)
    }
  }
  
}