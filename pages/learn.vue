<router>
  {
    path: '/:l1/:l2/learn/:method?/:argsProp?/:index?',
    props: true,
  }
</router>
<template>
  <div class="main pt-3 pb-5 container" v-cloak>
    <div class="row">
      <div class="col-sm-12">
        <router-link :to="{name: 'levels'}" :data-level="args[0]" class="mb-4 d-block text-center ">HSK Standard Course <i class="fa fa-chevron-right"></i></router-link>
        <router-link
          :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`"
          class="link-unstyled"
        >
          <h4 class="page-title text-center mb-4" v-if="method === 'hsk'">
            <b :data-level="args[0]" class="mr-1">HSK {{ args[0] }}</b>
            <b>Lesson {{ args[1] }}</b>
            (Part {{ args[2] }}) Vocabulary
          </h4>
        </router-link>
        <Loader class="mt-5" />
        <div v-if="!index && words.length > 0">
          <p class="text-center mb-4" >Tap on any of the words below, and page through the words.</p>
          <WordList :words="words" :url="url"></WordList>
          <router-link
            v-if="words.length > 0"
            :data-bg-level="args[0]"
            class="btn btn-md mt-4"
            :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}/0`"
          >
            <i class="fa fa-book mr-1"></i>
            Start from the first word
          </router-link>
          <router-link
            v-if="words.length > 0"
            class="btn btn-gray btn-sm mt-2"
            :to="`/${$l1.code}/${$l2.code}/learn-interactive/${method}/${argsProp}`"
          >
            Learn interactively (Legacy)
          </router-link>
        </div>
      </div>
    </div>
    <div v-if="words && index && words[index]">
      <Paginator
        class="mb-4 text-center"
        :items="words"
        :findCurrent="findCurrent"
        :url="url"
        :home="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`"
        :title="`Word`"
      />
      <DictionaryEntry :entry="words[index]" />
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList.vue";
import Questions from "@/components/Questions.vue";

export default {
  components: {
    WordList,
    Questions,
  },
  props: ["method", "argsProp", "index"],
  data() {
    return {
      words: [],
      args: [],
    };
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
  },
  created() {
    this.route();
  },
  methods: {
    async route() {
      if (this.method) {
        if (this.method === "hsk" && this.argsProp) {
          this.args = this.$route.params.argsProp.split(",");
          this.words = await (
            await this.$getDictionary()
          ).getByBookLessonDialog(this.args[0], this.args[1], this.args[2]);
          return;
        }
      }
    },
    findCurrent(word) {
      return word === this.words[this.index];
    },
    url(word, index) {
      return `/${this.$l1.code}/${this.$l2.code}/learn/${this.method}/${this.argsProp}/${index}`;
    },
  },
};
</script>
