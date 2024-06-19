<template>
  <div class="main">
    <SocialHead
      :title="`Pinyin Squared | Language Player`"
      :description="`An experiment in writing Chinese with phonetic character blocks.`"
      :image="`/img/courses/bundle-ultimate.jpg`"
    />

    <div class="container pt-5">
      <div class="row">
        <div class="col-sm-12">
          <h1 class="text-center">
            Pinyin
            <sup class="text-success">2</sup>
          </h1>
          <h5 class="text-center mt-5" style="line-height: 1.5">
            Pinyin
            <sup class="text-success">2</sup>
            (”pinyin squared”) is my proposed Chinese <a href="https://en.wikipedia.org/wiki/Syllabary">syllabary</a>. It is a way of writing Mandarin
            syllables in blocks that resemble Chinese characters.
          </h5>
          <hr class="mt-5 mb-5" />
          <p>
            It is inspired by the Korean Hangul alphabet. Consider the Hangul example of <code>한국어</code> [han guk geo] "Korean Language". The first block 
            <code>한</code>
            is made up of three letters in the alphabet:
            <code>ㅎ</code>
            (h)
            <code>ㅏ</code>
            (a)
            <code>ㄴ</code>
            (n), which make up the syllable "han." However, due to the nature of Korean phonology, it is impossible to numerate all possible combinations of Hangul blocks. It is therefore considered an <em>alphabet</em> rather than a <em>syllabary</em>.
          </p>
          <p>
            The Chinese syllabary I am proposing here uses symbols to represent all possible Mandarin syllables and tone variations, even including those not represented by Chinese characters yet are possible Mandarin sounds (e.g. <code>duāng</code>).
            The syllabary also retains the visual characteristics of Chinese characters.
          </p>
          <client-only>
            <h6>A Quick example:</h6>
            <p>
              In this proposed syllabary, the word 中文 [zhōngwén] "Chinese language" can be written as:
            </p>
            <div class="jumbotron p-3 text-center mb-3 text-dark">
              <PinyinSquaredCharacter
                :blockOrString="{ initial: 'zh', final: 'ong', tone: 1 }"
              />
              <PinyinSquaredCharacter
                :blockOrString="{ initial: 'w', final: 'en', tone: 2 }"
              />
            </div>
            <p>
              Hover over the characters to see how they are constructed from
              pinyin.
            </p>
          </client-only>
          <h6>How is this different from Bopomofo</h6>
          <p>
            Bopomofo, also known as 注音符号 [zhù yīn fú hào] "phonetic symbols," is a system of phonetic notation for Mandarin Chinese. It is used in Taiwan and is also used to teach Mandarin in schools in mainland China. Bopomofo is a phonetic <em>alphabet</em> rather than a <em>syllabary</em> because each symbol in Bopomofo represents a single initial or final, not a syllable.
          </p>
          <p>Compare the Bopomofo for the word 中文 [zhōngwén] "Chinese language" with the Pinyin<sup>2</sup> version for the phrase 今天天气很好 [jīn tiān tiān qì hěn hǎo] "The weather is very nice today":</p>
          <div class="row">
            <div class="col-sm-6">
              <h6>Bopomofo</h6>
              <p class="text-center rounded bg-light text-dark p-3">
                ㄐㄧㄣ ㄊㄧㄢ ㄊㄧㄢ ㄑㄧˋ ㄏㄣˇ ㄏㄠˇ
              </p>
            </div>
            <div class="col-sm-6">
              <h6>Pinyin<sup>2</sup></h6>
              <p class="text-center rounded bg-light p-3">
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 'j', final: 'in', tone: 1 }"
                />
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 't', final: 'ian', tone: 1 }"
                />
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 't', final: 'ian', tone: 1 }"
                />
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 'q', final: 'i', tone: 4 }"
                />
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 'h', final: 'en', tone: 3 }"
                />
                <PinyinSquaredCharacter
                  :blockOrString="{ initial: 'h', final: 'ao', tone: 3 }"
                />
              </p>
            </div>
          </div>
          <p>Both represent the same sounds, but the Pinyin<sup>2</sup> has the following advantages:</p>
          <ul>
            <li>It is more visually similar to Chinese characters.</li>
            <li>Syllables are represented as a whole, rather than as individual initials and finals.</li>
            <li>More terse and easier to read.</li>
          </ul>
          <p>All possible syllables in Mandarin are tabulated in the conversion chart below (PDF). Note that "i" in pinyin is used to represent multiple finals, therefore it is listed as separate columns and is represented with distinct symbols.</p>
          <a href="/img/pinyin-squared-chart.jpg" target="_blank">
            <img
              class="img-fluid"
              src="/img/pinyin-squared-chart.jpg"
              alt="Pinyin-Squared Conversion Chart"
            />
          </a>
          <p class="mt-3">Also note that some cells in the table are blank because they do not exist in the Mandarin vocabulary (e.g. [<code>fāo</code>, <code>duāng</code>]) but are phonologically possible. We can easily construct these in Pinyin<sup>2</sup> by combining the initial and final blocks. We can construct it in Pinyin<sup>2</sup> as:</p>
          <div class="jumbotron p-3 text-center mb-3 text-dark">
            <PinyinSquaredCharacter
              :blockOrString="{ initial: 'f', final: 'ao', tone: 1 }"
            />
            <PinyinSquaredCharacter
              :blockOrString="{ initial: 'd', final: 'uang', tone: 1 }"
            />
          </div>
          <p class="my-4">
            <strong>Try it out!</strong> Type some pinyin (with
            <em>numeric</em>
            tone-marks) here:
          </p>
          <client-only>
            <div
              id="output"
              class="p-4 rounded bg-light shadow skin-light"
              v-if="blocksOrStrings && blocksOrStrings.length > 0"
            >
              <PinyinSquaredCharacter
                v-for="(blockOrString, index) in blocksOrStrings"
                :blockOrString="blockOrString"
                :key="`pinyin-squared-character-${index}`"
              />
              <p class="mt-3 mb-0" style="font-family: sans-serif; color: #aaa">
                Hover over the characters to see how they are constructed from
                sound.
              </p>
            </div>
          </client-only>
          <textarea
            v-model="text"
            class="form-control mt-4"
            rows="10"
            placeholder="wo3 hui4 shuo1 zhong1 wen2"
          ></textarea>
          <button @click="convertClick" class="btn btn-success btn-block mt-3 mb-5">
            Convert to Pinyin<sup>2</sup>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PinyinSquared from "../../../../lib/pinyin-squared";

export default {
  data() {
    return {
      text: "",
    };
  },
  computed: {
    blocksOrStrings() {
      if (typeof document !== "undefined") {
        return PinyinSquared.preprocess(this.text);
      }
    }
  },
  methods: {
    convertClick() {},
  },
};
</script>

<style>
#output {
  font-family: minion-pro, source-han-serif-sc, serif;
}

.string {
  font-size: 1.5rem;
  position: relative;
  bottom: 0.15rem;
}

.block {
  display: inline-block;
  margin: 0 0.1em;
  position: relative;
}

.block .pinyin {
  opacity: 0;
  font-size: 1rem;
  font-family: serif;
  position: absolute;
  top: -1.5rem;
}

.block:hover .pinyin {
  opacity: 1;
}

.hidden {
  display: none;
}

.chart {
  border-spacing: 0;
  border-collapse: collapse;
}

.chart td {
  padding: 0.3rem;
  border: 1px solid #ccc;
  min-width: 3em;
  text-align: center;
}

.chart td p {
  margin: 0;
}

.chart tr:first-child,
.chart td:first-child {
  background-color: #eee;
}

.chart .block {
  font-size: 2em;
}
</style>
