import Wol from '@/lib/jw/Wol'

export default async ({ app, store }, inject) => {
  if (app.$languages) {
    let languages = await app.$languages
    console.log('Loading wol languages...')
    let wolLangs = await Wol.getLanguages()
    for (let l1 of languages.l1s) {
      let wolLang = wolLangs.find(l => l.locale.replace('cmn-Hans', 'zh') === l1.code )
      if (wolLang) {
        l1.wol = wolLang
      }
    }
  }
}