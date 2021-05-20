export default {
  sources: [ 'wikisource-deu' ],
  async booklists() {
    return [
      {
        title: 'Browse Authors',
        url: 'https://de.wikisource.org/wiki/Liste_der_Autoren'
      }
    ]
  }
}
