'use strict';

let all = {}
let f = async () => {
  for (let key of ['adj',
    'adv',
    'art',
    'con',
    'nom',
    'ono',
    'pre',
    'ver',
    'pro']) {
    let lexi = await axios.get(`./${key}.json`)
    all[key] = { lexi }
  }
}
f()


module.exports = {
  all
}
