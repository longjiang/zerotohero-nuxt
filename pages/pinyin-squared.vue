<router>
  {
    path: '/:l1/:l2/pinyin-squared',
    meta: {
      title: 'Pinyin Squared | Language Player'
    }
  }
</router>
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
            (”pinyin squared”) is a new, experimental way of writing Chinese
            phonetics with character-
            <em>like</em>
            blocks.
          </h5>
          <hr class="mt-5 mb-5" />
          <p>
            You know what Korean characters look like, right? Like this:
            <code>한국어 예문</code>
            .
          </p>
          <p>
            They look like blocks, but in reality they only represent sound. For
            example,
            <code>한</code>
            is made up of
            <code>ㅎ</code>
            (h)
            <code>ㅏ</code>
            (a)
            <code>ㄴ</code>
            (n), and together they sound like "han."
          </p>
          <p>
            What if we write Chinese following the same philosophy, yet retain
            the visual characteristics of the ideographs?
          </p>
          <client-only>
            <p>Well, I imagine that it could look like this:</p>
            <div class="jumbotron p-3 text-center mb-3">
              zhōngwén →
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
          <hr class="mt-5 mb-5" />
          <h3 class="text-center mt-5 mb-5">Try It Out</h3>
          <p class="mt-5 mb-5 text-center">
            Type some pinyin (with
            <em>numeric</em>
            tone-marks) here:
          </p>
          <client-only>
            <div
              id="output"
              class="p-4 rounded shadow"
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
          <!-- <button @click="convertClick" class="btn btn-success btn-block mt-3">
          Convert to Pinyin<sup>2</sup>
        </button>-->
          <h3 class="text-center mt-5 mb-5">Explore the Conversion Chart</h3>
          <a href="/img/pinyin-squared-chart.jpg" target="_blank">
            <img
              class="img-fluid"
              src="/img/pinyin-squared-chart.jpg"
              alt="Pinyin-Squared Conversion Chart"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PinyinSquared from "@/lib/pinyin-squared";
import PinyinSquaredCharacter from "@/components/PinyinSquaredCharacter";

export default {
  components: {
    PinyinSquaredCharacter,
  },
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
