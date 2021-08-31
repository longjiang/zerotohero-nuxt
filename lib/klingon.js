export default {
  conv: [
    {
      latin: 'a',
      conscript: '',
      ipa: 'ɑ'
    },
    {
      latin: 'b',
      conscript: '',
      ipa: 'b'
    },
    {
      latin: 'ch',
      conscript: '',
      ipa: 't͡ʃ'
    },
    {
      latin: 'D',
      conscript: '',
      ipa: 'ɖ'
    },
    {
      latin: 'e',
      conscript: '',
      ipa: 'ɛ'
    },
    {
      latin: 'gh',
      conscript: '',
      ipa: 'ɣ'
    },
    {
      latin: 'H',
      conscript: '',
      ipa: 'x'
    },
    {
      latin: 'I',
      conscript: '',
      ipa: 'ɪ'
    },
    {
      latin: 'j',
      conscript: '',
      ipa: 'd͡ʒ'
    },
    {
      latin: 'l',
      conscript: '',
      ipa: 'l'
    },
    {
      latin: 'm',
      conscript: '',
      ipa: 'm'
    },
    {
      latin: 'n',
      conscript: '',
      ipa: 'n'
    },
    {
      latin: 'ng',
      conscript: '',
      ipa: 'ŋ'
    },
    {
      latin: 'o',
      conscript: '',
      ipa: 'o'
    },
    {
      latin: 'p',
      conscript: '',
      ipa: 'pʰ'
    },
    {
      latin: 'q',
      conscript: '',
      ipa: 'qʰ'
    },
    {
      latin: 'Q',
      conscript: '',
      ipa: 'q͡χ'
    },
    {
      latin: 'r',
      conscript: '',
      ipa: 'r'
    },
    {
      latin: 'S',
      conscript: '',
      ipa: 'ʂ'
    },
    {
      latin: 't',
      conscript: '',
      ipa: 'tʰ'
    },
    {
      latin: 'tlh',
      conscript: '',
      ipa: 't͡ɬ'
    },
    {
      latin: 'u',
      conscript: '',
      ipa: 'u'
    },
    {
      latin: 'v',
      conscript: '',
      ipa: 'v'
    },
    {
      latin: 'w',
      conscript: '',
      ipa: 'w'
    },
    {
      latin: 'y',
      conscript: '',
      ipa: 'j'
    },
    {
      latin: 'ʼ',
      conscript: '',
      ipa: 'ʔ'
    },
    {
      latin: 0,
      conscript: '',
      ipa: ''
    },
    {
      latin: 1,
      conscript: '',
      ipa: ''
    },
    {
      latin: 2,
      conscript: '',
      ipa: ''
    },
    {
      latin: 3,
      conscript: '',
      ipa: ''
    },
    {
      latin: 4,
      conscript: '',
      ipa: ''
    },
    {
      latin: 5,
      conscript: '',
      ipa: ''
    },
    {
      latin: 6,
      conscript: '',
      ipa: ''
    },
    {
      latin: 7,
      conscript: '',
      ipa: ''
    },
    {
      latin: 8,
      conscript: '',
      ipa: ''
    },
    {
      latin: 9,
      conscript: '',
      ipa: ''
    }
  ].sort((a, b) => b.latin.length - a.latin.length),
  fixTypos(latin) {
    return latin.replace(/i/g, 'I')
      .replace(/d/g, 'D')
      .replace(/s/g, 'S')
      // .replace(/h/g, 'H') // lower case h is often combined with others.
  },
  latinToConScript(latin) {
    let conscript = this.fixTypos(latin)
    for (let char of this.conv) {
      conscript = conscript.replace(new RegExp(char.latin, 'g'), char.conscript)
    }
    conscript = conscript.replace(/[,;:]/g, '')
    conscript = conscript.replace(/[!?.]/g, '')
    conscript = conscript.replace(/[‘’'“”"]/g, '')
    conscript = conscript.replace(/[-]/g, '')
    return conscript
  },
  latinToIPA(latin) {
    let ipa = this.fixTypos(latin)
    for (let char of this.conv) {
      ipa = ipa.replace(new RegExp(char.latin, 'g'), char.ipa)
    }
    return ipa
  }
}