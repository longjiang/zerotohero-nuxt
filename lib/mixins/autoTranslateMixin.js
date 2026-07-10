// mixins/autoTranslateMixin.js
import { PYTHON_SERVER } from "../utils";

/** Number of subtitle lines to translate in one API call. Change this value to adjust batch size. */
const CHUNK_SIZE = 5;

export default {
  methods: {
    /**
     * Creates a deep copy of an array to avoid Vuex mutation issues
     * @param {Array} arr - The array to copy
     * @returns {Array} A deep copy of the array
     */
    _deepCopyArray(arr) {
      return JSON.parse(JSON.stringify(arr));
    },

    /**
     * Translates all subtitle lines of a video in chunks,
     * updating the store after each chunk so the UI updates progressively.
     *
     * @param {Object} video  Video object from the store (must contain subs_l2)
     * @returns {Promise<Array>}  The full translated subtitles array
     */
    async translateSubtitlesInChunks(video) {
      if (!video?.id || !video.subs_l2?.length) return [];

      // Create a deep copy of subs_l2 to avoid mutating store state
      const subsL2 = this._deepCopyArray(video.subs_l2);
      const lines = subsL2.map(s => s.line);
      const translatedSubs = [];
      const totalLines = lines.length;
      const totalChunks = Math.ceil(totalLines / CHUNK_SIZE);

      // console.log(`🔄 Starting translation of ${totalLines} lines in ${totalChunks} chunks (${CHUNK_SIZE} lines per chunk)`);

      for (let start = 0; start < lines.length; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE, lines.length);
        const chunk = lines.slice(start, end);
        const chunkIndex = Math.floor(start / CHUNK_SIZE) + 1;

        // console.log(`📤 Sending chunk ${chunkIndex}/${totalChunks} (lines ${start + 1}-${end}):`, chunk);

        try {
          const response = await this.$axios.$post(
            `${PYTHON_SERVER}translate_array`,
            {
              texts: chunk,
              l1: this.$l1.code,
              l2: this.$l2.code,
            }
          );
          
          const translated_texts = response.translated_texts;

          // console.log(`📥 Received translation for chunk ${chunkIndex}/${totalChunks}:`, translated_texts);

          for (let i = 0; i < translated_texts.length; i++) {
            const globalIndex = start + i;
            const original = subsL2[globalIndex];
            translatedSubs[globalIndex] = {
              line: translated_texts[i],
              starttime: original.starttime,
              ...(original.duration != null && { duration: original.duration }),
            };
          }

          // Commit a deep copy to the store to avoid mutation issues
          this.$store.commit("shows/MODIFY_ITEM", {
            item: video,
            key: "subs_l1",
            value: this._deepCopyArray(translatedSubs),
          });

          // console.log(`✅ Loaded chunk ${chunkIndex}/${totalChunks} into store. Total translated lines: ${translatedSubs.filter(Boolean).length}/${totalLines}`);
        } catch (error) {
          console.error(`❌ Chunk ${chunkIndex}/${totalChunks} translation failed (lines ${start + 1}-${end}):`, error);
          throw error;
        }
      }

      console.log(`🎉 Translation complete! All ${totalLines} lines translated and loaded.`);
      return this._deepCopyArray(translatedSubs);
    },

    /**
     * Automatically translates video subtitles if auto-translate is enabled.
     * Called when a video is loaded and needs translation.
     *
     * @param {Object} video  Video object from the store
     * @returns {Promise<void>}
     */
    async performAutoTranslate(video) {
      // Use the prop (this.autoTranslate) to check if enabled
      if (!this.autoTranslate) return;
      if (!video.id || !video.subs_l2?.length) return;
      if (video.subs_l1 && video.subs_l1.length > 0) {
        console.log(`📋 Video ${video.id} already has translations, skipping.`);
        return;
      }

      console.log(`🤖 Auto-translating video ${video.id} (${video.title || 'Untitled'})`);
      this.$nuxt.$emit("retranslating", true);
      this.translating = true;

      try {
        await this.translateSubtitlesInChunks(video);
        console.log(`✨ Auto-translation completed for video ${video.id}`);
      } catch (error) {
        console.error(`💥 Auto-translation failed for video ${video.id}:`, error);
      } finally {
        this.translating = false;
        this.$nuxt.$emit("retranslating", false);
      }
    },

    /**
     * Retranslates video subtitles (triggered manually by user).
     *
     * @param {Object} video  Video object from the store
     * @returns {Promise<void>}
     */
    async retranslate(video) {
      if (!video?.id) return;
      
      console.log(`🔄 Retranslating video ${video.id} (${video.title || 'Untitled'})`);
      this.$nuxt.$emit("retranslating", true);

      try {
        await this.translateSubtitlesInChunks(video);
        console.log(`✨ Retranslation completed for video ${video.id}`);
      } catch (error) {
        console.error(`💥 Retranslation failed for video ${video.id}:`, error);
      } finally {
        this.$nuxt.$emit("retranslating", false);
      }
    },
  },
};