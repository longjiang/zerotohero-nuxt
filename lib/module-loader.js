/* This is an interface to the worker */
export default {
  modulePromise: undefined,
  load(moduleName) {
    if (typeof this.modulePromise !== 'undefined') return this.modulePromise
    else {
      this.modulePromise = new Promise(resolve => {
        import(`@/static/js/${moduleName}`).then(module => {
          console.log("LOADING MODULE DATA")
          module.default.load().then(loadedModule => {
            resolve(loadedModule);
          })
        })
      })
      return this.modulePromise
    }
  },
}
