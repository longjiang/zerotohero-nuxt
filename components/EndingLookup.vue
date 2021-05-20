<template lang="">
  <div>
    <div class="input-group mb-3">
      <input
        type="text"
        id="search-field-1"
        class="form-control"
        placeholder="ых"
        v-model="ending"
      />
      <div class="input-group-append">
        <button id="lookup-1" class="btn btn-primary" type="botton">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
    <div v-if="ending" class="results-1">
      <p class="result-heading-1">
        A word ending in
        <b>"-{{ ending }}"</b> can be:
      </p>
      <ul class="result-list-1">
        <li
          class="result-item"
          v-for="(message, index) in messages"
          v-html="message"
          :key="`m1-${mKey + index}`"
        ></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    files: {
      type: Array
    }
  },
  data() {
    return {
      ending: '',
      messages: [],
      mKey: 0
    }
  },
  watch: {
    ending() {
      this.messages = lookup(this.ending, this.files)
    }
  }
}
</script>