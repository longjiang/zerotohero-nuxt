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
  </div>
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
      exampleWords: examplePinyinWords
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
.non-word {
  opacity: 0.5;
  font-size: 66.7%;
}
</style>