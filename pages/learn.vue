<router>
  {
    path: '/:l1/:l2/learn/:method?/:argsProp?/:index?',
    props: true,
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div :class="{ 'bg-white pt-4': !wide }">
      <div :class="{ container: !wide }" v-cloak>
        <div :class="{ row: !wide, 'content-panes': wide }">
          <div
            :class="{
              'p-4 content-pane-left': wide,
              'col-sm-12': !wide,
            }"
          >
            <router-link
              :to="{ name: 'levels' }"
              :data-level="args[0]"
              class="mb-4 d-block text-center"
            >
              HSK Standard Course
              <i class="fa fa-chevron-right"></i>
            </router-link>
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

            <Paginator
              v-if="words && index && words[index]"
              class="mb-4 text-center"
              :items="words"
              :findCurrent="findCurrent"
              :url="url"
              :home="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`"
              :title="`Word`"
            />
            <div v-if="words && index && words[index]" class="text-center">
              <LazyEntryHeader :entry="words[index]" />
              <DefinitionsList
                :key="`def-list-${words[index].id}`"
                v-if="words[index].definitions"
                class="mt-3"
                :definitions="words[index].definitions"
              ></DefinitionsList>
            </div>
          </div>
          <div
            :class="{
              'content-pane-right pl-3 pr-3': wide,
              'col-sm-12 pt-4': !wide,
            }"
          >
            <div v-if="!index && words.length > 0" :class="{ 'p-4': wide }">
              <p class="text-center mb-4">
                Tap on any of the words below, and page through the words.
              </p>
              <WordList :words="words" :url="url"></WordList>
              <div class="mt-4">
                <router-link
                  v-if="words.length > 0"
                  :data-bg-level="args[0]"
                  class="btn btn-md m-1"
                  :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}/0`"
                >
                  <i class="fa fa-book mr-1"></i>
                  Start from the first word
                </router-link>
                <router-link
                  v-if="words.length > 0"
                  class="btn btn-gray btn-sm m-1"
                  :to="`/${$l1.code}/${$l2.code}/learn-interactive/${method}/${argsProp}`"
                >
                  Learn interactively (Legacy)
                </router-link>
              </div>
            </div>
            <div
              v-if="words && index && words[index]"
              style="position: relative; overflow: hidden"
            >
              <LazyDictionaryEntry
                :entry="words[index]"
                :showHeader="false"
                :showDefinitions="false"
                :showExample="false"
              />
            </div>
          </div>
        </div>
        <div class="text-center p-5">
          <Loader />
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import { ContainerQuery } from "vue-container-query";

export default {
  components: {
    ContainerQuery,
  },
  props: ["method", "argsProp", "index"],
  data() {
    return {
      words: [],
      args: [],
      params: {},
      query: {
        wide: {
          minWidth: 991,
        },
      },
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
    wide() {
      return this.params.wide && ["lg", "xl", "xxl"].includes(this.$mq);
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
<style lang="scss" scoped>
.content-pane-left {
  ::v-deep .definitions-many {
    columns: 1;
    margin-top: 1rem;
  }
}
</style>