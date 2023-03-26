export const getVoices = (l2, localOnly = false) => {
  let voices = speechSynthesis.getVoices()
  if (localOnly) {
    voices = voices.filter(voice => voice.localService === true)
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

export default (text, l2, rate = 0.75, volume = 1, localOnly = false, voice = undefined) => {
  if (!voice) {
    let bestVoices = getVoices(l2, localOnly)
    voice = bestVoices[0]
  }
  if (voice) {
    var utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voice.lang
    utterance.voice = voice
    utterance.rate = rate
    utterance.volume = volume

    return new Promise(function (resolve) {
      utterance.onend = resolve;
      utterance.onerror = resolve;
      // console.log('🌲 Started speaking')
      speechSynthesis.speak(utterance);
    });
    // console.log('🍁 finished speaking')
  }
}