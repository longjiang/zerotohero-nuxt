<template>
  <div class="pinyin-chart">
    <table>
      <thead>
        <tr>
          <th></th>
          <th v-for="final in finals" :key="final">{{ final }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="initial in initials" :key="initial">
          <th>{{ initial }}</th>
          <td v-for="final in finals" :key="final">
            <router-link 
              v-if="isAllowedCombination(initial, final)"
              :to="`/en/zh/phrase/search/${getExampleWord(initial, final)}`"
            >
              {{ initial + final }} ({{ getExampleWord(initial, final) }})
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PinyinChart',
  data() {
    return {
      initials: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'],
      finals: ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
      exampleWords: {
        'ba': '八', 'bo': '波', 'bi': '比', 'bu': '不',
        'pa': '怕', 'po': '破', 'pi': '皮', 'pu': '普',
        'ma': '妈', 'mo': '摸', 'mi': '米', 'mu': '木',
        'fa': '发', 'fo': '佛', 'fu': '父',
        'da': '大', 'de': '的', 'di': '地', 'du': '度',
        'ta': '他', 'te': '特', 'ti': '体', 'tu': '图',
        'na': '那', 'ne': '呢', 'ni': '你', 'nu': '努',
        'la': '拉', 'le': '了', 'li': '里', 'lu': '路',
        'ga': '嘎', 'ge': '个', 'gu': '古',
        'ka': '卡', 'ke': '可', 'ku': '库',
        'ha': '哈', 'he': '和', 'hu': '湖',
        'ji': '机', 'ju': '句', 'jue': '觉',
        'qi': '起', 'qu': '去', 'que': '缺',
        'xi': '西', 'xu': '需', 'xue': '学',
        'zha': '炸', 'zhe': '这', 'zhi': '只', 'zhu': '住',
        'cha': '茶', 'che': '车', 'chi': '吃', 'chu': '出',
        'sha': '沙', 'she': '社', 'shi': '是', 'shu': '书',
        'ra': '啊', 're': '热', 'ri': '日', 'ru': '如',
        'za': '杂', 'ze': '责', 'zi': '字', 'zu': '组',
        'ca': '擦', 'ce': '侧', 'ci': '此', 'cu': '粗',
        'sa': '萨', 'se': '色', 'si': '四', 'su': '苏',
        'ya': '亚', 'ye': '也', 'yi': '一', 'yu': '与',
        'wa': '瓦', 'wo': '我', 'wu': '无',
        // Add more examples as needed
      }
    }
  },
  methods: {
    isAllowedCombination(initial, final) {
      // This is a simplified rule set. You may need to adjust it for complete accuracy.
      const notAllowed = {
        'j': ['o', 'ong'],
        'q': ['o', 'ong'],
        'x': ['o', 'ong'],
        'y': ['o', 'ong'],
        'w': ['i', 'u', 'ü']
      };

      if (notAllowed[initial] && notAllowed[initial].includes(final)) {
        return false;
      }

      if (['j', 'q', 'x'].includes(initial) && ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'en', 'ang', 'eng'].includes(final)) {
        return false;
      }

      if (['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h'].includes(initial) && ['i', 'ü'].includes(final)) {
        return false;
      }

      return true;
    },
    getExampleWord(initial, final) {
      const combo = initial + final;
      return this.exampleWords[combo] || '?';
    }
  }
}
</script>

<style scoped>
.pinyin-chart {
  font-family: Arial, sans-serif;
}
table {
  border-collapse: collapse;
}
th, td {
  padding: 8px;
  text-align: center;
}
th {
  font-weight: bold;
}
a {
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
</style>