<template>
  <Widget>
    <template #title>{{ $t("Japanese Kanji") }}</template>
    <template #body>
      <div v-if="words">
        <div v-for="word in words" :key="`kanji-word-${word.id}`">
          <div>
            <router-link
              :to="`/en/ja/dictionary/edict/${word.id}`"
              class="link-unstyled"
            >
              <b :data-level="hsk" class="bigger">{{ word.kanji }}</b>
              ({{ word.kana }})
            </router-link>
            <Speak :text="word.kana || word.kanji" :l2="japanese" />
            <em>
              {{
                word.english
                  .replace(/\(.*?\)/g, "")
                  .replace(/\//g, ", ")
                  .trim()
                  .replace(/,$/, "")
              }}
            </em>
            in Japanese
          </div>
        </div>
      </div>
      <div v-if="!words || words.length === 0">
        {{
          $t("We could not find any Japanese words with the kanji “{text}.”", {
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
    hsk: {
      default: "outside",
    },
  },
  computed: {
    japanese() {
      return this.$languages.getSmart("ja");
    },
  },
  data() {
    return {
      words: [],
      shinjitai: undefined,
    };
  },
  head: {
    script: [{ hid: "kyujitai", src: "/vendor/kyujitai/kyujitai.js" }],
  },
  async created() {
    if (typeof Kyujitai !== "undefined") {
      let variants = await (await this.$getUnihan()).variants(this.text);
      for (let variant of variants) {
        let kyujitai = new Kyujitai(async (error) => {
          this.shinjitai = kyujitai.decode(variant);
          if (this.shinjitai) {
            let response = await this.$directus.get(
              `items/edict?filter[kanji][eq]=${this.shinjitai}`
            );
            if (response.data.data.length > 0) {
              let data = response.data.data.filter((row) => {
                return !this.words.find((word) => word.kanji === row.kanji); // Make sure it's unique (2 kyujitai variants might turn out to be the same shinjitai)
              });
              this.words = this.words.concat(data);
            }
          }
        });
      }
    }
  },
};
</script>

<style></style>
