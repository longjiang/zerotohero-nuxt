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
          params: { l1: l1, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasLiveTV(english, language),
        }"
        title="Live TV"
      >
        <i class="fa fa-broadcast-tower" />
      </router-link>
      <router-link
        :to="{
          name: 'all-media',
          params: { l1: l1, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasYouTube(english, language),
        }"
        title="Videos"
      >
        <i class="fa fa-play-circle" />
      </router-link>
      <router-link
        :to="{
          name: 'dictionary',
          params: { l1: l1, l2: language.code },
        }"
        :class="{
          'feature-icon mr-1': true,
          transparent: !hasDictionary(english, language),
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
        {{ speakers(language.speakers) }}
      </span>
    </span>
    <router-link :to="base">
      <div class="flag-badge-wrapper" v-if="showFlags">
        <div class="badge" v-if="badge && badge !== 0">{{ badge }}</div>
        <LanguageFlag :language="language" ref="flag" />
      </div>

      <span class="language-list-item-name">
        {{ languageName(language) }}
        <div class="badge" v-if="!showFlags && badge && badge !== 0">
          {{ badge }}
        </div>
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
      {{ speakers(language.speakers) }} Speakers
    </span>
  </div>
</template>

<script>
import Helper from "@/lib/helper";
export default {
  props: {
    language: {
      type: Object,
    },
    l1: {
      default: "en",
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
  },
  methods: {
    cycleFlags() {
      if (this.$refs.flag) this.$refs.flag.cycleFlags();
    },
    stopCycling() {
      if (this.$refs.flag) this.$refs.flag.stopCycling();
    },
    speakers(number) {
      return Helper.formatK(number, 1);
    },
    languagePath(language) {
      let l1 = this.l1
      return `/${l1}/${language.code}/all-media`;
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
      let name = language.name.replace(/ \(.*\)/gi, "");
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
      .language-list-item-name {
        display: block;
        font-weight: bold;
        line-height: 1.2;
        font-size: 0.75em;
      }
      ::v-deep .flag-icon-wrapper {
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