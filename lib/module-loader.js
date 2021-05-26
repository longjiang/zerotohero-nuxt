export default {
  modulePromise: {},
  hash(modulePath, options) {
    return modulePath + JSON.stringify(options)
  },
  load(modulePath, options = {}) {
    if (typeof this.modulePromise[this.hash(modulePath, options)] !== 'undefined') return this.modulePromise[this.hash(modulePath, options)]
    else {
      this.modulePromise[this.hash(modulePath, options)] = new Promise(resolve => {
        import(`@/lib/${modulePath}`).then(module => {
          module.default.load(options).then(loadedModule => {
            resolve(loadedModule);
          })
        })
      })
      return this.modulePromise[this.hash(modulePath, options)]
    }
  },
}
