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
      },
      {
        title: 'Children’s Stories',
        url: 'https://librebook.me/collection/roman_vospitaniia'
      },
      {
        title: 'Children’s Literature',
        url: 'https://litnet.com/ru/top/detskaya-literatura'
      },
      {
        title: 'Business and Economics',
        url: 'https://librebook.me/collection/ocharovanie_kapitala'
      },
      {
        title: 'Detective',
        url: 'https://litnet.com/ru/top/detektivy'
      },
      {
        title: 'Fantacy (Фзнтези)',
        url: 'https://litnet.com/ru/top/fentezi'
      },
      {
        title: 'Fantacy (Фантастика)',
        url: 'https://litnet.com/ru/top/fantastika'
      },
      {
        title: 'Historical Novel',
        url: 'https://litnet.com/ru/top/molodejnaya-proza'
      },
      {
        title: 'Literature',
        url: 'https://librebook.me/collection/maslenica_v_russkoi_literature'
      },
      {
        title: 'Music',
        url: 'https://librebook.me/collection/muzyka_nas_sviazala'
      },
      {
        title: 'Mystery',
        url: 'https://litnet.com/ru/top/mistikaujasy'
      },
      {
        title: 'Prose',
        url:
          'https://librebook.me/collection/popadancy_v_drugie_miry__sovremennaia_russkaia_proza'
      },
      {
        title: 'Romance',
        url: 'https://litnet.com/ru/top/lyubovnye-romany'
      },
      {
        title: 'Thriller',
        url: 'https://litnet.com/ru/top/trillery'
      },
      {
        title: 'Top on Litnet',
        url: 'https://litnet.com/ru/top/all'
      },
      {
        title: 'Translated Foreign Literature',
        url: 'https://librebook.me/collection/a_ne_spet_li_nam_pesniu_'
      }
    ]
    return booklists
  }
}
