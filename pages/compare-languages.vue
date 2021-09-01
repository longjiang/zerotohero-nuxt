<router>
  {
    path: '/compare-languages',
    props: true,
    meta: {
      layout: 'full'
    }
  }
</router>
<template>
  <div>
    <SocialHead
      title="Compare Languages on a Map | Zero to Hero Languages"
      description="See on a map how people say words like 'yes', 'no', 'thanks' on a map!"
      image="/img/thumbnail-language-map.jpg"
    />
    <div class="container-fluid">
      <div
        class="row bg-dark text-white pt-2 pb-2 text-left"
        style="overflow: visible"
      >
        <div class="col-sm-12 d-flex" style="overflow: visible">
          <div
            class="d-flex align-items-center"
            style="width: 100%; justify-content: space-between"
          >
            <router-link to="/" class="link-unstyled">
              <i class="fa fa-chevron-left mr-2"></i>
              Home
            </router-link>
            <Loader
              :sticky="true"
              message="Loading common phrases"
              v-if="updating"
            />
            <div v-if="updating">
              &nbsp; <!-- dummy -->
            </div>
            <div v-if="phrases">
              {{ phrases[currentIndex].phrase }}
            </div>
            <div class="paginator" v-if="phrases">
              <b-button
                :class="{
                  'paginator-previous mr-2': true,
                  transparent: currentIndex < 1,
                }"
                variant="ghost-dark"
                size="sm"
                title="Previous phrase"
                @click="currentIndex = Math.max(0, currentIndex - 1)"
              >
                <i class="fas fa-chevron-left"></i>
              </b-button>
              {{ currentIndex + 1 }} of {{ phrases.length }}
              <b-button
                :class="{
                  'paginator-next ml-2': true,
                  transparent: currentIndex > phrases.length - 2,
                }"
                variant="ghost-dark"
                size="sm"
                title="Next phrase"
                @click="
                  currentIndex = Math.min(phrases.length - 1, currentIndex + 1)
                "
              >
                <i class="fas fa-chevron-right"></i>
              </b-button>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12" style="height: calc(100vh - 54px); padding: 0">
          <LanguageMap
            style="height: 100%"
            ref="languageMap"
            :langs="[english]"
          />
        </div>
      </div>
      <div class="similar-phrases-panel">
        <SimilarPhrases
          class="text-center"
          v-if="phrases"
          :phraseObj="phrases[currentIndex]"
          :key="`similar-phrases-${currentIndex}`"
          :autoLoad="true"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";
import Papa from "papaparse";
import Helper from "@/lib/helper";

export default {
  computed: {
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
  },
  data() {
    return {
      phrasebook: undefined,
      phrases: undefined,
      currentIndex: 0,
      updating: false,
    };
  },
  async mounted() {
    this.updating = true;
    let res = await axios.get(`${Config.wiki}items/phrasebook/283`);
    if (res && res.data) {
      let phrasebook = res.data.data;
      phrasebook.phrases = Papa.parse(phrasebook.phrases, {
        header: true,
      }).data.map((p, id) => {
        p.id = id;
        return p;
      });
      this.phrasebook = phrasebook;
      this.phrases = phrasebook.phrases;
    }
    this.updating = false;
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.similar-phrases-panel {
  background: white;
  position: fixed;
  top: calc(49px + 1rem);
  width: 20rem;
  height: calc(100vh - 49px - 2rem);
  right: 1rem;
  z-index: 999;
  border-radius: 0.25rem;
  box-shadow: 0 0 5px 10px rgba(0, 0, 0, 0.2);
  overflow-y: scroll;
  padding: 1rem;
}
</style>