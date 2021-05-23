export default {
  modulePromise: {},
  load(modulePath, options = {}) {
    if (typeof this.modulePromise[modulePath] !== 'undefined') return this.modulePromise[modulePath]
    else {
      this.modulePromise[modulePath] = new Promise(resolve => {
        import(`@/lib/${modulePath}`).then(module => {
          module.default.load(options).then(loadedModule => {
            resolve(loadedModule);
          })
        })
      })
      return this.modulePromise[modulePath]
    }
  },
}
