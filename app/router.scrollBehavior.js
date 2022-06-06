let feedSavedPosition

export default function (to, from, savedPosition) {
  if (from.name === 'all-media') feedSavedPosition = { x: window.scrollX, y: window.scrollY }
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  } else if (from.name === 'dictionary' && to.name === 'dictionary') {
    return '.dictionary-main'
  } else if (to.name === 'all-media') {
    if (feedSavedPosition) return feedSavedPosition
  } else {
    return { x: 0, y: -40 }
  }
}