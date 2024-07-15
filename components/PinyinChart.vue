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
          <TokenizedText 
            v-if="hasExampleWord(initial, final)"
            :text="getExampleWord(initial, final)"
          />
          <s class="non-word" v-else> 
              {{ initial + final }}
          </s>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { examplePinyinWords, pinyinCombinations } from '@/lib/pinyin-chart';

export default {  
  name: 'PinyinChart',
  data() {
    return {
      initials: ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'],
      finals: ['a', 'o', 'e', 'i', 'u', 'ü', 'ai', 'ei', 'ui', 'ao', 'ou', 'iu', 'ie', 'üe', 'er', 'an', 'en', 'in', 'un', 'ün', 'ang', 'eng', 'ing', 'ong'],
      combinations: pinyinCombinations,
      exampleWords: examplePinyinWords,
      hoveredRow: null,
      hoveredColumn: null
    }
  },
  created() {
    this.generateCombinations();
  },
  methods: {
    generateCombinations() {
      this.combinations = this.initials.flatMap(initial => 
        this.finals.map(final => initial + final)
      );

      // Add combinations without initials
      this.finals.forEach(final => {
        this.combinations.push(final);
      });

      // Special cases
      ['yi', 'wu', 'yu'].forEach(special => {
        if (!this.combinations.includes(special)) {
          this.combinations.push(special);
        }
      });
    },
    getExampleWord(initial, final) {
      const combo = initial + final;
      return this.exampleWords[combo] || '';
    },
    hasExampleWord(initial, final) {
      const combo = initial + final;
      return this.exampleWords[combo] !== undefined;
    },
    setHover(rowIndex, colIndex) {
      this.hoveredRow = rowIndex;
      this.hoveredColumn = colIndex;
    },
    resetHover() {
      this.hoveredRow = null;
      this.hoveredColumn = null;
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
.non-word {
  opacity: 0.5;
  font-size: 66.7%;
}
.highlight-row > th,
.highlight-row > td,
.highlight-column {
  background-color: #7c7c7c5c;
}
.highlight-cell {
  background-color: #7c7c7c5c;
}
</style>
