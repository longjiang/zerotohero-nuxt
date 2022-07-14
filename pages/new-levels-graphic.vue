<router>
  {
    path: '/:l1/:l2/explore/new-levels-graphic',
    meta: {
      title: 'Words in the New HSK 3.0 Visualized | Language Player',
      metaTags: [
        {
          name: 'description',
          content: 'List words in the New HSK 3.0 (starting 2021–2025?) levels.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-4 pb-4" v-cloak>
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h2 class="mb-4">Words by the new HSK 3.0 (2021-2025?) levels</h2>
            <div class="mt-5 mb-5 text-center"><Loader class="mt-5" /></div>
            <span
              v-for="level in ['1', '2', '3', '4', '5', '6']"
              :key="`level-${level}`"
              class="legend"
            >
              <div
                :data-bg-level="level"
                class="word-square"
                style="margin-right: 5px"
              ></div>
              <span>Current HSK {{ level }}</span>
            </span>
            <div>
              <div
                v-for="level in ['1', '2', '3', '4', '5', '6', '7-9']"
                :key="`new-level-${level}`"
                class="word-grid"
              >
                <h4 style="clear: both; padding-top: 2rem">
                  New HSK Level {{ level }}
                </h4>
                <div class="text-center pt-3 pb-3" v-if="!ready">
                  <Loader
                    class="mt-5"
                    :sticky="true"
                    message="Seriously crunching some numbers, will take a minute..."
                  />
                </div>
                <router-link
                  v-for="(word, index) in newHSK
                    .filter((word) => word.level == level)
                    .sort((a, b) => a.simplified.length - b.simplified.length)
                    .sort((a, b) => {
                      let ahsk = a.hsk === 'outside' ? 7 : a.hsk ? a.hsk : 7;
                      let bhsk = b.hsk === 'outside' ? 7 : b.hsk ? b.hsk : 7;
                      return ahsk - bhsk;
                    })"
                  :data-bg-level="word.hsk ? word.hsk : 'outside'"
                  class="word-square link-unstyled"
                  :key="`word-level-${level}-square-${word.id}-${index}`"
                  :to="{
                    name: 'dictionary',
                    params: { method: 'hsk-cedict', args: word.id },
                  }"
                >
                  {{ word.simplified }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      newHSK: [],
      ready: false,
    };
  },
  async mounted() {
    let newHSK = await (await this.$getDictionary()).getNewHSK();
    this.newHSK = newHSK;
    this.ready = true;
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.legend {
  display: inline-block;
  overflow: hidden;
  line-height: 30px;
  margin-right: 15px;
  font-weight: bold;
}

.word-grid .word-square {
  &:hover {
    cursor: pointer;
    filter: brightness(80%);
  }
}
</style>
