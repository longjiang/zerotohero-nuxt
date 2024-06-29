<template>
  <div class="video-details">
    <h5
      v-if="showTitle && video.title"
      :class="{
        h5: video.title.length > 30,
        h5: video.title.length > 60,
      }"
      style="line-height: 1.5; margin-bottom: 0"
    >
      <span v-if="video" :key="`video-title-${video.title}`">
        <TokenizedRichText
          v-if="$l2.code !== 'tlh' && $l2.direction !== 'rtl'"
          :phonetics="false"
          :showMenu="true"
          :text="video.title"
          :showLoading="false"
          />
        <span v-else>{{ video.title }}</span>
      </span>
    </h5>
    <div class="video-meta" v-if="video.youtube_id">
      <MediaItemStats :item="video" :showDate="true" />
      <!-- <span v-if="video.date && !isNaN(Date.parse(video.date))">
        {{ formatDate(video.date) }}
      </span> -->
      <span>
        <a :href="`https://www.youtube.com/watch?v=${video.youtube_id}`" target="_blank"><i class="fab fa-youtube"></i></a>
      </span>
      <template
        v-if="video.category == 10 || (video.tv_show && video.tv_show.title) === 'Music'"
      >
        <span>
          <a
            :href="`https://play.spotify.com/search/${encodeURIComponent(
              video.title
            )}`"
            target="_blank"
          >
            <i class="fab fa-spotify"></i>
          </a>
        </span>
        <span>
          <a
            :href="`https://music.apple.com/us/search?term=${encodeURIComponent(
              video.title
            )}`"
            target="_blank"
          >
            <i class="fab fa-apple"></i>
          </a>
        </span>
      </template>
      <span @click="retranslate" v-if="this.video.id" class="text-success cursor-pointer">
        <b-spinner small v-if="retranslating" />
        <template v-else>{{ $t('Retranslate') }}</template>
      </span>
      <span v-if="video.channel && $adminMode">
        <router-link
          :to="{
            name: 'l1-l2-youtube-channel',
            params: {
              channel_id: video.channel.id,
              title: video.channel.title || undefined,
            },
          }"
        >
          {{ video.channel.title || $t("Channel") }}
        </router-link>
      </span>
      <span>
        <span @click="downloadSubtitles" class="text-primary cursor-pointer">{{ $t('Download Subs') }}</span>
      </span>
      <AddToPlaylist :video="video" class="text-primary" />
      <Share class="ml-2" />
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
      </template>
    </div>
  </div>
</template>
<script>
import { makeTextFile, formatK, proxy, sanitizeFilename, PYTHON_SERVER } from "../lib/utils";
import subsrt from 'subsrt';

export default {
  props: {
    video: {
      type: Object,
      required: true,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      retranslating: false,
    }
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
  created() {
    this.$nuxt.$on("retranslating", (retranslating) => {
      this.retranslating = retranslating;
    });
  },
  destroyed() {
    this.$nuxt.$off("retranslating");
  },
  methods: {
    retranslate() {
      this.$emit("retranslate", this.video)
    },
    formatK(number) {
      return formatK(number, 2, this.$l1.code);
    },
    formatDate(date) {
      return this.$d(new Date(date), "short", this.$l1.code);
    },
    downloadSubtitles() {
      let captions = this.video.subs_l2.map((item, i) => ({
        id: i + 1,
        start: item.starttime * 1000,
        end: (item.starttime + item.duration) * 1000,
        text: item.line
      }));

      let srt = subsrt.build(captions);

      // create a Blob from the SRT string
      let blob = new Blob([srt], { type: 'text/plain' });
      let url = URL.createObjectURL(blob);

      // create a hidden link to download the file and simulate a click on it
      let link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizeFilename(this.video.title || this.video.youtube_id || $t('Subtitles'))}.srt`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // clean up by revoking the object URL and removing the link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
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
