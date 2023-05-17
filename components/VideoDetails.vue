<template>
  <div class="video-details">
    <h5
      v-if="video.title"
      :class="{
        h5: video.title.length > 30,
        h5: video.title.length > 60,
      }"
      style="line-height: 1.5; margin-bottom: 0"
    >
      <span v-if="video" :key="`video-title-${video.title}`">
        <Annotate
          :phonetics="false"
          :buttons="true"
          v-if="$l2.code !== 'tlh' && $l2.direction !== 'rtl'"
          :showLoading="false"
          ><span>{{ video.title }}</span></Annotate
        >
        <span v-else>{{ video.title }}</span>
      </span>
    </h5>
    <div class="video-meta" v-if="video.youtube_id">
      <MediaItemStats :item="video" :showDate="true" />
      <!-- <span v-if="video.date && !isNaN(Date.parse(video.date))">
        {{ formatDate(video.date) }}
      </span>
      <span v-if="localeDescription">
        <img
          v-if="country"
          :alt="`Flag of ${country.name}`"
          :title="`Flag of ${country.name} (${country.alpha2Code})`"
          :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`"
          class="flag-icon mr-1"
          style="width: 1rem; position: relative; bottom: 0.1rem"
        />
        {{ localeDescription }}
      </span> -->
      <span>
        <a :href="`https://www.youtube.com/watch?v=${video.youtube_id}`" target="_blank">YouTube</a>
      </span>
      <span v-if="video.channel">
        <router-link
          :to="{
            name: 'youtube-channel',
            params: {
              channel_id: video.channel.id,
              title: video.channel.title || undefined,
            },
          }"
        >
          {{ video.channel.title || $t("Channel") }}
        </router-link>
      </span>
      <template
        v-if="video.category === 10 || video.tv_show?.title === 'Music'"
      >
        <span>
          <a
            :href="`https://play.spotify.com/search/${encodeURIComponent(
              video.title
            )}`"
            target="_blank"
          >
            Spotify
          </a>
        </span>
        <span>
          <a
            :href="`https://music.apple.com/us/search?term=${encodeURIComponent(
              video.title
            )}`"
            target="_blank"
          >
            Apple Music
          </a>
        </span>
      </template>
      <span>
        <a
          :href="`https://downsub.com/?url=https://www.youtube.com/watch?v=${video.youtube_id}`"
          target="_blank"
        >
          {{ $t("DownSub") }}
        </a>
      </span>
      <template v-if="$adminMode && video.subs_l2 && video.subs_l2.length > 0">
        <span>
          <a
            :href="originalTextHref"
            v-if="$adminMode"
            :download="`${video.title}.txt`"
            target="_blank"
          >
            {{ $t("Transcript") }}
          </a>
        </span>
        <span>
          <a :href="translationURL" target="_blank">
            {{ $t("Translation") }}
          </a>
        </span>
        <Share class="ml-2" />
      </template>
      
      <router-link
        class="ml-2 btn btn-small bg-secondary text-white"
        v-if="$adminMode && video.tv_show"
        :to="{
          name: 'show',
          params: { type: 'tv-show', id: String(video.tv_show.id) },
        }"
      >
        <i class="fa fa-tv mr-2" />
        {{ video.tv_show.title }}
        <i
          :class="{
            'fas fa-times-circle ml-1': true,
            'd-none': !$adminMode,
          }"
          @click.stop.prevent="unassignShow('tv_show')"
        />
      </router-link>
      <router-link
        class="ml-2 btn btn-small bg-secondary text-white"
        v-if="$adminMode && video.talk"
        :to="{
          name: 'show',
          params: { type: 'talk', id: String(video.talk.id) },
        }"
      >
        <i class="fas fa-graduation-cap mr-2"></i>
        {{ video.talk.title }}
        <i
          :class="{
            'fas fa-times-circle ml-1': true,
            'd-none': !$adminMode,
          }"
          @click.stop.prevent="unassignShow('talk')"
        />
      </router-link>
    </div>
  </div>
</template>
<script>
import { makeTextFile, formatK } from "@/lib/utils";

export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
  },
  asyncComputed: {
    async country() {
      let locale = this.video.locale;
      if (locale) {
        let [langCode, countryCode] = locale.split("-");
        if (countryCode) {
          const country = await this.$languages.countryFromCode(countryCode);
          return country;
        }
      }
    },
    async language() {
      let locale = this.video.locale;
      if (locale) {
        let [langCode, countryCode] = locale.split("-");
        let language = await this.$languages.getSmart(langCode);
        return language;
      }
    },
    localeDescription() {
      let localeDescription = `${
        this.language ? this.$t(this.language.name) : ""
      }`;
      return localeDescription;
    },
  },
  computed: {
    translationURL() {
      if (typeof this.$l2 !== "undefined") {
        return this.$languages.translationURL(this.text, this.$l1, this.$l2);
      }
    },
    originalTextHref() {
      return makeTextFile(this.text);
    },
    text() {
      if (this.video.subs_l2)
        return this.video.subs_l2
          .map((line) => (line ? line.line.replace(/\n/g, " ") : ""))
          .join("\n");
    },
  },
  methods: {
    formatK(number) {
      return formatK(number, 2, this.$l1.code);
    },
    formatDate(date) {
      return this.$d(new Date(date), "short", this.$l1.code);
    },
  },
};
</script>
<style lang="scss" scoped>
.video-details {
  font-size: 0.8em;
  text-align: left;
  line-height: 2;
}

.video-meta span + span::before {
  content: " · ";
  margin: 0 0.25rem;
}

.video-engagement span + span {
  margin-left: 0.5rem;
}
</style>
