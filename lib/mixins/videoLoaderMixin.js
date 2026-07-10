// mixins/videoLoaderMixin.js
import YouTube from "../youtube";
import Vue from "vue";
import { PYTHON_SERVER, level, levelByDifficulty } from "../utils";

export default {
  methods: {
    showDifficultyToast() {
      if (this.video?.difficulty) {
        const l = levelByDifficulty(this.video.difficulty, this.$l2.code);
        const levelName = level(l, this.$l2).name;
        this.$toast.show(
          this.$tb("This is a {level} level video.", { level: levelName }),
          {
            position: "top-center",
            className: `bg-level${l}`,
            containerClass: "safe-padding-top",
            iconPack: "custom-class",
            icon: "fa-solid fa-signal-bars mr-1",
            duration: 3000,
          }
        );
      }
    },
    async loadVideo(youtube_id, directus_id) {
      this.video = { youtube_id };
      this.checkingSubs = true;
      try {
        const video = await this.getVideoFromDB(youtube_id, directus_id);
        this.video = video || this.video;
        this.loadTokenizationServerCache(video);

        if (this.video.tv_show || this.video.talk) this.loadShowAndEpisodes();

        await this.loadTranscriptLocalesFromYouTube(this.video);
        await Promise.all([
          this.loadMissingSubsFromYouTube(this.video),
          this.loadMissingMetaFromYouTube(this.video),
        ]);
        await this.autoTranslate(this.video);
      } catch (err) {
        console.error(err);
      }
      this.checkingSubs = false;
    },
    async loadTokenizationServerCache(video) {
      if (!video?.id) return;
      let url = `${PYTHON_SERVER}lemmatize-video?video_id=${video.id}&lang=${this.$l2.code}`;
      const data = await this.$axios.get(url).then((res) => res.data);
      if (data && typeof data === "object" && Object.keys(data).length > 0) {
        const dictionary = await this.$getDictionary();
        dictionary.loadTokenizationServerCache(data);
      }
    },
    async getVideoFromDB(youtube_id, directus_id) {
      let video;
      if (directus_id) {
        video = await this.$directus.getVideo({ id: directus_id, l2Id: this.$l2.id });
        if (youtube_id && video?.youtube_id !== youtube_id) video = null;
      }
      if (!video && youtube_id) {
        let videos = await this.$directus.getVideos({
          l2Id: this.$l2.id,
          subs: true,
          query: `filter[youtube_id][eq]=${youtube_id}`,
        });
        if (videos?.length > 0) video = videos[0];
      }
      if (video) {
        for (let field of ["subs_l2", "subs_l1"]) {
          if (video[field] && typeof video[field] === "string") {
            let savedSubs = this.$subs.parseSavedSubs(video[field]);
            if (savedSubs) {
              video[field] = savedSubs.filter(
                (line) => line && typeof line.starttime !== "undefined" && line.line
              );
            }
          }
        }
        if (video.notes) video.notes = this.$subs.parseNotes(video.notes);
        if (!video.channel && video.channel_id) video.channel = { id: video.channel_id };
        video.checkingSubs = false;
        return video;
      }
    },
    async getSubs({ youtube_id, locale, name, generated = false }) {
      let forceRefresh = this.$adminMode;
      let subs = await YouTube.getTranscript(youtube_id, locale, name, forceRefresh, generated);
      return subs;
    },
    async loadTranscriptLocalesFromYouTube(video) {
      if (!(video?.subs_l2?.length > 0) || !(video?.subs_l1?.length > 0)) {
        let { l1Locale, l2Locale, l2Name } = await YouTube.getTranscriptLocales(
          video.youtube_id,
          this.$l1,
          this.$l2
        );
        this.l1Locale = l1Locale;
        this.l2Locale = l2Locale;
        this.l2Name = l2Name;
      }
    },
    async loadMissingSubsFromYouTube(video) {
      let generated = false;
      if (!(video?.[`subs_l2`]?.length > 0)) {
        let locale = this[`l2Locale`];
        generated = locale ? false : true;
        let subs = await this.getSubs({
          youtube_id: video.youtube_id,
          locale: this[`l2Locale`] || this[`$l2`].code,
          name: this[`l2Name`],
          generated,
        });
        if (subs && subs.length > 0)
          this.$store.commit("shows/MODIFY_ITEM", { item: video, key: `subs_l2`, value: subs });
        this.$emit(`l2TranscriptLoaded`);
      }
    },
    async loadMissingMetaFromYouTube(video) {
      const properties = [
        "category", "comments", "date", "duration", "likes", "channel",
        "locale", "made_for_kids", "tags", "title", "views", "description",
      ];
      if (!properties.every((property) => property in this.video)) {
        const videoData = await YouTube.videoByApi(this.youtube_id);
        if (videoData)
          properties.forEach((property) => {
            if (!video[property] && videoData[property]) Vue.set(video, property, videoData[property]);
          });
      }
    },
  },
};