<template>
  <div class="type" :data-type="type">
    <h4>Practice {{ type }}</h4>
    <div class="declined-words">
      <div
        class="declined-word"
        v-for="row in data"
        v-if="row[type + ' example']"
      >
        <button class="speak" @click="speak(row[`${type} example sentence`])">
          <i class="fas fa-volume-up" />
        </button>
        <div class="declined-word-inner">
          <div class="example-image-wrapper">
            <img
              v-if="type.includes('animate')"
              alt=""
              class="example-image"
              :src="`/img/russian-grammar-examples/${row['example (animate)']} ${type}.jpg`"
            />
            <img
              v-else
              alt=""
              class="example-image"
              :src="`/img/russian-grammar-examples/${row['example']} ${type}.jpg`"
            />
          </div>
          <div class="example-wrapper">
            <p
              class="example"
              v-html="row[type + ' example sentence html']"
            ></p>
            <p class="example-translation">
              {{ row[type + " example translation"] }}
            </p>
          </div>
        </div>
        <div class="hint">
          <b>Hint:</b>
          A {{ row["gender"] }} -
          <b>{{ row["dictionary form"] }}</b>
          noun
          <span v-if="row['dictionary form'] == row[type]">
            does not change
          </span>
          <span v-else>
            changes to -
            <b>{{ row[type] }}</b>
          </span>
          in {{ type }}.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
    },
    data: {
      type: Array,
    },
  },
  methods: {
    speak(sentence) {
      speakRussian(sentence);
    },
  },
  mounted() {
    addBlankEventHandlers();
  },
  updated() {
    addBlankEventHandlers();
  },
};
</script>
