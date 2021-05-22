export default {
  modulePromise: undefined,
  load(moduleName, options) {
    if (typeof this.modulePromise !== 'undefined') return this.modulePromise
    else {
      this.modulePromise = new Promise(resolve => {
        import(`@/lib/dictionaries/${moduleName}`).then(module => {
          module.default.load(options).then(loadedModule => {
            resolve(loadedModule);
          })
        })
      })
      return this.modulePromise
    }
  },
}
