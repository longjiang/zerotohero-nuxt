import deepEqual from 'deep-equal'

export default {
  moduleName: '',
  options: {},
  modulePromise: {},
  hash(modulePath, options) {
    return modulePath + JSON.stringify(options)
  },
  load(moduleName, options = {}) {
    if (this.moduleName !== moduleName || !deepEqual(this.options, options)) {
      this.moduleName = moduleName
      this.options = options
      this.modulePromise[this.hash(moduleName, options)] = undefined
    }
    if (typeof this.modulePromise[this.hash(moduleName, options)] !== 'undefined') {
      return this.modulePromise[this.hash(moduleName, options)]
    }
    else {
      this.modulePromise[this.hash(moduleName, options)] = new Promise(resolve => {
        import(`@/lib/${moduleName}`).then(module => {
          module.default.load(options).then(loadedModule => {
            resolve(loadedModule);
          })
        })
      })
      return this.modulePromise[this.hash(moduleName, options)]
    }
  },
}
