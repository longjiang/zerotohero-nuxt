<template>
  <div class="entry-character" v-if="text" v-cloak>
    <div class="row character-row" v-if="characters">
      <Widget
        class="character-column"
        v-for="(character, index) in characters"
        :key="`entry-character-${index}`"
      >
        <template #title>{{ $t("Character") }}</template>
        <template #body>
          <Character
            :character="character"
            :pinyin="pinyinArr.length > 0 ? pinyinArr[index] : ''"
          />
        </template>
      </Widget>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: {
      stype: String,
    },
    pinyin: {
      default: "",
    },
  },
  computed: {
    pinyinArr() {
      return this.$l2.code === "zh"
        ? this.pinyin.split(" ")
        : this.pinyin.split("");
    },
  },
  data() {
    return {
      characters: [],
    };
  },
  async mounted() {
    if (this.text) {
      let hanzi = await this.$getHanzi();
      this.characters = await hanzi.getCharactersInWord(this.text);
    }
  },
};
</script>
<style>
.character-row {
  display: flex;
}
.character-column {
  flex: 1;
  margin: 1rem;
  min-width: 20rem;
}
</style>