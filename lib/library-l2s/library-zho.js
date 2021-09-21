export default {
  sources: [ '51shucheng', 'wikisource-zho' ],
  async booklists() {
    let booklists = [
      {
        title: 'Classical Novels',
        url: 'https://zh.wikisource.org/wiki/Portal:%E5%B0%8F%E8%AF%B4'
      },
      {
        title: 'Prose',
        url: 'https://zh.wikisource.org/wiki/Portal:%E6%95%A3%E6%96%87'
      },
    ]
    return booklists
  }
}
