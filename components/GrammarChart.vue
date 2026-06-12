<!-- /components/GrammarChart.vue -->
<template>
  <div>
    <SocialHead v-if="grammar && grammar.length > 0" :title="`${$l2.name} Grammar Cheatsheet | Language Player`" :description="`${grammar
      .slice(0, 10)
      .map((g) => g.structure + ' (' + g.english + ')')
      .join(' | ')}`" />
      
    <div class="d-flex" style="margin: 0 auto 3rem auto" v-if="grammar && grammar.length > 0" v-cloak>
      <div class="input-group" style="flex: 1">
        <input v-model="search" type="text" class="form-control lookup" :placeholder="$t('Filter by keywords')" />
        <div class="input-group-append">
          <button class="btn btn-success lookup-button" type="button">
            <i class="glyphicon glyphicon-filter"></i>
            {{ $t('Filter') }}
          </button>
        </div>
      </div>
      <a :href="csvSource" class="ml-2 btn btn-success" :download="`Language Player ${$l2.name} Grammar Chart.csv`">
        <i class="fa fa-download mr-1" />
        {{ $t('Download CSV') }}
      </a>
    </div>
    
    <div class="tabs text-center">
      <span class="mr-2">{{ l2LevelKey.toUpperCase() }}</span>
      <button v-for="(l, n) in filteredLevels" class="tab text-dark" :data-bg-level="n" @click="changeLevel(Number(n))"
        :key="`grammar-tab-level-${n}`">
        {{ l[l2LevelKey] || l.cefr }}
      </button>
      <button @click="changeLevel(undefined)" class="tab text-light bg-dark">
        {{ $t('All') }}
      </button>
      <div style="height: 0.5rem" :data-bg-level="level" :class="{ 'bg-dark': level ? false : true }"></div>
    </div>
    
    <div class="table-responsive">
      <table v-if="grammar && grammar.length > 0" :class="`table grammar-table skin-${$skin}`" :style="{ opacity: isRendering ? 0.5 : 1, transition: 'opacity 0.1s' }">
        <thead>
          <tr>
            <th class="text-center">{{ $t('Grammar') }}</th>
            <th>{{ $t('Structure') }}</th>
            <th>{{ $t('Translation') }}</th>
            <th style="min-width: 20rem">{{ $t('Example') }}</th>
            <th>{{ $t('Example Translation') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row) in grammarFiltered" :key="`grammar-${$l2.code}-row-${row.id}`" :class="{
            'grammar-table-row': true,
          }" @click="grammarRowClick(row)">
            <td class="text-center align-middle">
              <span>
                <a v-if="row.url !== ''" :href="`${row.url}`" class="btn btn-secondary" style="white-space: nowrap">
                  <i class="glyphicon glyphicon-facetime-video"></i>
                  {{ row.code }}
                </a>
                <span v-else>{{ row.code }}</span>
              </span>
            </td>
            <td class="align-middle">
              <TokenizedRichText>
                <span v-html="highlightMultiple(row.structure, row.words, row.book)" />
              </TokenizedRichText>
            </td>
            <td class="align-middle">
              <span>{{ row.english }}</span>
            </td>
            <td class="align-middle">
              <TokenizedRichText>
                <span v-html="highlightMultiple(row.example, row.words, row.book)" />
              </TokenizedRichText>
            </td>
            <td class="align-middle">
              <span>{{ row.exampleTranslation }}</span>
            </td>
          </tr>

          <tr v-if="allMatchedRows.length > visibleCount">
            <td colspan="5" v-observe-visibility="visibilityChanged" class="text-center py-4 text-muted">
              <Loader :sticky="true" message="Loading..." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { unique, LEVELS, l2LevelKey, highlightMultiple } from "../lib/utils";

export default {
  data() {
    return {
      search: "",
      level: undefined,
      grammar: [],
      csvSource: undefined,
      LEVELS,
      visibleCount: 50, 
      perPage: 10,
      isRendering: false
    };
  },
  async created() {
    let grammar = await this.$getGrammar();
    this.grammar = grammar._grammarData;
    this.csvSource = await grammar.getCSVSource(this.$l2["iso639-3"]);
    this.level = this.availableLevels[0];
  },
  computed: {
    availableLevels() {
      return unique(this.grammar.map((r) => r.level));
    },
    l2LevelKey() {
      return l2LevelKey(this.$l2.code)
    },
    allMatchedRows() {
      if (this.level) {
        return this.grammar.filter((row) => String(row.level) === String(this.level));
      }

      if (!this.search) {
        return this.grammar;
      }

      // Prepare the search term: lowercase, remove accents (tones), and remove spaces
      const cleanedSearch = this.cleanText(this.search);

      return this.grammar.filter((row) => {
        // 1. Check Code and English (standard lowercase check)
        const codeMatch = row.code && row.code.toLowerCase().includes(this.search.toLowerCase());
        const englishMatch = row.english && row.english.toLowerCase().includes(this.search.toLowerCase());
        
        // 2. Check Structure (standard check)
        const structureMatch = row.structure && row.structure.toLowerCase().includes(this.search.toLowerCase());

        // 3. Check Pinyin (Tone & Space insensitive using the helper)
        // Adjust 'row.pinyin' if your pinyin data uses a different key name (e.g., row.pronunciation)
        const cleanedPinyin = row.pinyin ? this.cleanText(row.pinyin) : "";
        const pinyinMatch = cleanedPinyin && cleanedPinyin.includes(cleanedSearch);

        return codeMatch || structureMatch || englishMatch || pinyinMatch;
      });
    },
    grammarFiltered() {
      return this.allMatchedRows.slice(0, this.visibleCount);
    },
    filteredLevels() {
      let levels = Object.assign({}, LEVELS);
      for (let level in LEVELS) {
        if (!this.availableLevels.includes(level)) {
          delete levels[level];
        }
      }
      return levels;
    },
  },
  watch: {
    search() {
      if (this.search) this.level = undefined;
      this.resetVirtualScroll();
    }
  },
  methods: {
    highlightMultiple(a, b) {
      return highlightMultiple(a, b);
    },
    grammarRowClick(row) {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/grammar/view/${row.id}`,
      });
    },
    resetVirtualScroll() {
      this.visibleCount = this.perPage;
    },
    // Normalizes strings by converting to lowercase, stripping tone marks, and removing spaces
    cleanText(str) {
      if (!str) return "";
      return str
        .toLowerCase()
        .normalize("NFD")               // Decomposes combined graphemes (e.g., "ā" becomes "a" + accent)
        .replace(/[\u0300-\u036f]/g, "") // Removes the accent marks
        .replace(/\s+/g, "");            // Removes all spaces
    },
    changeLevel(newLevel) {
      this.isRendering = true;
      this.resetVirtualScroll();
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.level = newLevel;
          this.$nextTick(() => {
            this.isRendering = false;
          });
        });
      });
    },
    visibilityChanged(isVisible) {
      if (!isVisible || this.isRendering) return;
      this.visibleCount += this.perPage;
    }
  },
};
</script>

<style lang="scss" scoped>
.grammar-table {
  .grammar-table-row {
    cursor: pointer;
  }

  &.skin-dark {
    .grammar-table-row:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  &.skin-light {
    .grammar-table-row:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.grammar-table [data-level] {
  font-weight: bold;
}
</style>