importScripts('../vendor/papaparse/papaparse.min.js')
importScripts('../vendor/axios/axios.min.js')
importScripts("../vendor/localforage/localforage.js")

let ready = false;
let Dictionary;
let dictionaryInstance;

function kebabToPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function getAllMethodNames(obj) {
  let methods = new Set();
  while (obj = Object.getPrototypeOf(obj)) {
    let keys = Object.getOwnPropertyNames(obj);
    keys.forEach(k => methods.add(k));
  }
  return methods;
}

onmessage = async function (e) {
  const id = e.data[0];
  const method = e.data[1];
  const args = e.data[2];
  if (method === "load") {
    let moduleName = args[0];
    let options = args[1];
    importScripts(`../js/${moduleName}.js?v=2.2.4.2`);

    const className = kebabToPascalCase(moduleName);
    Dictionary = eval(className);

    dictionaryInstance = await Dictionary.load(options);
    ready = true;
    this.postMessage([1, "load", "ready"]);
  } else if (method === "dictionaryMethods") {
    let methods = getAllMethodNames(Dictionary.prototype);
    this.postMessage([id, "dictionaryMethods", methods]);
  } else {
    if (dictionaryInstance && typeof dictionaryInstance[method] !== "undefined") {
      let data = await dictionaryInstance[method](...args);
      this.postMessage([id, method, data]);
    } else {
      this.postMessage([id, method, undefined]);
    }
  }
};
