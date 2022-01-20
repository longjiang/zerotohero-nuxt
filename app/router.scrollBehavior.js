export default function (to, from, savedPosition) {
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  } else if (from.name === 'dictionary' && to.name === 'dictionary') {
    return '.dictionary-main'
  }else {
    return { x: 0, y: 0 }
  }
}