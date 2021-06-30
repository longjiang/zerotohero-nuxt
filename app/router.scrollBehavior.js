export default function (to, from, savedPosition) {
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  }
  if (from.name === to.name && ['youtube-search'].includes(to.name)) {
    return false
  }
  if ((from.name === to.name || (['dictionary', 'compare'].includes(from.name) && ['dictionary', 'compare'].includes(to.name))) && !from.path.endsWith('youtube/browse')) {
    return {
      selector: '.main'
    }
  } else {
    return { x: 0, y: 0 }
  }
}