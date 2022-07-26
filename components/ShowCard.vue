<template>
  <div style="padding-bottom: 2rem">
    <div class="deck3"></div>
    <div class="deck2"></div>
    <div class="deck1"></div>
    <div
      :class="{
        'tv-show-card media': true,
        'tv-show-card-hidden': show.hidden,
      }"
    >
      <router-link
        class="youtube-thumbnail-wrapper aspect-wrapper d-block"
        :to="path(show)"
      >
        <img
          :src="`https://img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
          class="youtube-thumbnail aspect"
        />
      </router-link>
      <div class="tv-show-card-title">
        <router-link :to="path(show)" class="link-unstyled">
          <h6 class="mb-0">
            {{ show.title }}
            <span
              v-if="show.level"
              :data-bg-level="levels[show.level].level"
              class="level-tag"
            >
              {{ levels[show.level].name }}
            </span>
          </h6>
        </router-link>
        <div class="statistics">
          <span v-if="show.avg_views">
            <i class="fa-solid fa-eye"></i>
            {{ formatK(show.avg_views) }}
          </span>
          <span v-if="show.locale">
            <img
              v-if="country"
              :alt="`Flag of ${country.name}`"
              :title="`Flag of ${country.name} (${country.alpha2Code})`"
              :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`"
              class="flag-icon mr-1"
              style="width: 1rem; position: relative; bottom: 0.1rem"
            />
            {{ localeDescription }}
          </span>
        </div>
        <div v-if="$adminMode">
          <b-button
            v-if="$adminMode"
            size="sm"
            class="admin-hide-button"
            @click.stop.prevent="toggle(show, 'hidden')"
          >
            <i class="far fa-eye" v-if="show.hidden"></i>
            <i class="far fa-eye-slash" v-else></i>
          </b-button>
          <b-button
            v-if="$adminMode"
            size="sm"
            class="admin-audiobook-button"
            @click.stop.prevent="toggle(show, 'audiobook')"
          >
            <i class="fa fa-microphone" v-if="show.audiobook"></i>
            <i class="fa fa-microphone-slash" v-else></i>
          </b-button>
          <b-button
            v-if="$adminMode"
            size="sm"
            class="admin-remove-button"
            @click.stop.prevent="remove(show)"
          >
            <i class="fa fa-trash"></i>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { languageLevels, formatK } from "@/lib/utils";
import Vue from "vue";
export default {
  data() {
    return {
      localeDescription: undefined,
      country: undefined,
      language: undefined,
    };
  },
  props: {
    show: {
      type: Object,
    },
    type: {
      type: String, // 'tvShows' or 'talks'
    },
  },
  computed: {
    levels() {
      return languageLevels(this.$l2);
    },
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
  async mounted() {
    if (this.show?.locale) {
      let { country, language, description } = await this.getLocaleDescription(
        this.show.locale
      );
      if (description) this.localeDescription = description;
      if (country) this.country = country;
      if (language) this.language = language;
    }
  },
  methods: {
    formatK(number) {
      return formatK(number);
    },
    async getLocaleDescription(locale) {
      let language, country;
      let [langCode, countryCode] = locale.split("-");
      language = await this.$languages.getSmart(langCode);
      if (countryCode) {
        country = await this.$languages.countryFromCode(countryCode);
      }
      let description = `${language ? language.name : ""}`;
      if (country) description += ` (${country.name})`;
      return { country, language, description };
    },
    async remove(show) {
      if (
        confirm(
          `Are you sure you want to remove the show "${show.title} (${show.id})?"`
        )
      ) {
        this.$store.dispatch("shows/remove", {
          l2: this.$l2,
          type: this.type,
          show,
        });
      }
    },
    path(show) {
      return `/${this.$l1.code}/${this.$l2.code}/show/${
        this.slug
      }/${encodeURIComponent(show.id)}`;
    },
    async toggle(show, property) {
      let toggled = !show[property]; // If true, make it false, and vice versa
      let path = `items/${this.field}s/${show.id}`;
      let payload = {};
      payload[property] = toggled;
      let response = await this.$directus.patch(path, payload, {
        contentType: "application/json",
      });
      if (response && response.data.data) {
        Vue.set(show, property, toggled);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.deck1,
.deck2,
.deck3 {
  height: 4rem;
  position: absolute;
  left: 1rem;
  width: calc(100% - 2rem);
  border-radius: 0.25rem;
  background-color: #767676;
  border: 1px solid rgb(138, 138, 138);
  box-shadow: 1px -3px 4px #00000070;
}
.col-compact {
  .deck1,
  .deck2,
  .deck3 {
    left: 0.5rem;
    width: calc(100% - 1rem);
  }
  .deck1 {
    top: 0;
  }
  .deck2 {
    top: -0.5rem;
  }
  .deck3 {
    top: -1rem;
  }
}
.deck1 {
  top: -0.5rem;
  transform: scale(0.95);
}
.deck2 {
  top: -1rem;
  transform: scale(0.9);
  opacity: 0.66;
}
.deck3 {
  top: -1.4rem;
  transform: scale(0.85);
  opacity: 0.33;
}
.col-compact {
  padding: 0.5rem;
  ::v-deep .media-body {
    font-size: 0.9em;
  }
}
.show-tag {
  font-size: 0.8em;
  color: #888;
}
.show-tags {
  line-height: 1;
}
.tv-show-card {
  position: relative;
  height: 100%;
  &.tv-show-card-hidden {
    opacity: 0.3;
  }
  .youtube-thumbnail {
    border-radius: 0.25rem;
  }
  .tv-show-card-title {
    padding-top: 0.5rem;
    color: #fff;
    a {
      z-index: 1;
      width: 100%;
    }
  }
}

.level-tag {
  font-size: 0.7em;
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.1rem 0.5rem;
  position: relative;
  bottom: 0.1rem;
}

.statistics {
  opacity: 0.5;
  font-size: 0.8em;
  margin-top: 0.25rem;
}

.statistics span + span::before {
  content: " · ";
  margin: 0 0.25rem;
}
</style>