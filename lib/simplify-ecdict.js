export default {
  file: undefined,
  simplify() {
    let server = 'https://server.chinesezerotohero.com/'
    this.file = `${server}data/ecdict/ecdict.csv.txt`
    console.log('Simplifying ...')
    return new Promise(resolve => {
      Papa.parse(this.file, {
        download: true,
        header: true,
        complete: results => {
          let words = []
          for (let index in results.data) {
            let row = results.data[index]
            if (row.frq > 0) {
              words.push({
                word: row.word,
                phonetic: row.phonetic,
                translation: row.translation,
                pos: row.pos,
                frq: frq,
                bnc: bnc
              })
            }
          }
          console.log('Simplified, generating CSV...')
          window.csv = Papa.unparse(words)
          console.log(
            'CSV ready. Type `copy(csv)` in the console to copy to clipboard.'
          )
          resolve()
        }
      })
    })
  }
}