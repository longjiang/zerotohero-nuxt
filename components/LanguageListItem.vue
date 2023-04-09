<template>
  <div
    @mouseover="cycleFlags"
    @mouseleave="stopCycling"
    :autocycle="false"
    :class="`language-list-item language-list-item-${variant}`"
    @click.self="$router.push(languagePath(language))"
  >
    <span class="language-list-item-features" v-if="showFeatures">
      <router-link
        :to="{
          name: 'live-tv',
          params: { l1: from || english, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasLiveTV(from || english, language),
        }"
        title="Live TV"
      >
        <i class="fa fa-tv-retro" />
      </router-link>
      <router-link
        :to="{
          name: 'explore-media',
          params: { l1: from || english, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasYouTube(from || english, language),
        }"
        title="Videos"
      >
        <i class="fa fa-play-circle" />
      </router-link>
      <router-link
        :to="{
          name: 'dictionary',
          params: { l1: from || english, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasDictionary(from || english, language),
        }"
        title="Dictionary"
      >
        <i class="fas fa-book" />
      </router-link>
      <span
        v-if="
          variant === 'icon' &&
          showSpeakers &&
          language.speakers &&
          language.speakers > 0
        "
        class="language-list-item-speakers"
      >
        {{ formatSpeakers(language.speakers) }}
      </span>
    </span>
    <router-link :to="base">
      <div class="flag-badge-wrapper" v-if="showFlags">
        <div class="badge" v-if="badge && badge !== 0">{{ badge }}</div>
        <LanguageFlag :language="language" ref="flag" class="l2-flag" />
        <LanguageFlag
          :language="from"
          ref="l1Flag"
          class="l1-flag"
          :autocycle="true"
          v-if="from && from.code !== 'en'"
        />
      </div>

      <span class="language-list-item-name">
        {{ $languages.translate(languageName(language), from["iso639-3"]) }}
        <div class="badge" v-if="!showFlags && badge && badge !== 0">
          {{ badge }}
        </div>
      </span>
      <span
        class="language-list-item-from-name"
        v-if="from && from.code !== 'en'"
      >
        ({{
          $languages.translate(
            `from ${this.languageName(from)}`,
            from["iso639-3"]
          )
        }})
      </span>
      <span
        v-if="keyword && language.otherNames.length > 0"
        class="language-list-item-other-names"
      >
        ({{ language.otherNames.slice(0, 1).join(", ") }})
      </span>
      <span v-if="showCode" class="language-list-item-code">
        ({{ language.code }})
      </span>
    </router-link>
    <span
      v-if="
        variant === 'list' &&
        showSpeakers &&
        language.speakers &&
        language.speakers > 0
      "
      class="language-list-item-speakers"
    >
      {{ $t("{num} Speakers", { num: formatSpeakers(language.speakers) }) }}
    </span>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: {
    language: {
      type: Object, // the L2.
    },
    from: {
      type: Object, // the L1.
    },
    keyword: {
      type: String,
    },
    badge: {
      type: Number,
    },
    variant: {
      type: String,
      default: "list", // or 'icon', 'grid'
    },
    showFeatures: {
      type: Boolean,
    },
    showCode: {
      default: false,
    },
    showSpeakers: {
      type: Boolean,
      default: true,
    },
    showFlags: {
      default: false,
    },
  },
  data() {
    return {
      base: this.languagePath(this.language),
    };
  },
  mounted() {
    // this.cycleFlags()
  },
  computed: {
    english() {
      let english = this.$languages.l1s.find(
        (language) => language.code === "en"
      );
      return english;
    },
    browserLanguage() {
      if (process.browser) {
        let code = navigator.language.replace(/-.*/, "");
        return code;
      }
      return "en";
    },
  },
  methods: {
    translate(text, data = {}) {
      let code = this.browserLanguage;
      if (this.$languages) return this.$languages.translate(text, code, data);
      else return text;
    },
    cycleFlags() {
      if (this.$refs.flag) this.$refs.flag.cycleFlags();
    },
    stopCycling() {
      if (this.$refs.flag) this.$refs.flag.stopCycling();
    },
    formatSpeakers(number) {
      return Helper.formatK(number, 1, this.browserLanguage);
    },
    languagePath(language) {
      return `/${this.from ? this.from.code : "en"}/${
        language.code
      }/explore-media`;
    },
    hasDictionary(l1, l2) {
      return (
        this.$languages.hasFeature(l1, l2, "dictionary") || l2.code === "en"
      );
    },
    hasYouTube(l1, l2) {
      return this.$languages.hasYouTube(l1, l2);
    },
    hasLiveTV(l1, l2) {
      return this.$languages.hasFeature(l1, l2, "live-tv");
    },
    languageName(language) {
      let name = this.translate(language.name.replace(/ \(.*\)/gi, ""));
      return name;
    },
  },
};
</script>

<style lang="scss" scoped>
a:hover,
a:active {
  text-decoration: none;
}
.badge {
  color: white;
  background: red;
  border-radius: 100%;
  height: 2em;
  width: 2em;
  line-height: 1.5em;
  font-size: 0.6rem;
}

.language-list {
  .language-list-item {
    .flag-badge-wrapper {
      position: relative;
      display: inline-block;
      .badge {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
      }
    }
    .language-list-item-name {
      .badge {
        position: relative;
        bottom: 0.1rem;
      }
    }
    .language-list-item-speakers {
      font-size: 0.8em;
      white-space: nowrap;
      margin-left: 0.25rem;
    }
    &.language-list-item-grid {
      height: 100%;
      border: 1px solid #ddd;
      padding: 1rem 0;
      padding-bottom: 0.7rem;
      text-align: center;
      border-radius: 0.5rem;
      background-color: #eee;
      cursor: pointer;
      .language-list-item-from-name,
      .language-list-item-name {
        display: block;
        font-weight: bold;
        line-height: 1.2;
        font-size: 0.75em;
      }
      .language-list-item-from-name {
        font-weight: inherit;
        margin-top: 0.1rem;
      }
      .l1-flag {
        transform: scale(0.6);
        position: absolute;
        bottom: -30%;
        right: -30%;
        :deep(.flag-icon) {
          border: 2px solid white;
        }
      }
      :deep(.flag-icon-wrapper) {
        margin-bottom: 0.5rem;
      }
      &:hover {
        background-color: white;
      }
    }
  }

  &.language-list-light {
    .language-list-item {
      a {
        color: hsla(14deg 98% 10% / 80%);
      }
      .feature-icon {
        color: hsla(14deg 98% 10% / 60%);
      }
      .language-list-item-speakers {
        color: hsla(14deg 98% 10% / 40%);
      }
    }
  }

  &.language-list-dark {
    .language-list-item {
      a {
        color: rgba(255, 255, 255, 0.8);
      }
      .feature-icon {
        color: rgba(255, 255, 255, 0.6);
      }
      .language-list-item-speakers {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }

  &.language-list-icon {
    .language-list-item {
      display: table;
      width: 100%;
      .language-list-item-name {
        display: table-header-group;
      }
      .language-list-item-features {
        display: table-footer-group;
        line-height: 0.8;
        .feature-icon {
          font-size: 0.8em;
          &.transparent {
            display: none;
          }
        }
        .language-list-item-speakers {
          margin: 0;
        }
      }
    }
  }
}
</style>
