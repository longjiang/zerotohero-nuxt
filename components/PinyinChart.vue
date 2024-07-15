<template>
  <table @mouseleave="resetHover" class="pinyin-chart">
    <thead>
      <tr>
        <th></th>
        <th 
          v-for="(final, index) in finals" 
          :key="final" 
          :class="{ 'highlight-column': index === hoveredColumn }"
        >
          {{ final }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr 
        v-for="(initial, rowIndex) in initials" 
        :key="initial"
        :class="{ 'highlight-row': rowIndex === hoveredRow }"
      >
        <th>{{ initial }}</th>
        <td 
          v-for="(final, colIndex) in finals" 
          :key="final"
          @mouseenter="setHover(rowIndex, colIndex)"
          :class="{
            'highlight-row': rowIndex === hoveredRow,
            'highlight-column': colIndex === hoveredColumn,
            'highlight-cell': rowIndex === hoveredRow && colIndex === hoveredColumn
          }"
        >
          <template v-if="pinyinToCharacter[pinyinMapping[initial + final]] !== undefined">
            <TokenizedText :text="pinyinToCharacter[pinyinMapping[initial + final]]" />
          </template>
          <s v-else>
            {{ pinyinMapping[initial + final] }}
          </s>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { pinyinMapping, pinyinToCharacter } from '~/lib/pinyin-chart';

export default {  
  name: 'PinyinChart',
  data() {
    return {
      pinyinMapping,
      pinyinToCharacter,
      initials: ['', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'z', 'c', 's', 'zh', 'ch', 'sh', 'r'],
      finals: [
        'i', 'a', 'ai', 'an', 'ang', 'ao', 'e', 'ei', 'en', 'eng', 'er',
        'ia', 'ian', 'iang', 'iao', 'ie', 'in', 'ing', 'iong', 'iou',
        'o', 'ong', 'ou', 'u', 'ua', 'uai', 'uan', 'uang', 'uei', 'uen',
        'ueng', 'uo', 'ü', 'üan', 'üe', 'ün'
      ],
      hoveredRow: null,
      hoveredColumn: null
    }
  },
  mounted() {
    console.log(this.generateCombinations());
  },
  methods: {
    setHover(rowIndex, colIndex) {
      this.hoveredRow = rowIndex;
      this.hoveredColumn = colIndex;
    },
    resetHover() {
      this.hoveredRow = null;
      this.hoveredColumn = null;
    },
    generateCombinations() {
      const combinations = [];
      for (const initial of this.initials) {
        for (const final of this.finals) {
          combinations.push(pinyinMapping[initial + final]);
        }
      }
      return combinations;
    }
  }
}
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th, td {
  padding: 8px;
  text-align: center;
  transition: background-color 0.3s ease;
}
th {
  font-weight: bold;
}
.highlight-row > th,
.highlight-row > td,
.highlight-column {
  background-color: #7c7c7c5c;
}
.highlight-cell {
  background-color: #7c7c7c5c;
}
s {
  text-decoration: line-through;
  color: #888;
  font-size: 66.67%;
}
</style>