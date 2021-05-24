/* This is an interface to the worker */
import Helper from '@/lib/helper'

export default {
  worker: undefined,
  modulePromise: {},
  load(moduleName, options)  {
    if (typeof this.modulePromise[moduleName] !== 'undefined') return this.modulePromise[moduleName]
    else {
      this.modulePromise[moduleName] = new Promise(resolve => {
        // worker ready
        this.worker = new Worker(`/workers/dict-worker.js?v=${Date.now()}`)
        this.worker.postMessage([3, 'load', [moduleName, options]])
        this.worker.addEventListener('message', e => {
          if (e.data[1] === 'load' && e.data[2] === 'ready') {
            this.worker.postMessage([1, 'freedictMethods'])
          }
          if (e.data[1] === 'freedictMethods') {
            this.makeFreeDictAvailable(e.data[2])
            resolve(this)
          }
        })
      })
      return this.modulePromise[moduleName]
    }
  },
  makeFreeDictAvailable(methods) {
    for (let method of methods) {
      if (method !== 'load') {
        this[method] = function() {
          return new Promise(resolve => {
            let id = Helper.uniqueId()
            let m1 = e => {
              if (e.data[0] === id && e.data[1] === method) {
                resolve(e.data[2])
                this.worker.removeEventListener('message', m1)
              }
            }
            this.worker.postMessage([id, method, [...arguments]])
            this.worker.addEventListener('message', m1)
          })
        }
      }
    }
  }
}
