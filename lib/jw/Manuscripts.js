import config from './Config'
import Wikipedia from './Wikipedia'
import $ from 'jquery'

export default class {
  /**
   * Determines if an html string is a list of manuscript references, an example:
   * “Make me as one of your hired men,” אBDSyh; P75AWVgSyp,s omit.
   *
   * @param {*} html
   */
  static isRef (html) {
    let hints = ['Vg', 'א', '<sup>', 'LXX']
    let matched = false
    for (let hint of hints) {
      if (html.indexOf(hint) !== -1) {
        matched = true
      }
    }
    return matched
  }

  /**
   * Create a table from a list of renderings with references
   * @param {*} renderings
   * @param {*} id
   */
  static renderingTable (renderings, id) {
    let wrapper = $('#' + id)[0]
    if (renderings.length > 0) {
      $(wrapper).load(config.templates_url + 'renderings.html', function () {
        let table = new Vue({
          el: '#' + id,
          data: {
            renderings: []
          },
          updated: function () {
            this.$nextTick(function () {
              for (let rendering of this.renderings) {
                for (let ref of rendering.refs) {
                  if (!ref.image) {
                    let wikipedia = new Wikipedia()
                    wikipedia.getFirstImage(ref.wikipedia, function (image) {
                      ref.image = $(image).attr('src')
                    })
                  }
                }
              }
            })
          }
        })
        table.renderings = renderings
      })
    }
  }

  static lookupSymbolTable (refstring, symbolTable) {
    let refs = []
    for (let row of symbolTable) {
      let matches = refstring.match(row.symbol)
      if (matches !== null) {
        if (!row.wikipedia && !row.wol) {
          matches = row.symbol.match(/P<sup>(\d+)<\/sup>/)
          if (matches) {
            row.wikipedia = 'Papyrus_' + matches[1]
            if (!row.image) {
              row.image = ''
            }
          } else {
            row.wikipedia = row.name.replace(/ /g, '_')
            if (!row.image) {
              row.image = ''
            }
          }
        }
        if (row.wol) {
          row.url = row.wol
          row.source = 'wol'
        } else {
          row.url = 'https://en.wikipedia.org/wiki/' + row.wikipedia
          row.source = 'wikipedia'
        }
        refs.push(row)
      }
    }
    return refs
  }

  /**
   * Takes an html string with manuscript reference note like this:
   * “Make me as one of your hired men,” אBDSyh; P75AWVgSy<sup>p,s</sup> omit.
   * And turn it into a machine-readable array of renderings and references:
   * renderings = [{
   *     text: "Make me as one of your hired men",
   *     refString: אBDSyh
   *   },{
   *     text: "",
   *     refString: P75AWVgSy<sup>p/sup>Sy<sup>s</sup>
   *   }
   * ]}
   * @param {*} html
   */
  static parseManuscriptReferenceString (html) {
    html = html.replace('Or, ', '')
    html = html.replace(/<wbr>/g, '')
    html = html.replace(/\. See.*/, '')
    let renderingStrings = html.split('; ')
    let renderings = []
    for (let renderingString of renderingStrings) {
      renderingString = renderingString.replace(/^<\/em>/, '')
      let matches = renderingString.match(/(.*) “(.*)”/)
      if (matches) {
        renderings.push({
          renderingString: renderingString,
          refString: this.splitSuperscripts(matches[1]), // VgSyh,p
          text: matches[2] // “Joseph.”
        })
      } else {
        let matches = renderingString.match(/“(.*),” (.*)/)
        if (matches) {
          renderings.push({
            renderingString: renderingString,
            refString: this.splitSuperscripts(matches[2]), // VgSyh,p
            text: matches[1] // “Joseph,”
          })
        } else {
          let matches = renderingString.match(/(.*)(omit)/)
          if (matches) {
            renderings.push({
              renderingString: renderingString,
              refString: this.splitSuperscripts(matches[1]), // VgSyh,p
              text: '(omit)' // omit
            })
          } else {
            let matches = renderingString.match(/(.*), (.*)/)
            if (matches && this.isRef(matches[1])) {
              renderings.push({
                renderingString: renderingString,
                refString: this.splitSuperscripts(matches[1]), // J<sup>17,18,22</sup>(Heb.)
                text: matches[2] // <em>naph·shohʹ </em>(from <em>neʹphesh</em>).
              })
            } else {
              renderings.push({
                renderingString: renderingString,
                refString: this.splitSuperscripts(renderingString), // J<sup>17,18,22</sup>(Heb.)
                text: '' // <em>naph·shohʹ </em>(from <em>neʹphesh</em>).
              })
            }
          }
        }
      }
    }
    return renderings
  }

  // Not used, we have json file now
  static convertSymbolTable (callback) {
    let symbols = $('<div />')[0]
    $(symbols).load(config.data_url + 'textual-symbols.html', function () {
      let symbolTable = []
      $(symbols).find('p').each(function () {
        let symbol = $(this).find('.symbol')[0]
        let description = $(this).clone()[0]
        $(description).find('.symbol').remove()
        let array = $(description).text().split(', ')
        symbolTable.push({
          symbol: $(symbol).html(),
          description: $(description).html(),
          name: array[0],
          language: array[1],
          time: array[2],
          location: array[3],
          hs: array[4],
          gs: array[5]
        })
      })
      callback(symbolTable)
    })
  }

  /**
   * Split J<sup>12,13</sup> into J<sup>12</sup>,J<sup>13</sup>
   * @param {*} refString
   */
  static splitSuperscripts (refString) {
    return refString.replace(/(J|LXX|Sy|T|Vg)<sup>(.*)<\/sup>/g, function (match, p1, p2) {
      let refName = p1
      let sups = p2.split(',')
      let results = []
      for (let sup of sups) {
        results.push(refName + '<sup>' + sup + '</sup>')
      }
      return results.join('')
    })
  }

  /**
   * Iterates through an array of footnotes, each with an array of renderings.
   * Searches through the symbol table (json) and find matches in each rendering.refString
   * @param {*} footnotes
   * @param {*} callback
   */
  static async loadSymbolTable () {
    let symbolTable =  await $.getJSON('/data/textual-symbols.json')
    return symbolTable
  }
}
