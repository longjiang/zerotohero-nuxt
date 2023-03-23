<template>
  <Widget>
    <template #title>{{ $t("Chinese Hànzì") }}</template>
    <template #body>
      <div v-if="words">
        <div v-for="word in words" :key="`hanzi-word-${word.id}`">
          <div>
            <router-link
              :to="`/en/zh/dictionary/hsk-cedict/${
                word.traditional
              },${word.pinyin.replace(/ /g, '_')},${word.index}`"
              class="link-unstyled"
            >
              <b class="bigger" :data-level="'outside'">
                {{ word.simplified }}
              </b>

              [{{ word.traditional }}]
              <span>({{ word.pinyin }})</span>
            </router-link>
            <Speak :text="word.traditional" :l2="chinese" />
            <em>{{ word.definitions }}</em>
            in Chinese.
          </div>
        </div>
      </div>
      <div v-if="words.length === 0">
        {{
          $t(
            "We could not find any Chinese words with the (traditional) Chinese characters “{text}.”",
            { text }
          )
        }}
      </div>
    </template>
  </Widget>
</template>

<script>
import Config from "@/lib/config";

export default {
  props: {
    text: {
      type: String,
    },
    hsk: {
      default: "outside",
    },
  },
  data() {
    return {
      words: [],
    };
  },
  computed: {
    chinese() {
      return this.$languages.getSmart("zh");
    },
  },
  methods: {
    async loadVariants() {
      let variants = await (await this.$getUnihan()).variants(this.text);
      for (let variant of variants) {
        let response = await this.$directus.get(
          `items/hsk_cedict?filter[traditional][eq]=${variant}`
        );
        this.words = this.words.concat(response.data.data);
      }
    },
  },
  watch: {
    text() {
      if (this.text && this.words.length === 0) {
        this.loadVariants();
      }
    },
  },
  mounted() {
    if (this.text && this.words.length === 0) {
      this.loadVariants();
    }
  },
};
</script>

<style></style>
