<template>
  <div>
    <ul
      :class="{
        collapsed: collapse > 0
      }"
      data-collapse-target
    >
      <li class="character-example" v-for="character in characters">
        <a
          v-if="compareWith"
          :href="
            `/${$l1.code}/${$l2.code}/compare/cedict/${compareWith.id},${character.id}`
          "
          class="btn btn-small mr-2"
          >Compare</a
        >
        <a
          v-if="character"
          :href="
            hsk
              ? `/${$l1.code}/${$l2.code}/view/hsk/${character.hskId}`
              : `/${$l1.code}/${$l2.code}/view/cedict/${character.id}`
          "
        >
          <span class="character-example-word" v-if="!highlight">{{
            character.character
          }}</span
          ><span class="character-example-word" v-if="highlight">{{
            character.character
          }}</span
          ><span class="character-example-word" v-if="traditional === true"
            >(<span class="traditional">{{ word.simplified }}</span
            ><span class="simplified">{{ word.traditional }}</span
            >)</span
          ><span class="character-example-pinyin ml-1">{{ character.pinyin }}</span
          >&nbsp;
          <span v-if="character.definitions" class="character-example-english">
            {{ word.definitions[0].text }}
          </span>
        </a>
      </li>
    </ul>
    <ShowMoreButton
      v-if="collapse > 0"
      :length="characters.length"
      :min="collapse"
    />
  </div>
</template>
<script>

export default {
  props: {
    characters: {
      type: Array
    },
    compareWith: {
      default: false
    },
    traditional: {
      default: false
    },
    highlight: {
      default: false
    },
    collapse: {
      default: 0
    },
    star: {
      default: true
    },
    hsk: {
      default: false
    }
  }
}
</script>
