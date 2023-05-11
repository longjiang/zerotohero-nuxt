<router>
  {
    path: '/:l1/:l2/my-text/',
    props: true,
  }
</router>
<template>
  <div class="main pb-5">
    <SocialHead :title="`My ${$l2.name} Text | Language Player`"
      :description="`Read ${$l2.name} text with phonetic annotation dictionary lookup. Save new words for review.`" />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="loaded">
            <div v-if="savedtexts.length > 0">
              <h4 class="mb-4 text-center">{{ $t('My Texts') }}</h4>
              <div v-for="savedText in savedtexts" :key="savedText.id" class="mb-4">
                <TextCard :text="savedText" @removed="onTextRemoved" />
              </div>
            </div>
            <div v-else class="my-text-message">
              <div v-if="!$auth.loggedIn" class="text-center alert-success p-3 pb-4 rounded mt-4 w-100">
                <p>{{ $t("To create new texts, please login.") }}</p>
                <router-link :to="{ name: 'login' }" class="btn btn-success">
                  {{ $t("Login") }}
                  <i class="fas fa-chevron-right"></i>
                </router-link>
              </div>
              <div v-else>
                <p>
                  <i18n path="This tool will annotate {l2} text with {transliteration} and a popup dictionary."
                    class="text-center mb-4">
                    <template #l2>{{ $t($l2.name) }}</template>
                    <template #transliteration>
                      <span v-if="$hasFeature('transliteration')">
                        {{
                          {
                            zh: $t("pinyin annotation"),
                            ja: $t("furigana (Japanese syllabary) annotation"),
                            ko: $t(
                              "Hanja byeonggi (Chinese character annotation)"
                            ),
                            vi: $t("Hán tự (Chinese character) annotation"),
                          }[$l2.code] || $t("phonetic transcription")
                        }}
                      </span>
                    </template>
                  </i18n>
                </p>
                <p>
                  {{
                    $t(
                      'To get started, create a new Text.'
                    )
                  }}
                </p>
              </div>
            </div>
            <div class="mt-3 text-center">
              <b-button v-if="$auth.loggedIn" class="new-button" variant="success" @click="newText">
                <span v-if="!creating">
                  <i class="fas fa-plus mr-1"></i>
                  {{ $t("New Text") }}
                </span>
                <span v-else>
                  <i class="fas fa-sync-alt"></i>
                  {{ $t("Creating...") }}
                </span>
              </b-button>
            </div>
          </div>
          <div class="text-center mt-5 mb-5" v-else>
            <Loader :sticky="true" :message="$t('Loading your text...')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      loaded: false,
      creating: false,
    };
  },
  mounted() {
    this.updateLoaded();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "savedText/LOAD") {
        console.log("savedText/LOAD mutation detected");
        this.updateLoaded();
      }
    });
    if (!this.loadedByL2?.[this.$l2.code]) {
      this.$store.dispatch("savedText/load", {
        l2: this.$l2,
        adminMode: this.$adminMode,
      });
    }
  },
  beforeDestroy() {
    this.unsubscribe();
  },
  computed: {
    ...mapState("savedText", ["loadedByL2"]),
    ...mapState("savedText", ["itemsByL2"]),
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    savedtexts() {
      return this.itemsByL2[this.$l2.code] || [];
    },
    hasLocalText() {
      if (typeof localStorage !== "undefined") {
        let localText = localStorage.getItem("zthReaderText");
        return localText;
      }
    },
  },
  methods: {
    updateLoaded() {
      this.loaded = this.loadedByL2?.[this.$l2.code];
    },
    onTextRemoved(id) {
      this.$store.dispatch("savedText/remove", { l2: this.$l2, itemId: id });
    },
    async newText() {
      this.creating = true;
      let item = await this.$store.dispatch("savedText/add", { l2: this.$l2 });
      if (item) {
        this.$router.push({
          name: "reader",
          params: { method: "shared", arg: item.id },
        });
      }
      this.creating = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.new-button {}

.zerotohero-with-mini-player {
  .new-button {
    bottom: 6rem;
  }
}

.zerotohero-not-wide {
  .new-button {
    bottom: 6rem;
  }
}

.zerotohero-not-wide.zerotohero-with-mini-player {
  .new-button {
    bottom: 11rem;
  }
}

.my-text-message {
  font-size: 1.2em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
