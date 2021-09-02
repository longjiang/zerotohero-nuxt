/* This is an interface to the worker */
import Helper from '@/lib/helper'
import deepEqual from 'deep-equal'

export default {
  moduleName: '',
  options: {},
  worker: undefined,
  modulePromise: {},
  hash(moduleName, options) {
    return moduleName + JSON.stringify(options)
  },
  load(moduleName, options) {
    if (this.moduleName !== moduleName || !deepEqual(this.options, options)) {
      this.moduleName = moduleName
      this.options = options
      this.modulePromise[this.hash(moduleName, options)] = undefined
    }
    if (typeof this.modulePromise[this.hash(moduleName, options)] !== 'undefined') return this.modulePromise[this.hash(moduleName, options)]
    else {
      this.modulePromise[this.hash(moduleName, options)] = new Promise(resolve => {
        // worker ready
        if (this.worker) this.worker.terminate() // Only load one dictionary worker at a time!
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
      return this.modulePromise[this.hash(moduleName, options)]
    }
  },
  makeFreeDictAvailable(methods) {
    for (let method of methods) {
      if (method !== 'load') {
        this[method] = function () {
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
