<router>
  {
    path: '/:l1/:l2/transcription',
  }
</router>
<template>
  <div class="main">
    <SocialHead
      title="Phonetic Transcription | Language Player"
      :description="`Enter ${this.$l2.name} text and convert it into phonetic transcription.`"
    />
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="text-center">{{ $l2.name }} Phonetic Transcription</h3>
          <p class="text-center">
            Paste your {{ $l2.name }} text into the text box and get a phonetic transcripton.
          </p>
        </div>
      </div>
      <div class="row">
        <div :class="{ 'col-sm-6': transcription, 'col-sm-12': !transcription }">
          <h5 class="mt-4 mb-4">Enter {{ $l2.name }} Text Here:</h5>
          <textarea
            v-model="text"
            class="mt-2 mb-2 form-control"
            cols="30"
            rows="10"
            :placeholder="`Paste your list or ${$l2.name} words here to generate phonetic transcription.`"
          ></textarea>
        </div>
        <div class="col-sm-6" v-if="transcription">
          <h5 class="mt-4 mb-4">Transcription<span v-if="showIpa"> (IPA)</span>:</h5>
          <textarea
            class="mt-2 mb-2 form-control transcription"
            style="overflow: visible"
            cols="30"
            rows="10"
            >{{ showIpa ? ipa : transcription }}</textarea
          >
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-sm-12">
          <!-- Add an IPA toggle switch -->
          <div class="form-check mb-3" v-if="this.$l2.han">
            <input
              class="form-check-input"
              type="checkbox"
              value=""
              id="showIpa"
              v-model="showIpa"
            />
            <label class="form-check-label" for="showIpa">
              Force IPA
            </label>
          </div>
          <button class="btn btn-success btn-block" v-on:click="getTranscriptionClick">
            Get Transcription
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pinyin2ipa from "pinyin2ipa";

export default {
  data() {
    return {
      text: "",
      tokens: [],
      ready: false,
      showIpa: false,
    };
  },
  computed: {
    transcription() {
      let transcription = this.tokens.map((t) => this.tokenToTranscription(t, false)).join(" ");
      // remove spaces around punctuation
      return this.cleanUpSpaces(transcription)
    },
    // If 'force IPA' is checked, this will be the IPA transcription after running pinyin2ipa
    ipa() {
      let transcription = this.tokens.map((t) => this.tokenToTranscription(t, true)).join(" ");
      // remove spaces around punctuation
      return this.cleanUpSpaces(transcription)
    },
  },
  mounted() {
    this.text = localStorage.getItem("zthTranscription") || "";
  },
  methods: {
    cleanUpSpaces(transcription) {
      return transcription.replace(/ ([.,;:?!。，；：？！])( ?)/g, "$1").replace(/\n /g, "\n");
    },
    tokenToTranscription(t, useIPA = false) {
      // If t is a string, return it
      if (typeof t === "string") {
        return t;
      }
      else {
        // As a default, return the text
        let transcription = t.text;
        // If t is an object with pronunciation, return the pronunciation
        if (t.pronunciation) {
          transcription = t.pronunciation;
        }
        // If t is an object with at least one candidate, return the pronunciation of the first candidate
        else if (t.candidates && t.candidates.length > 0) {
          transcription = t.candidates[0].pronunciation;
        }
        if (useIPA) {
          transcription = pinyin2ipa(transcription, { toneMarker: "chaoletter" });
        }        
        return transcription
      }
    },
    async getTranscriptionClick() {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("zthTranscription", this.text);
      }
      let dictionary = await this.$getDictionary();
      this.tokens = await dictionary.tokenizeWithCache(this.text);
    },
  },
};
</script>
<style lang="scss" scoped>
.transcription {
  font-family: AndikaW, Andika, Arial, sans-serif;
}
</style>