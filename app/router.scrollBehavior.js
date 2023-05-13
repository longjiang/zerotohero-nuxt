let feedSavedPosition

function getScrollingElement() {
  return document.querySelector('.content-area')
}

export default async function (to, from, savedPosition) {
  const scrollingElement = getScrollingElement()

  if (from.name === 'feed') feedSavedPosition = { x: scrollingElement.scrollLeft, y: scrollingElement.scrollTop }
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  } else if (from.name === 'dictionary' && to.name === 'dictionary') {
    return '.dictionary-main'
  } else if (to.name === 'feed') {
    if (feedSavedPosition) return feedSavedPosition
  } else {
    scrollingElement.scrollLeft = 0
    scrollingElement.scrollTop = -40
  }
}