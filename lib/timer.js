export default class {
  constructor() {
    this._currentTime = 0 // seconds
    this._onTimeChangeHandlers = []
  }
  play() {
    // setTimeout
  }
  pause() {}
  setCurrentTime(currentTime) {
    this._currentTime = currentTime
    this._onTimeChangeHandlers.forEach(function(handler) {
      handler(this._currentTime)
    })
  }
}
