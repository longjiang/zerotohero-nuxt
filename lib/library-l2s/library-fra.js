export default {
  sources: [ 'wikisource-fra' ],
  async booklists() {
    let booklists = []
    for (let letter of [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]) {
      booklists.push({
        title: letter,
        url: 'https://fr.wikisource.org/wiki/Cat%C3%A9gorie:Auteurs-' + letter
      })
    }
    return booklists
  }
}
