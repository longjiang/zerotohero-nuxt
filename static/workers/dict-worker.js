importScripts('../vendor/papaparse/papaparse.min.js')
importScripts('../vendor/axios/axios.min.js')
importScripts("../vendor/localforage/localforage.js")

let ready = false;
let dictionaryInstance;

onmessage = async function (e) {
  const id = e.data[0];
  const method = e.data[1];
  const args = e.data[2];
  if (method === "load") {
    let moduleName = args[0];
    let options = args[1];
    importScripts(`../js/${moduleName}.js?v=2.2.4.2`);

    dictionaryInstance = new Dictionary(options);
    ready = true;
    this.postMessage([1, "load", "ready"]);
  } else if (method === "dictionaryMethods") {
    this.postMessage([id, "dictionaryMethods", Object.getOwnPropertyNames(Dictionary.prototype)]);
  } else {
    if (typeof dictionaryInstance[method] !== "undefined") {
      let data = await dictionaryInstance[method](...args);
      this.postMessage([id, method, data]);
    } else {
      this.postMessage([id, method, undefined]);
    }
  }
};
