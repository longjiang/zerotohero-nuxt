import { uniqueId } from "./utils";

function oneLevelDeepEqual(objA, objB) {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
      if (objA[key] !== objB[key]) return false;
  }
  return true;
}

function twoLevelsDeepEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
          // If both properties are objects, check equality one level deep.
          if (!oneLevelDeepEqual(obj1[key], obj2[key])) return false;
      } else if (obj1[key] !== obj2[key]) {
          // If properties are not equal, return false.
          return false;
      }
  }
  return true;
}

function hashObject(obj) {
  const keys = Object.keys(obj).sort();
  const values = keys.map((key) => obj[key]);
  return JSON.stringify({ keys, values });
}

export default {
  moduleName: "",
  options: {},
  worker: undefined,
  modulePromise: {},
  hash(moduleName, options) {
    return `${moduleName}_${hashObject(options)}`;
  },
  load(moduleName, options) {
    let nameMatch = this.moduleName === moduleName;
    let optionsMatch = twoLevelsDeepEqual(this.options, options); // Use two levels so we can detect is l1.code and l2.code is any different
    if (!nameMatch || !optionsMatch) {
      this.moduleName = moduleName;
      this.options = options;
      this.modulePromise[this.hash(moduleName, options)] = undefined;
    }
    if (
      typeof this.modulePromise[this.hash(moduleName, options)] !== "undefined"
    ) {
      return this.modulePromise[this.hash(moduleName, options)];
    } else {
      this.modulePromise[this.hash(moduleName, options)] = new Promise(
        (resolve) => {
          // worker ready
          if (this.worker) this.worker.terminate(); // Only load one dictionary worker at a time!
          this.worker = new Worker(`/workers/dict-worker.js`);
          this.worker.postMessage([3, "load", [moduleName, options]]);
          this.worker.addEventListener("message", (e) => {
            if (e.data[1] === "load" && e.data[2] === "ready") {
              this.worker.postMessage([1, "dictionaryMethods"]);
            }
            if (e.data[1] === "dictionaryMethods") {
              this.makeDictionaryAvailable(e.data[2]);
              resolve(this);
            }
          });
        }
      );
      return this.modulePromise[this.hash(moduleName, options)];
    }
  },
  makeDictionaryAvailable(methods) {
    for (let method of methods) {
      if (method !== "load") {
        this[method] = function () {
          return new Promise((resolve) => {
            let id = uniqueId();
            let m1 = (e) => {
              if (e.data[0] === id && e.data[1] === method) {
                resolve(e.data[2]);
                this.worker.removeEventListener("message", m1);
              }
            };
            this.worker.postMessage([id, method, [...arguments]]);
            this.worker.addEventListener("message", m1);
          });
        };
      }
    }
  },
};
