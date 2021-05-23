<template>
  <div class="widget korean">
    <div class="widget-title">Learning Korean?</div>
    <div class="widget-body jumbotron-fluid p-4">
      <div v-if="words">
        <div v-for="word in words">
          <div>
            The Korean word
            <a
              :href="`/en/ko/dictionary/kengdic/${word.kid}`"
              class="link-unstyled"
              target="_blank"
              ><b>{{ word.hangul }}</b> [<b
                data-level="outside"
                class="bigger"
                >{{ word.hanja }}</b
              >]</a
            >
            means <em>{{ word.english }}</em
            >.
          </div>
        </div>
      </div>
      <div v-if="words.length === 0">
        We could not find any Korean words with the
        <em>hanja</em>
        “{{ text }}.”
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/lib/config'

export default {
  props: {
    text: {
      type: String
    }
  },
  data() {
    return {
      words: []
    }
  },
  methods: {
    async loadVariants() {
      let variants = await (await this.$unihan).variants(this.text)
      for (let variant of variants) {
        let response = await axios.get(
          `${Config.wiki}items/kengdic?filter[hanja][eq]=${variant}`
        )
        response = response.data
        this.words = this.words.concat(response.data)
      }
    }
  },
  watch: {
    text() {
      if (this.text && this.words.length === 0) {
        this.loadVariants()
      }
    }
  },
  mounted() {
    if (this.text && this.words.length === 0) {
      this.loadVariants()
    }
  }
}
</script>

<style></style>
