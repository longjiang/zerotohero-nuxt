importScripts('../vendor/papaparse/papaparse.min.js')


let ready = false

onmessage = function(e) {
  const id = e.data[0]
  const method = e.data[1]
  const args = e.data[2]
  if (method === 'load') {
    let options = args[0]
    importScripts(`../js/${options.dict}.js?v=${Date.now()}`)
    Dictionary.load(options).then(() => {
      ready = true
      this.postMessage([1, 'load', 'ready'])
    })
  } else if (method === 'freedictMethods') {
    this.postMessage([id, 'freedictMethods', Object.keys(Dictionary)])
  } else {
    let data = Dictionary[method](...args)
    this.postMessage([id, method, data])
  }
}

