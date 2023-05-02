<template>
  <div class="grammar-notes-item text-center">
    <Annotate tag="div" :copy="false" class="grammar-structure">
      <h5
        v-html="
          highlightMultiple(
            grammar.structure,
            grammar.words,
            grammar.book
          )
        "
      ></h5>
    </Annotate>
    <div class="grammar-english">{{ grammar.english }}</div>
    <Annotate tag="h2" class="grammar-example" :showTranslate="false">
      <span
        v-html="
        highlightMultiple(grammar.example, grammar.words, grammar.book)
      "
      ></span>
    </Annotate>
    <div class="grammar-example-english">{{ grammar.exampleTranslation }}</div>
    <a
      v-if="grammar.url !== ''"
      :href="grammar.url"
      :data-bg-level="grammar.book"
      class="btn-medium btn-gray mt-5 pl-3 pr-3"
      target="_blank"
    >
      <i class="fas fa-play mr-2"></i>
      <b>Watch Grammar Lesson</b>
      {{ grammar.book }}.{{ grammar.lesson }}.{{ grammar.number }}
    </a>
  </div>
</template>

<script>
import { highlightMultiple } from "@/lib/utils";
export default {
  props: {
    grammar: {
      type: Object
    }
  },
  methods: {
    highlightMultiple(...args) {
      return highlightMultiple(...args);
    }
  }
}
</script>

<style>
.grammar-example {
  margin-top: 3rem;
}

.grammar-example-english {
  color: #999;
  font-style: italic;
}
</style>
