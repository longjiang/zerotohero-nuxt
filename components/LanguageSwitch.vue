<template>
  <div>
    <Search
      placeholder="Switch language: type language name to search"
      :hrefFunc="hrefFunc"
      :button="false"
      :suggestionsFunc="suggestionsFunc"
      type="generic"
      :defaultURL="text => `/en/${text}/`"
      ref="l1"
    />
  </div>
</template>

<script>
import Search from '@/components/Search'
export default {
  components: {
    Search
  },
  data() {
    return {
      languages: [],
      enLanguages: []
    }
  },
  mounted() {
    this.languages = this.$languages.l1s
      .filter(
        language => ['A', 'C', 'L', 'E', 'H'].includes(language.type) // Only living, extinct or historical languages (exclusing special codes 'S' and macro languages 'M')
      )
      .sort((a, b) => {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
    this.enLanguages = this.languages.filter(
      language => !['E', 'H'].includes(language.type)
    )
  },
  methods: {
    suggestionsFunc(text) {
      text = text.toLowerCase()
      let english = this.languages.find(language => language.code === 'en')
      return this.languages
        .filter(
          language =>
            language.code.includes(text) ||
            language['iso639-3'].includes(text) ||
            language.name.toLowerCase().includes(text)
        )
        .sort((a, b) => b.name.length - a.name.length)
        .sort(language =>
          language['iso639-3'].startsWith(text) ||
          language.name.startsWith(text)
            ? 1
            : -1
        )
        .map(language => {
          return {
            bare: `${language.name} (${
              language.code !== language['iso639-3'] ? language.code + ', ' : ''
            }${language['iso639-3']})`,
            definitions: this.$languages.getFeatures({
              l1: english,
              l2: language
            }),
            l1: english,
            l2: language
          }
        })
        .slice(0, 30)
    },
    hrefFunc(suggestion) {
      if (suggestion && suggestion.l1 && suggestion.l2) {
        return `/${suggestion.l1.code}/${suggestion.l2.code}/`
      }
    }
  }
}
</script>

<style>
</style>