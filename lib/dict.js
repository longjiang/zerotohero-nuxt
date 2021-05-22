/* This is an interface to the worker */
import Helper from '@/lib/helper'

export default {
  worker: undefined,
  dictionary: undefined,
  load(options) {
    return new Promise(resolve => {
      import(`@/static/js/${options.dict}`).then(Dictionary => {
        this.dictionary = Dictionary.default.load();
        resolve(this.dictionary);
      })
    })
  },
  exposeDictionary(methods) {
    for (let method of methods) {
      if (method !== 'load') {
        this[method] = function () {
          return new Promise(resolve => {
            if (this.worker) {
              let id = Helper.uniqueId()
              let m1 = e => {
                if (e.data[0] === id && e.data[1] === method) {
                  resolve(e.data[2])
                  this.worker.removeEventListener('message', m1)
                }
              }
              this.worker.postMessage([id, method, [...arguments]])
              this.worker.addEventListener('message', m1)
            } else {
              resolve(this.dictionary[method](...arguments))
            }
          })
        }
      }
    }
  }
}
