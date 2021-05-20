<template>
  <div class="question-make-sentence" v-if="word && word.example" :id="id">
    <div class="question-slide-aspect">
      <div class="question-slide" :id="`${id}-slide-1`">
        <div class="question-prompt mb-4">
          How do you use this word in a sentence?
        </div>
        <div>
          <Speak :text="word.simplified" class="ml-2"></Speak>
        </div>
        <div class="text-center big-word" :data-level="word.hsk">
          {{ word.simplified }}
        </div>
        <div class="text-center character-example-english mt-4">
          {{ word.definitions[0].text }}
        </div>
        <div
          class="text-center mt-4 question-blank-sentence"
          contenteditable="true"
        ></div>
      </div>
    </div>
    <div class="question-slide-aspect">
      <div class="question-slide answer" :id="`${id}-slide-2`">
        <div>
          <img
            :src="`${Config.imageUrl}${word.hskId}-${word.simplified}.jpg`"
            class="question-image mb-4"
          />
        </div>
        <div>
          <Speak :text="word.example" class="ml-2"></Speak>
        </div>
        <div
          class="text-center example-sentence-word mb-4"
          v-html="Helper.highlight(word.example, word.simplified, word.hsk)"
        >
          {{ word.example }}
        </div>
        <div class="text-center character-example-english">
          {{ word.exampleTranslation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'
import Config from '@/lib/config'

export default {
  props: ['id', 'word', 'type'],
  components: {},
  data() {
    return {
      Helper,
      Config
    }
  },
  mounted() {},
  methods: {}
}
</script>
