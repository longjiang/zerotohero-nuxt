import Config from '@/lib/config'

export default {
  _data: [],
  _json: `${Config.server}/data/dewey/dewey-zho.json.txt`,

  load() {
    return new Promise(resolve => {
      $.getJSON(this._json).done(data => {
        this._data = data
        resolve(this)
      })
    })
  },

  get(code) {
    return this._data.filter(function(row) {
      return row.code === code
    })
  },

  children(code) {
    return this._data.filter(function(row) {
      let regex = new RegExp('^' + code.replace('0', '\\d'))
      if (code === '000') {
        regex = new RegExp('^' + code.replace('00', '0\\d'))
      }
      return row.code.match(regex)
    })
  },

  top() {
    return this._data
      .filter(function(row) {
        return row.code.endsWith('00')
      })
      .map(row => {
        let children = this.children(row.code)
        for (let child of children) {
          child.children = this.children(child.code)
        }
        row.children = children
        return row
      })
  }
}
