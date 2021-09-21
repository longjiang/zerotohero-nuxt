export default {
  sources: [ '51shucheng', 'wikisource-zho' ],
  async booklists() {
    let booklists = [
      {
        title: 'Classics',
        url: 'https://zh.wikisource.org/wiki/Portal:%E5%85%B8%E7%B1%8D'
      },
      {
        title: 'Poetry',
        url: 'https://zh.wikisource.org/wiki/Portal:%E8%AF%97%E6%AD%8C'
      },
      {
        title: 'Religion and Scripture',
        url: 'https://zh.wikisource.org/wiki/Portal:%E5%AE%97%E6%95%99'
      },
      {
        title: 'History',
        url: 'https://zh.wikisource.org/wiki/Portal:%E5%8F%B2%E6%9B%B8'
      },
    ]
    return booklists
  }
}