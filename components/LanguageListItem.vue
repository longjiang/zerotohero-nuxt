<template>
  <div :class="`language-list-item language-list-item-${variant}`" @click.self="$router.push(languagePath(language))">
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
      <img
        v-if="showFlags && countryCode(language)"
        :src="`/vendor/flag-svgs/${countryCode(language)}.svg`"
        class="flag-icon"
      />
      <div
        v-if="showFlags && !countryCode(language)"
        class="no-flag-placeholder"
      ></div>
      <span class="language-list-item-name">{{ languageName(language) }}</span>
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
    showFeatures: {
      type: Boolean,
    },
    language: {
      type: Object,
    },
    variant: {
      type: String,
      default: "list", // or 'icon', 'grid'
    },
    showCode: {
      default: false,
    },
    keyword: {
      type: String,
    },
    showSpeakers: {
      type: Boolean,
      default: true,
    },
    showFlags: {
      default: false,
    },
    l1: {
      default: "en",
    },
  },
  data() {
    return {
      base: this.languagePath(this.language),
    };
  },
  methods: {
    countryCode(l2) {
      let countryCode = this.$languages.countryCode(l2);
      return countryCode;
    },
    english() {
      return this.$languages.l1s.find((language) => language.code === "en");
    },
    speakers(number) {
      return Helper.formatK(number, 1);
    },
    languagePath(language) {
      let special = Helper.specialLanguages[language.code];
      let l1 = special ? special.l1 : this.l1;
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
      let special = Helper.specialLanguages[language.code];
      if (special) name = special.name;
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

.language-list {
  .language-list-item {
    .language-list-item-speakers {
      font-size: 0.8em;
      white-space: nowrap;
      margin-left: 0.25rem;
    }
    &.language-list-item-icon {
      .flag-icon {
        margin-bottom: 0.15rem;
      }
    }
    &.language-list-item-grid {
      height: 100%;
      border: 1px solid #ddd;
      padding: 1rem;
      padding-bottom: 0.7rem;
      text-align: center;
      border-radius: 0.5rem;
      background-color: #eee;
      cursor: pointer;
      .flag-icon {
        width: 2rem;
        display: block;
        margin: 0 auto 0.5rem auto;
      }
      .no-flag-placeholder {
        height: 1.6rem;
        width: 2rem;
        background-color: #ddd;
        border-radius: 0.3rem;
        margin: 0 auto 0.5rem auto;
      }
      .language-list-item-name {
        display: block;
        font-weight: bold;
        line-height: 1.2;
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