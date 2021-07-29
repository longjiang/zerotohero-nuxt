export default function (to, from, savedPosition) {
  if (to.hash && to.hash !== '#') {
    return {
      selector: to.hash
    }
  } else {
    return { x: 0, y: 0 }
  }
}