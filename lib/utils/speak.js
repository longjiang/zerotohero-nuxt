import Speech from "speak-tts";

export const bestVoicesForL2 = async ({ l2, localOnly = false }) => {
  const speech = new Speech()
  const data = await speech.init({
    lang: l2.code
  })
  let voices = data.voices
  if (localOnly) {
    voices = voices.filter(voice => voice.localService)    
  }
  let availableLocales = voices.map((voice) => voice.lang)
  let preferredLocales = [l2.code]
  if (l2.code === 'yue') preferredLocales = ['zh-HK'].concat(preferredLocales)
  if (l2.code === 'en') preferredLocales = ['en-US'].concat(preferredLocales)
  if (l2.code === 'ms') preferredLocales = preferredLocales.concat(['id', 'id-ID'])
  if (l2.locales)
    preferredLocales = preferredLocales.concat(l2.locales)
  let bestLocale = preferredLocales.find(preferredLocale => availableLocales.includes(preferredLocale))
  if (bestLocale) {
    let bestVoices = voices.filter(voice => voice.lang === bestLocale)
    let bannedNames = 'Albert,Bad News,Bahh,Bells,Boing,Bubbles,Cellos,Wobble,Eddy (English (U.S.)),Flo (English (U.S.)),Good News,Grandma (English (U.S.)),Grandpa (English (U.S.)),Jester,Organ,Superstar,Reed (English (U.S.)),Rocko (English (U.S.)),Sandy (English (U.S.)),Shelley (English (U.S.)),Trinoids,Whisper,Zarvox'.split(',')
    bestVoices = bestVoices.filter(voice => !bannedNames.includes(voice.name))
    return bestVoices
  } else {
    return []
  }
}

export const speak = async ({ l2, text }) => {
  const speech = new Speech()
  await speech.init({
    lang: l2.code
  })

  // Check if this is iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOSAndSafari = isIOS && isSafari;

  // iOS Safari doesn't support setting the voice. Setting the voice will result in speaking out an object data
  if (!isIOSAndSafari) {
    const bestVoices = await bestVoicesForL2({ l2, localOnly: true })
    const bestVoice = bestVoices?.[0]
    if (bestVoice) speech.setVoice(bestVoice.name)
  }  

  speech.speak({
      text
  }).catch(e => {
      console.error("An error occurred with TTS:", e)
  })
}