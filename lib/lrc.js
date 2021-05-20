import $ from 'jquery'
import Config from '@/lib/config'

export default {
  getLrcs(word, callback) {
    $.getJSON(
      Config.lrcSearch + word + '/20', // Limit to only 20 songs
      function(results) {
        callback(results)
      }
    )
  },
  delete(lrcID) {
    return new Promise(resolve => {
      $.getJSON(
        `${Config.lrcServer}lrc/delete/${lrcID}`, // Limit to only 20 songs
        function(results) {
          resolve(results)
        }
      )
    })
  },
  getLrcsByArtistOrTitle(artistOrTitle, limit = false) {
    return new Promise(resolve => {
      $.getJSON(
        `${Config.lrcServer}lrc/artistortitlefull/${artistOrTitle}/${limit ? limit : ''}`, // Limit to only 20 songs
        function(results) {
          resolve(results)
        }
      )
    })
  },
  rejectLine(line) {
    var bannedPatterns = [
      'www',
      'LRC',
      ' - ',
      '歌词',
      'QQ',
      '演唱：',
      '编辑：',
      '☆'
    ]
    var rejected = false
    bannedPatterns.forEach(function(pattern) {
      if (line.includes(pattern)) {
        rejected = true
      }
    })
    return rejected
  },
  /**
   *
   * @param {*} index the index of the lrc line
   * @param {*} margin show 'margin' number of lines above and below the first matched line
   * @param {*} lrc the lrc object
   */
  inContext(index, margin, lrc) {
    if (!lrc.matchedLines) return false
    var min = lrc.matchedLines[0] - margin
    var max = lrc.matchedLines[0] + margin
    return index >= min && index <= max
  }
}
