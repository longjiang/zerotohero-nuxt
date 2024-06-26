let feedSavedPosition

function getScrollingElement() {
  return document.querySelector('.content-area')
}

export default async function (to, from, savedPosition) {
  const scrollingElement = getScrollingElement()

  if (scrollingElement) {
    if (from.name === 'feed') feedSavedPosition = { x: scrollingElement.scrollLeft, y: scrollingElement.scrollTop }
    if (to.hash && to.hash !== '#') {
      return {
        selector: to.hash
      }
    } else if (from.name === 'dictionary' && to.name === 'dictionary') {
      return '.dictionary-main'
    } else if (from.name === 'compare' && to.name === 'compare') {
      return '.dictionary-main'
    } else if (to.name === 'feed') {
      if (feedSavedPosition) return feedSavedPosition
    } else {
      scrollingElement.scrollLeft = 0
      scrollingElement.scrollTop = -40
    }
  } else {
    // handle case when scrollingElement is null
    console.error("Scrolling element not found");
  }
}
