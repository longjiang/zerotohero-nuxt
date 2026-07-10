// mixins/autoTranslateMixin.js
import { PYTHON_SERVER } from "../utils";

export default {
  methods: {
    async autoTranslate(video) {
      if (!this.autoTranslate) return;
      if (!video.id || !video.subs_l2?.length) return;
      if (video.subs_l1 && video.subs_l1.length > 0) return;
      console.log(`Auto-translating video ${video.id}`);
      this.$nuxt.$emit("retranslating", true);
      this.translating = true;
      try {
        let url = `${PYTHON_SERVER}translate_video_and_save?l1=${this.$l1.code}&l2=${this.$l2.code}&video_id=${video.id}`;
        let csvData = await this.$axios.get(url).then((res) => res.data);
        if (!csvData || typeof csvData !== 'string') throw new Error('Invalid response');
        let subs_l1 = this.$subs.parseSavedSubs(csvData);
        if (!subs_l1) throw new Error('Failed to parse');
        this.$store.commit("shows/MODIFY_ITEM", { item: video, key: "subs_l1", value: subs_l1 });
        this.$toast.success(this.$t('Subtitles have been automatically translated.'), {
          position: "top-center", duration: 3000,
        });
      } catch (error) {
        console.error('Auto-translation failed:', error);
        if (error.message !== 'Invalid response') {
          this.$toast.error(this.$t('Failed to auto-translate subtitles.'), {
            position: "top-center", duration: 5000,
          });
        }
      } finally {
        this.translating = false;
        this.$nuxt.$emit("retranslating", false);
      }
    },
    async retranslate(video) {
      if (!video?.id) return;
      this.$nuxt.$emit("retranslating", true);
      let url = `${PYTHON_SERVER}translate_video_and_save?l1=${this.$l1.code}&l2=${this.$l2.code}&video_id=${video.id}`;
      let jsonOrCSV = await this.$axios.get(url).then((res) => res.data).catch((err) => err);
      if (!jsonOrCSV || typeof jsonOrCSV !== 'string') {
        console.error(`${url} responded with:`, jsonOrCSV);
      }
      let subs_l1 = this.$subs.parseSavedSubs(jsonOrCSV);
      if (!subs_l1) {
        this.$toast.error(this.$t('Failed to retranslate subtitles.'), { position: "top-center", duration: 5000 });
        this.$nuxt.$emit("retranslating", false);
        return;
      }
      this.$store.commit("shows/MODIFY_ITEM", { item: video, key: "subs_l1", value: subs_l1 });
      this.$toast.success(this.$t('The subtitles have been retranslated.'), { position: "top-center", duration: 5000 });
      this.$nuxt.$emit("retranslating", false);
    },
  },
};