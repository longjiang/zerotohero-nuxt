<router>
  {
    path: '/:l1/:l2/language-info',
    props: true,
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12" style="max-width: 50rem; margin: 0 auto">
          <div v-if="$route.params.l1 && $route.params.l1 && $l1 && $l2">
            <div class="pb-2">
              <h4 class="text-center mb-4">
                About the {{ $l2.name }} Language
              </h4>
              <LazyLanguageInfoBox :lang="$l2" class="mb-4" />
              <p>
                <b>ISO639-1:</b>
                {{ $l2["iso639-1"] || "Not available" }}
              </p>
              <p>
                <b>ISO639-3:</b>
                {{ $l2["iso639-3"] || "Not available" }}
              </p>
              <p>
                <b>Language ID:</b>
                {{ $l2.id || "Not available" }}
              </p>
              <p>
                <b>Scripts used:</b>
                {{
                  $l2.scripts
                    ? $l2.scripts.map((s) => s.script).join(", ")
                    : "Not available"
                }}
              </p>
              <p>
                <b>Number of Speakers:</b>
                {{ $l2.speakers ? $n($l2.speakers) : "Not available" }}
              </p>
              <p>
                <b>Speakers native to:</b>
                <span
                  v-for="c in $l2.country"
                  :key="`lang-country-${c.alpha2Code}`"
                  style="margin-right: 0.5rem"
                >
                  <img
                    :src="`/vendor/flag-svgs/${c.alpha2Code}.svg`"
                    class="flag-icon mr-1"
                  />
                  {{ c.name }}
                </span>
              </p>
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
              <h4 class="text-center mb-4">Dialects of Chinese</h4>
              <p class="text-center">Bar graph shows number of speakers.</p>
              <Dialects skin="light" />
            </div>
            <div class="pb-2 pt-5" v-if="$l2.han">
              <h4 class="text-center">56 Ethnic Groups of China</h4>
              <p class="text-center">
                Bar graph shows number of speakers. (2010 Numbers)
              </p>
              <FiftySixEthnic skin="light" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";

export default {
  data() {
    return {};
  },
  async mounted() {},
  beforeDestroy() {},
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
::v-deep .synced-transcript {
  height: 5rem;
  overflow: hidden;
}

h3 {
  position: relative;
  font-size: 1.3rem;
}

.show-all {
  font-size: 1rem;
  margin-left: 1rem;
  display: inline-block;
  color: #28a745;
}
</style>