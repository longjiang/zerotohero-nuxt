export default function (to, from, savedPosition) {
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  } else if (from.name === 'dictionary' && to.name === 'dictionary') {
    return '.dictionary-main'
  } else if (to.name === 'all-media') {
    if (savedPosition) return savedPosition
  } else {
    return { x: 0, y: -40 }
  }
}