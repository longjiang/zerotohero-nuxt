
import Character from './character.js'
import { animatedSvgUrl } from '@/lib/utils'
import axios from 'axios'

/**
 * The library associated with the character information in data/dictionary.txt provided by Make Me a Hanzi (https://github.com/skishore/makemeahanzi) project.
 */
export default {
  _hanziData: [],
  description: {
    '⿰': {
      name: '左右结构',
      children: ['左边的部分', '右边的部分']
    },
    '⿱': {
      name: '上下结构',
      children: ['上边的部分', '下边的部分']
    },
    '⿲': {
      name: '左中右结构',
      children: ['左边的部分', '中间的部分', '右边的部分']
    },
    '⿳': {
      name: '上中下结构',
      children: ['上边的部分', '中间的部分', '下边的部分']
    },
    '⿹': {
      name: '半包围结构',
      children: ['右边包围的部分', '里边的部分']
    },
    '⿸': {
      name: '半包围结构',
      children: ['左边包围的部分', '里边的部分']
    },
    '⿺': {
      name: '包围结构',
      children: ['左下方包围的部分', '上边托着的部分']
    },
    '⿵': {
      name: '上三包围结构',
      children: ['上边包围的部分', '里边的部分']
    },
    '⿶': {
      name: '下三包围结构',
      children: ['下边包围的部分', '里边的部分']
    },
    '⿷': {
      name: '左三包围结构',
      children: ['左边包围的部分', '里边的部分']
    },
    '⿴': {
      name: '全包围结构',
      children: ['外面包围的部分', '里边的部分']
    },
    '⿻': {
      name: '镶嵌结构',
      children: ['其中一部分', '另一部分']
    }
  },
  parts: [
    {
      part: '一',
      name: '横'
    },
    {
      part: '丨',
      name: '竖'
    },
    {
      part: '丶',
      name: '点'
    },
    {
      part: '丿',
      name: '撇'
    },
    {
      part: '乙',
      name: '横折弯钩'
    },
    {
      part: '乚',
      name: '竖弯钩'
    },
    {
      part: '乛',
      name: '横钩'
    },
    {
      part: '亅',
      name: '竖钩'
    },
    {
      part: '冫',
      name: '两点水'
    },
    {
      part: '冖',
      name: '秃宝盖'
    },
    {
      part: '十',
      name: '十字儿'
    },
    {
      part: '讠',
      name: '言字旁'
    },
    {
      part: '刂',
      name: '立刀旁'
    },
    {
      part: '八',
      name: '八字旁'
    },
    {
      part: '人',
      name: '人字头'
    },
    {
      part: '厂',
      name: '厂字旁'
    },
    {
      part: '力',
      name: '力字旁'
    },
    {
      part: '又',
      name: '又字旁'
    },
    {
      part: '亻',
      name: '单人旁'
    },
    {
      part: '卩',
      name: '单耳刀'
    },
    {
      part: '阝',
      name: '双耳刀'
    },
    {
      part: '廴',
      name: '建字旁'
    },
    {
      part: '勹',
      name: '包字头'
    },
    {
      part: '厶',
      name: '私字儿'
    },
    {
      part: '匚',
      name: '三框儿'
    },
    {
      part: '冂',
      name: '同字框'
    },
    {
      part: '氵',
      name: '三点水'
    },
    {
      part: '彡',
      name: '三撇儿'
    },
    {
      part: '忄',
      name: '竖心旁'
    },
    {
      part: '广',
      name: '广字旁'
    },
    {
      part: '夕',
      name: '夕字旁'
    },
    {
      part: '辶',
      name: '走之旁'
    },
    {
      part: '寸',
      name: '寸字旁'
    },
    {
      part: '扌',
      name: '提手旁'
    },
    {
      part: '土',
      name: '提土旁'
    },
    {
      part: '艹',
      name: '草字头'
    },
    {
      part: '大',
      name: '大字头'
    },
    {
      part: '小',
      name: '小字头'
    },
    {
      part: '口',
      name: '口字旁'
    },
    {
      part: '囗',
      name: '方框儿'
    },
    {
      part: '门',
      name: '门字框'
    },
    {
      part: '巾',
      name: '巾字旁'
    },
    {
      part: '山',
      name: '山字旁'
    },
    {
      part: '彳',
      name: '双人旁'
    },
    {
      part: '犭',
      name: '反犬旁'
    },
    {
      part: '饣',
      name: '食字旁'
    },
    {
      part: '尸',
      name: '尸字头'
    },
    {
      part: '弓',
      name: '弓字旁'
    },
    {
      part: '孑',
      name: '子字旁'
    },
    {
      part: '女',
      name: '女字旁'
    },
    {
      part: '纟',
      name: '绞丝旁'
    },
    {
      part: '马',
      name: '马字旁'
    },
    {
      part: '灬',
      name: '四点底'
    },
    {
      part: '方',
      name: '方字旁'
    },
    {
      part: '手',
      name: '手字旁'
    },
    {
      part: '欠',
      name: '欠字旁'
    },
    {
      part: '火',
      name: '火字旁'
    },
    {
      part: '心',
      name: '心字旁'
    },
    {
      part: '止',
      name: '止字旁'
    },
    {
      part: '户',
      name: '户字旁'
    },
    {
      part: '礻',
      name: '示字旁'
    },
    {
      part: '王',
      name: '王字旁'
    },
    {
      part: '木',
      name: '木字旁'
    },
    {
      part: '车',
      name: '车字旁'
    },
    {
      part: '日',
      name: '日字旁'
    },
    {
      part: '曰',
      name: '冒字头'
    },
    {
      part: '父',
      name: '父字头'
    },
    {
      part: '牜',
      name: '牛字旁'
    },
    {
      part: '攵',
      name: '反文旁'
    },
    {
      part: '斤',
      name: '斤字头'
    },
    {
      part: '爫',
      name: '爪字头'
    },
    {
      part: '⺼',
      name: '肉月旁'
    },
    {
      part: '月',
      name: '月字旁'
    },
    {
      part: '穴',
      name: '穴宝盖'
    },
    {
      part: '立',
      name: '立字旁'
    },
    {
      part: '目',
      name: '目字旁'
    },
    {
      part: '田',
      name: '田字旁'
    },
    {
      part: '石',
      name: '石字旁'
    },
    {
      part: '矢',
      name: '矢字旁'
    },
    {
      part: '疒',
      name: '病字旁'
    },
    {
      part: '钅',
      name: '金字旁'
    },
    {
      part: '罒',
      name: '皿字头'
    },
    {
      part: '皿',
      name: '皿字底'
    },
    {
      part: '禾',
      name: '禾木旁'
    },
    {
      part: '白',
      name: '白字旁'
    },
    {
      part: '鸟',
      name: '鸟字旁'
    },
    {
      part: '米',
      name: '米字旁'
    },
    {
      part: '西',
      name: '西字头'
    },
    {
      part: '页',
      name: '页字旁'
    },
    {
      part: '舌',
      name: '舌字旁'
    },
    {
      part: '缶',
      name: '缶字旁'
    },
    {
      part: '耳',
      name: '耳字旁'
    },
    {
      part: '虫',
      name: '虫字旁'
    },
    {
      part: '虍',
      name: '虎字头'
    },
    {
      part: '竹',
      name: '竹字头'
    },
    {
      part: '舟',
      name: '舟字旁'
    },
    {
      part: '走',
      name: '走字旁'
    },
    {
      part: '足',
      name: '足字旁'
    },
    {
      part: '角',
      name: '角字旁'
    },
    {
      part: '身',
      name: '身字旁'
    },
    {
      part: '鱼',
      name: '鱼字旁'
    },
    {
      part: '隹',
      name: '隹字旁'
    },
    {
      part: '雨',
      name: '雨字头'
    },
    {
      part: '齿',
      name: '齿字旁'
    },
    {
      part: '革',
      name: '革字旁'
    },
    {
      part: '骨',
      name: '骨字旁'
    },
    {
      part: '音',
      name: '音字旁'
    },
    {
      part: '宀',
      name: '宝盖头'
    }
  ],
  types: {
    ideographic: '会意字',
    pictographic: '象形字',
    pictophonetic: '形声字'
  },
  _makeMeAHanziDictionaryTxt: 'https://server.chinesezerotohero.com/data/hanzi/hanzi.json.txt',

  async load() {
    let response = await axios.get(this._makeMeAHanziDictionaryTxt)
    this._hanziData = response.data
    return this
  },

  lookup: function(char) {
    let row = this.lookupShallow(char)
    if (row) {
      return new Character(row)
    }
  },

  lookupShallow: function(char) {
    return this._hanziData.find(function(row) {
      return row.character === char
    })
  },

  chineseOnly: function(string) {
    return string.replace(/[\u4E00-\u9FFF]+/, '') === ''
  },

  searchByRadical: function(radical) {
    var rows = []
    var hanzi = this
    // Filter out description characters and "？ - other elements"
    if (!'⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻？'.includes(radical)) {
      rows = hanzi._hanziData.filter(function(row) {
        return (
          row.decomposition.includes(radical) || row.character.includes(radical)
        )
      })
    }
    return rows
  },

  getCharactersInWord: function(word) {
    var characters = []
    for (let char of word.split('')) {
      var character = this.lookup(char)
      if (character) {
        // new character
        characters.push(character)
      }
    }
    return characters
  },

  animatedSvgUrl: function(char) {
    var charCode = char.charCodeAt(0)
    return animatedSvgUrl + charCode + '.svg'
  },

  animatedSvgLink: function(char) {
    return (
      '<a href="' +
      this.animatedSvgUrl(char) +
      '" target="_blank">' +
      char +
      '</a>'
    )
  },

  isIdeographicDescCharacter(char) {
    if (char.replace(/[\u2ff0-\u2ffe]/, '') === '') {
      return true
    } else {
      return false
    }
  }
}
