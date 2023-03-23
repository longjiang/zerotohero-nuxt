<router>
  {
    path: '/:l1/:l2/learn/:method?/:argsProp?/:index?',
    props: true,
  }
</router>
<template>
  <container-query :query="query" v-model="params">
    <div :class="{ 'bg-white pt-4': !wide }">
      <SocialHead :title="`${$l2.name} Word List | Language Player`" />
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
              v-if="method === 'hsk'"
            >
              <i class="fa fa-chevron-left"></i>
              {{ $t("HSK Standard Course") }}
            </router-link>
            <component
              class="h3 mb-4 d-block text-center text-secondary"
              :is="index ? 'router-link' : 'span'"
              :data-level="args[0]"
              :to="{
                path: `/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`,
              }"
              v-else
            >
              <i class="fa fa-chevron-left" v-if="index"></i>
              {{ $t("Word List") }}
            </component>
            <router-link
              :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`"
              class="link-unstyled"
            >
              <h4 class="page-title text-center mb-4" v-if="method === 'hsk'">
                <b :data-level="args[0]" class="mr-1">HSK {{ args[0] }}</b>
                <b>{{ $t("Lesson {num}", { num: args[1] }) }}</b>
                ({{ $t("Part {num}", { num: args[2] }) }})
                {{ $t("Vocabulary") }}
              </h4>
            </router-link>
            <div class="text-center" v-if="!index">
              <button
                v-if="words.length > 0"
                data-level="hsk1"
                class="btn btn-sm mr-1 bg-warning text-white"
                @click="saveAllClick"
              >
                <i class="far fa-star mr-1"></i>
                {{ $t("Save All") }}
              </button>
              <router-link
                v-if="words.length > 0"
                class="btn btn-sm mr-1 text-white"
                :data-bg-level="method === 'hsk' ? args[0] : 'outside'"
                :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}/0`"
              >
                <i class="fa fa-cards-blank mr-1"></i>
                {{ $t("Flashcards") }}
              </router-link>
            </div>

            <div v-if="words && index && words[index]" class="text-center">
              <Star :word="words[index]" class="ml-1 mr-1" />
              <Paginator
                v-if="words && index && words[index]"
                class="d-inline-block mb-4 text-center"
                :items="words"
                :findCurrent="findCurrent"
                :url="url"
                :home="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}`"
              />
              <Flashcard>
                <template v-slot:front>
                  <div>
                    <LazyEntryHeader
                      :entry="words[index]"
                      :hidePhonetics="true"
                      :disabled="true"
                    />
                    <DefinitionsList
                      :key="`def-list-${words[index].id}`"
                      v-if="words[index].definitions"
                      class="mt-3 transparent"
                      :definitions="words[index].definitions"
                    ></DefinitionsList>
                  </div>
                </template>
                <template v-slot:back>
                  <div>
                    <LazyEntryHeader :entry="words[index]" :disabled="true" />
                    <DefinitionsList
                      :key="`def-list-${words[index].id}`"
                      v-if="words[index].definitions"
                      class="mt-3"
                      :definitions="words[index].definitions"
                    ></DefinitionsList>
                  </div>
                </template>
              </Flashcard>
              <EntryCourseAd
                v-if="$l2.code === 'zh'"
                variant="compact"
                class="focus-exclude mt-4"
                :entry="words[index]"
              ></EntryCourseAd>
            </div>
          </div>
          <div
            :class="{
              'content-pane-right pl-3 pr-3': wide,
              'col-sm-12 pt-4': !wide,
            }"
          >
            <div v-if="!index && words.length > 0" :class="{ 'p-4': wide }">
              <WordList :words="words" :url="url" ref="wordList"></WordList>
              <div class="mt-4">
                <router-link
                  v-if="words.length > 0"
                  :data-bg-level="method === 'hsk' ? args[0] : 'outside'"
                  class="btn btn-md m-1"
                  :to="`/${$l1.code}/${$l2.code}/learn/${method}/${argsProp}/0`"
                >
                  <i class="fa fa-cards-blank mr-1"></i>
                  {{ $t("Flashcards") }}
                </router-link>
                <router-link
                  v-if="words.length > 0"
                  class="btn btn-gray btn-sm m-1"
                  :to="`/${$l1.code}/${$l2.code}/learn-interactive/${method}/${argsProp}`"
                >
                  Learn (Legacy)
                </router-link>
              </div>
            </div>
            <div
              v-if="words && index && words[index]"
              style="position: relative; overflow: hidden"
            >
              <LazyDictionaryEntry
                :entry="words[index]"
              />
              <LookUpIn
                :term="words[index].head"
                :sticky="false"
                class="text-center"
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
  mounted() {
    this.route();
  },
  methods: {
    saveAllClick() {
      let wordList = this.$refs.wordList;
      if (wordList) {
        let buttons = wordList.$el.querySelectorAll(".not-saved");
        buttons.forEach((b) => b.click());
      }
    },
    async route() {
      if (this.method) {
        if (this.method === "hsk" && this.argsProp) {
          this.args = this.$route.params.argsProp.split(",");
          this.words = await (
            await this.$getDictionary()
          ).getByBookLessonDialog(this.args[0], this.args[1], this.args[2]);
          return;
        }
        if (this.method === "adhoc" && this.argsProp) {
          this.args = this.$route.params.argsProp.split(",");
          let dictionary = await this.$getDictionary();
          let words = [];
          for (let word of this.args) {
            let r = await dictionary.lookup(word);
            if (r) words.push(r);
          }
          this.words = words;
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
  :deep(.definitions-many) {
    columns: 1;
    margin-top: 1rem;
  }
}
</style>