importScripts('../vendor/papaparse/papaparse.min.js')
importScripts('../vendor/axios/axios.min.js')


let ready = false

onmessage = async function(e) {
  const id = e.data[0]
  const method = e.data[1]
  const args = e.data[2]
  if (method === 'load') {
    let moduleName = args[0]
    let options = args[1]
    importScripts(`../js/${moduleName}.js?v=2.2.4`)
    Dictionary.load(options).then(() => {
      ready = true
      this.postMessage([1, 'load', 'ready'])
    })
  } else if (method === 'freedictMethods') {
    this.postMessage([id, 'freedictMethods', Object.keys(Dictionary)])
  } else {
    let data = await Dictionary[method](...args)
    this.postMessage([id, method, data])
  }
}

