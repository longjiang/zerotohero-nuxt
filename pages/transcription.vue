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
            Paste your {{ $l2.name }} text into the text box and get a phonetic
            transcripton.
          </p>
        </div>
      </div>
      <div class="row">
        <div
          :class="{ 'col-sm-6': transcription, 'col-sm-12': !transcription }"
        >
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
          <h5 class="mt-4 mb-4">
            Transcription<span v-if="showIpa"> (IPA)</span>:
          </h5>
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
            <label class="form-check-label" for="showIpa"> Force IPA </label>
          </div>
          <button
            class="btn btn-success btn-block"
            v-on:click="getTranscriptionClick"
          >
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
      let transcription = this.tokens
        .map((t) => this.tokenToTranscription(t, false))
        .map((s) => s.replace(/ /g, ""))
        .join(" ");
      // remove spaces around punctuation
      return this.cleanUpSpaces(transcription);
    },
    // If 'force IPA' is checked, this will be the IPA transcription after running pinyin2ipa
    ipa() {
      let transcription = this.tokens
        .map((t) => this.tokenToTranscription(t, true))
        .join(" ");
      // remove spaces around punctuation
      return this.cleanUpSpaces(transcription);
    },
  },
  mounted() {
    this.text = localStorage.getItem("zthTranscription") || "";
  },
  methods: {
    cleanUpSpaces(transcription) {
      return transcription
        .replace(/ ([.,;:?!。，；：？！])( ?)/g, "$1")
        .replace(/\n /g, "\n");
    },
    tokenToTranscription(t, useIPA = false) {
      // If t is a string, return it
      if (typeof t === "string") {
        return t;
      } else {
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
          transcription = this.convertToIPA(transcription, {
            toneMarker: "chaoletter",
          });
        }
        return transcription;
      }
    },
    async getTranscriptionClick() {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("zthTranscription", this.text);
      }
      let dictionary = await this.$getDictionary();
      this.tokens = await dictionary.tokenizeWithCache(this.text);
    },
    convertSyllableToIPA(pinyinWord) {
      const pinyinToIPA = {
        a: "a",
        ai: "aɪ̯",
        an: "an",
        ang: "aŋ",
        ao: "aʊ̯",
        e: "ɤ",
        ei: "eɪ̯",
        en: "ən",
        eng: "əŋ",
        i: "i",
        ia: "ja",
        ian: "jɛn",
        iang: "jɛŋ",
        iao: "jau̯",
        ie: "je",
        in: "in",
        ing: "iŋ",
        iong: "joŋ",
        iu: "joʊ̯",
        o: "uo",
        ou: "oʊ̯",
        ong: "oŋ",
        u: "u",
        ua: "wa",
        uai: "waɪ̯",
        uan: "wan",
        uang: "waŋ",
        ue: "we",
        ui: "weɪ̯",
        un: "wən",
        uo: "wɔ",
        ü: "y",
        üe: "yɛ",
        üan: "yɛn",
        ün: "yn",
        // initial consonants
        b: "p",
        p: "pʰ",
        m: "m",
        f: "f",
        d: "t",
        t: "tʰ",
        n: "n",
        l: "l",
        g: "k",
        k: "kʰ",
        h: "x",
        j: "t͡ɕ",
        q: "t͡ɕʰ",
        x: "ɕ",
        zh: "ʈ͡ʂ",
        ch: "ʈ͡ʂʰ",
        sh: "ʂ",
        r: "ʐ",
        z: "ts",
        c: "tsʰ",
        s: "s",
        // tones
        1: "˥",
        2: "˧˥",
        3: "˨˩˦",
        4: "˥˩",
        5: "",
      };
      // Tone processing
      const tones = {
        ā: ["a", "1"],
        á: ["a", "2"],
        ǎ: ["a", "3"],
        à: ["a", "4"],
        ē: ["e", "1"],
        é: ["e", "2"],
        ě: ["e", "3"],
        è: ["e", "4"],
        ī: ["i", "1"],
        í: ["i", "2"],
        ǐ: ["i", "3"],
        ì: ["i", "4"],
        ō: ["o", "1"],
        ó: ["o", "2"],
        ǒ: ["o", "3"],
        ò: ["o", "4"],
        ū: ["u", "1"],
        ú: ["u", "2"],
        ǔ: ["u", "3"],
        ù: ["u", "4"],
        ǖ: ["ü", "1"],
        ǘ: ["ü", "2"],
        ǚ: ["ü", "3"],
        ǜ: ["ü", "4"],
      };

      for (let toneChar in tones) {
        if (pinyinWord.includes(toneChar)) {
          pinyinWord = pinyinWord.replace(toneChar, tones[toneChar][0]);
          pinyinWord += tones[toneChar][1];
        }
      }

      let ipaWord = "";

      // Convert consonants and vowels
      while (pinyinWord.length > 0) {
        let matchFound = false;

        for (let syllable of Object.keys(pinyinToIPA).sort(
          (a, b) => b.length - a.length
        )) {
          if (pinyinWord.startsWith(syllable)) {
            ipaWord += pinyinToIPA[syllable];
            pinyinWord = pinyinWord.slice(syllable.length);
            matchFound = true;
            break;
          }
        }

        if (!matchFound) {
          ipaWord += pinyinWord[0];
          pinyinWord = pinyinWord.slice(1);
        }
      }

      return ipaWord;
    },
    convertToIPA(pinyin) {
      const syllables = pinyin.split(" ");
      const ipaArray = syllables.map(this.convertSyllableToIPA);
      return ipaArray.join(" ");
    },
  },
};
</script>
<style lang="scss" scoped>
.transcription {
  font-family: AndikaW, Andika, Arial, sans-serif;
}
</style>
