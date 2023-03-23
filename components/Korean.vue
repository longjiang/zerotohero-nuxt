<template>
  <Widget>
    <template #title>{{ $t("Korean Hanja") }}</template>
    <template #body>
      <div v-if="words">
        <div v-for="word in words" :key="`hanja-word-${word.id}`">
          <div>
            <router-link
              :to="`/en/ko/dictionary/kengdic/${word.kid}`"
              class="link-unstyled"
            >
              <b>{{ word.hangul }}</b>
              [
              <b data-level="outside" class="bigger">{{ word.hanja }}</b>
              ]
            </router-link>
            <Speak :text="word.hangul" :l2="korean" />
            <em>{{ word.english }}</em>
            in Korean
          </div>
        </div>
      </div>
      <div v-if="words.length === 0">
        {{
          $t("We could not find any Korean words with the hanja “{text}.”", {
            text,
          })
        }}
      </div>
    </template>
  </Widget>
</template>

<script>

export default {
  props: {
    text: {
      type: String,
    },
  },
  data() {
    return {
      words: [],
    };
  },
  computed: {
    korean() {
      return this.$languages.getSmart("ko");
    },
  },
  methods: {
    async loadVariants() {
      let variants = await (await this.$getUnihan()).variants(this.text);
      for (let variant of variants) {
        let response = await this.$directus.get(
          `items/kengdic?filter[hanja][eq]=${variant}`
        );
        response = response.data;
        this.words = this.words.concat(response.data);
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
