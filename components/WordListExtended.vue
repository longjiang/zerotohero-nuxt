<template>
  <div>
    <ul
      :key="listKey"
      :class="{
        'word-list-ext': true,
        collapsed: collapse > 0
      }"
      data-collapse-target
    >
      <WordCard
        tag="li"
        v-for="(word, index) in words"
        :word="word"
        :compareWith="word !== compareWith ? compareWith : false"
        :index="index"
        :key="`word-card-${index}`"
        :showFrequency="false"
        :showExample="false"
        :showDefinitions="true"
      />
    </ul>
    <ShowMoreButton
      v-if="collapse > 0"
      :length="words.length"
      :min="collapse"
    />
  </div>
</template>
<script>
import WordCard from '@/components/WordCard'

export default {
  components: {
    WordCard
  },
  data() {
    return {
      listKey: 0,
    }
  },
  props: {
    words: {
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

<style>
.word-list-ext {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

</style>
