<template>
  <component
    :is="tag"
    v-if="!removed"
    :class="`word-list-ext-item text-center ${compareWith ? 'compare' : ''}`"
  >
    <div class="word-list-ext-item-head">
      <div class="word-list-ext-cycle">
        <button class="paginate-button previous" v-on:click="imgPrev">
          <i class="fa fa-chevron-left" />
        </button>
        <button class="paginate-button next" v-on:click="imgNext">
          <i class="fa fa-chevron-right" />
        </button>
        <button class="paginate-button close" v-on:click="remove">
          <i class="fa fa-times" />
        </button>
      </div>
      <router-link
        :to="`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${word.id}`"
      >
        <img
          v-if="srcs && srcs.length > 0"
          :src="srcs[0]"
          class="word-list-ext-image"
          v-lazy-load
        />
      </router-link>
    </div>
    <div class="word-list-ext-item-body">
      <Frequency class="mb-1" v-if="word" :entry="word" />
      <div class="character-example-pinyin">
        <Star
          class="word-list-ext-item-head-star"
          v-if="word && star === true"
          :word="word"
        ></Star>
        {{ word.pinyin }}
        <Speak :text="word.simplified" />
      </div>
      <router-link
        v-if="word"
        :to="`/${$l1.code}/${$l2.code}/dictionary/${$dictionaryName}/${word.id}`"
      >
        <div :data-level="word.hsk" class="word-list-ext-item-word simplified">
          {{ word.simplified }}
        </div>
        <div :data-level="word.hsk" class="word-list-ext-item-word traditional">
          {{ word.traditional }}
        </div>
      </router-link>

      <div v-if="word.definitions" class="character-example-english mb-2">
        <div v-for="definition in word.definitions.slice(0, 3)">
          <span v-if="definition.text">
            {{ definition.text.replace(/\(.*\)/, "") }}
          </span>
        </div>
      </div>
      <div
        v-html="highlight(word.example, word.simplified, word.hsk)"
        class="word-list-ext-example"
      ></div>
      <div class="character-example-english mt-1">
        {{ word.exampleTranslation }}
      </div>
      <router-link
        v-if="compareWith"
        :to="`/${$l1.code}/${$l2.code}/compare/${$dictionaryName}/${compareWith.id},${word.id}`"
        class="btn show-more word-list-ext-compare-btn mt-3"
        :data-bg-level="word.hsk"
      >
        <i class="glyphicon glyphicon-adjust"></i>
        Compare
      </router-link>
      <router-link
        v-if="compareWith"
        :to="`/${$l1.code}/${$l2.code}/explore/related/${word.id}`"
        class="btn show-more word-list-ext-related-btn mt-3"
        :data-bg-level="word.hsk"
      >
        <i class="glyphicon glyphicon-fullscreen"></i>
        Related
      </router-link>
    </div>
  </component>
</template>

<script>
import Config from "@/lib/config";
import Frequency from "@/components/Frequency";
import WordPhotos from "@/lib/word-photos";
import Helper from "@/lib/helper";

export default {
  components: {
    Frequency,
  },
  props: {
    tag: {
      default: "div",
    },
    word: {
      default: undefined,
    },
    compareWith: {
      default: false,
    },
    star: {
      default: true,
    },
    index: {
      default: 0,
    },
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  data() {
    return {
      Config,
      removed: false,
      srcs: [],
    };
  },
  async fetch() {
    console.log('fetch')
    if (this.srcs.length === 0) {
      let images = await WordPhotos.getWebImages(this.word.simplified);
      this.srcs = this.srcs.concat(images.map((image) => image.img));
    }
  },
  methods: {
    highlight(a, b, c) {
      return Helper.highlight(a, b, c);
    },
    remove() {
      this.removed = true;
    },
    imgPrev() {
      this.srcs.push(this.srcs.shift());
    },
    imgNext() {
      this.srcs.unshift(this.srcs.pop());
    },
  },
};
</script>

<style>
.word-list-ext-item {
  margin: 2rem;
  width: 20rem;
  margin: 2rem 1rem;
  flex: 1 0 auto;
  background: #fafafa;
  border-radius: 0.3rem;
  overflow: hidden;
  box-shadow: 3px 3px 25px rgba(0, 0, 0, 0.2);
  position: relative;
}

.word-list-ext-image {
  height: 15rem;
  object-fit: cover;
  width: 100%;
}

.word-list-ext-item a {
  color: inherit;
}

.word-list-ext-item a:hover {
  text-decoration: none;
}

.word-list-ext-item-body {
  padding: 2rem;
}

.word-list-ext-compare-btn,
.word-list-ext-related-btn {
  position: absolute;
  top: 10.5rem;
  width: calc(50% - 2.4rem);
}

.word-list-ext-compare-btn {
  left: 2rem;
}

.word-list-ext-related-btn {
  right: 2rem;
}

.word-list-ext-item-word {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.2;
}

.word-list-ext-example.add-pinyin {
  line-height: 1.8;
}

.word-list-ext-example {
  font-weight: bold;
  font-size: 1.4rem;
}

.word-list-ext-item:not(:hover) .word-list-ext-cycle,
.word-list-ext-item:not(:hover) .word-list-ext-compare-btn,
.word-list-ext-item:not(:hover) .word-list-ext-related-btn {
  display: none;
}

.word-list-ext-cycle .previous {
  left: 1.5rem;
  top: 6rem;
}

.word-list-ext-cycle .next {
  right: 1.5rem;
  top: 6rem;
}

.word-list-ext-item-head .paginate-button.close {
  position: absolute;
  top: 1.5rem;
  right: 2rem;
  opacity: 0.5;
}

.word-list-ext-item-head {
  position: relative;
  height: 15rem;
  background-color: white;
}

.word-list-ext-cycle .paginate-button {
  opacity: 0.5;
  background: none;
  position: absolute;
  border: none;
  font-size: 2rem;
}
</style>
