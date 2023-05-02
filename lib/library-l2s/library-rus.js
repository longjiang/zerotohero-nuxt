export default {
  sources: [ 'wikisource-rus' ],
  async booklists() {
    let booklists = [
      {
        title: 'Allegories',
        url: 'https://ru.wikisource.org/wiki/Категория:Аллегории'
      },
      {
        title: 'Aphorisms',
        url: 'https://ru.wikisource.org/wiki/Категория:Афоризмы'
      }
    ]
    return booklists
  }
}
