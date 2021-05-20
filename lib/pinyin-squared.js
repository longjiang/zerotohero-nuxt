export default {
  imgPath: '/img/pinyin-squared/',
  template: `
  <div class="block">
    <div class="pinyin"></div>
    <div class="character">
      <img src="" alt="" class="initial">
      <img src="" alt="" class="final">
      <img src="" alt="" class="tone">
    </div>
  </div>`,

  preprocess(text) {
    let blocksOrStrings = []
    text = text.toLowerCase()
    text = text.replace(/([^a-zü`0-9]+)/g, 'SPLITDELIMITER$1SPLITDELIMITER')
    var words = text.split('SPLITDELIMITER')
    for (var i = 0; i < words.length; i++) {
      var word = words[i]
      word = word.replace(/([aeiouü`])([^aeiouü`n0-9])/g, '$1SPLITDELIMITER$2')
      word = word.replace(/(\d+)/g, '$1SPLITDELIMITER')
      word = word.split('SPLITDELIMITER')
      if (word[word.length - 1] == '') {
        word.pop()
      }
      if (word.length > 0 && /^[a-zü`]/.test(word[0])) {
        for (var j = 0; j < word.length; j++) {
          blocksOrStrings.push(this.separateInitialFromFinal(word[j]))
        }
      } else {
        if (word[0] !== undefined) {
          blocksOrStrings.push(word[0].replace('\n', '<br>'))
        }
      }
    }
    return blocksOrStrings
  },

  convert(text, outputElement) {
    $(outputElement).html('')
    let blocksOrStrings = this.preprocess(text)
    for (let blockOrString of blocksOrStrings) {
      if (typeof blockOrString === 'object') {
        let block = blockOrString
        $(outputElement).append(
          this.makeCharacter(block.initial, block.final, block.tone)
        )
      } else {
        let string = blockOrString
        $(outputElement).append(string)
      }
    }
  },

  makeChartIfExists() {
    $('.chart').each(function() {
      let tone = $(this).attr('data-tone')
      $(this)
        .find('td')
        .each(function() {
          var pinyin = $(this)
            .find('.pinyin')
            .text()
          if (/^[a-zü`]/.test(pinyin) !== false) {
            var character = this.separateInitialFromFinal(pinyin)
            var block = this.makeCharacter(
              character.initial,
              character.final,
              tone
            )
            $(this).append(block)
          }
        })
    })
  },

  separateInitialFromFinal(character) {
    character = character.replace('wai', 'wuai')
    character = character.replace('wei', 'wui')
    character = character.replace('wan', 'wuan')
    character = character.replace('wen', 'wun')
    character = character.replace('wung', 'weng')
    character = character.replace('wang', 'wuang')
    character = character.replace('shi', 'shoe')
    character = character.replace('chi', 'choe')
    character = character.replace('zhi', 'zhoe')
    character = character.replace('ri', 'roe')
    character = character.replace('zi', 'zeu')
    character = character.replace('ci', 'ceu')
    character = character.replace('si', 'seu')
    character = character.replace('nue', 'nüe')
    character = character.replace('lue', 'lüe')
    character = character.replace('yu', 'yü')
    character = character.replace('yue', 'yüe')
    character = character.replace('yuan', 'yüan')
    character = character.replace('yun', 'yün')
    character = character.replace('ju', 'jü')
    character = character.replace('jue', 'jüe')
    character = character.replace('juan', 'jüan')
    character = character.replace('jun', 'jün')
    character = character.replace('qu', 'qü')
    character = character.replace('que', 'qüe')
    character = character.replace('quan', 'qüan')
    character = character.replace('qun', 'qün')
    character = character.replace('xu', 'xü')
    character = character.replace('xue', 'xüe')
    character = character.replace('xuan', 'xüan')
    character = character.replace('xun', 'xün')
    character = character.replace(/([aeiouü]+)/, 'SPLITDELIMITER$1', 1)
    character = character.replace(/([0-9])/, 'SPLITDELIMITER$1', 1)
    character = character.split('SPLITDELIMITER')
    var initial = character[0] || '`'
    var final = character[1]
    var tone = character[2]
    return { initial: initial, final: final, tone: tone, pinyin: character }
  },

  makeCharacter(initial, final, tone) {
    var char = $(this.template)
    if (tone === undefined) {
      tone = ''
    }
    char.find('.pinyin').text(initial + final + tone)
    if (initial !== undefined && initial !== '') {
      char.find('.initial').attr('src', this.imgPath + initial + '.svg')
    } else {
      char.find('.initial').remove()
    }
    if (final !== undefined && final !== '') {
      char.find('.final').attr('src', this.imgPath + final + '.svg')
    } else {
      char.find('.final').remove()
    }
    if (tone !== undefined && tone !== '') {
      char.find('.tone').attr('src', this.imgPath + 'tone-' + tone + '.svg')
    } else {
      char.find('.tone').remove()
    }
    return char.get()
  }
}
