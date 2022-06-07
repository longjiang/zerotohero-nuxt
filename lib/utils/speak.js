export default (text, l2, rate = 0.75, volume = 1, localOnly = false) => {
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
    let bestVoice = voices.find(voice => voice.lang === bestLocale)
    if (bestVoice) {
      var utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = bestLocale
      utterance.voice = bestVoice
      utterance.rate = rate
      utterance.volume = volume

      return new Promise(function (resolve) {
        utterance.onend = resolve;
        utterance.onerror = resolve;
        // console.log('🌲 Started speaking')
        speechSynthesis.speak(utterance);
        // console.log(utterance)
        // console.log(speechSynthesis)
      });
      // console.log('🍁 finished speaking')
    }
  }
}