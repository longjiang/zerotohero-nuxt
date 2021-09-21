export default {
  sources: [ 'librebook', 'libru', 'litnet-rus', 'wikisource-rus' ],
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
