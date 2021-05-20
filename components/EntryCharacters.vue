<template>
  <!-- ANCHOR img/anchors/character-example.png -->
  <!-- FIXME Handle homonyms (e.g. 称 in 称心如意 should be chèn not chēng) -->
  <div class="entry-character" v-if="text" v-cloak>
    <div class="row character-row" v-if="characters">
      <!-- ANCHOR img/anchors/character.png -->
      <div
        class="character-column widget"
        v-for="(character, index) in characters"
      >
        <div class="widget-title">Character</div>
        <div class="widget-body jumbotron-fluid p-4">
          <Character
            :character="character"
            :pinyin="pinyinArr.length > 0 ? pinyinArr[index] : ''"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>


export default {
  props: {
    text: {
      stype: String
    },
    pinyin: {
      default: ''
    }
  },
  components: {
    Character
  },
  computed: {
    pinyinArr() {
      return this.$l2.code === 'zh' ? this.pinyin.split(' ') : this.pinyin.split('')
    }
  },
  data() {
    return {
      characters: []
    }
  },
  async mounted() {
    this.characters = await (await this.$hanzi).getCharactersInWord(this.text)
  }
}
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