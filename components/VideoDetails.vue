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
        <a :href="`https://www.youtube.com/watch?v=${video.youtube_id}`" target="_blank">View on YouTube</a>
      </span>
      <span @click="retranslate" v-if="this.video.id" class="text-success cursor-pointer">
        <template v-if="this.retranslating">{{ $t('Retranslating...') }}</template>
        <template v-else>{{ $t('Retranslate') }}</template>
      </span>
      <span v-if="video.channel && $adminMode">
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
import { makeTextFile, formatK, proxy, sanitizeFilename, PYTHON_SERVER } from "@/lib/utils";
import subsrt from 'subsrt';

export default {
  props: {
    video: {
      type: Object,
      required: true,
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
    async retranslate() {
      this.retranslating = true
      let response = await proxy(`${PYTHON_SERVER}/translate_video_and_save?l1=${this.$l1.code}&l2=${this.$l2.code}&video_id=${this.video.id}`)
      let subs_l1 = this.$subs.parseSavedSubs(response)
      console.log({subs_l1})
      this.video.subs_l1 = subs_l1
      this.$emit('updateVideo', this.video)
      this.$toast.success(
        this.$t('The subtitles have been retranslated.'),
        {
          position: "top-center",
          duration: 5000,
        }
      );
      this.retranslating = false
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
