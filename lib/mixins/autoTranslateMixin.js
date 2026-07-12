// mixins/autoTranslateMixin.js
import { PYTHON_SERVER } from "../utils";

/** Number of subtitle lines to translate in one API call. Change this value to adjust batch size. */
const CHUNK_SIZE = 5;

/** Tracks video IDs that have already been translated in the current SPA session. */
const translatedInSession = new Set();

export default {
  data() {
    return {
      // Holds the AbortController for the currently running translation
      translationAbortController: null,
    };
  },
  methods: {
    /**
     * Creates a deep copy of an array to avoid Vuex mutation issues
     */
    _deepCopyArray(arr) {
      return JSON.parse(JSON.stringify(arr));
    },

    /**
     * Cancels any ongoing translation by aborting its controller.
     */
    cancelTranslation() {
      if (this.translationAbortController) {
        this.translationAbortController.abort();
        this.translationAbortController = null;
        console.log("🛑 Translation cancelled by user navigation or new request.");
      }
    },

    /**
     * Translates all subtitle lines of a video in chunks,
     * updating the store after each chunk so the UI updates progressively.
     * Respects an AbortController so it can be stopped early.
     */
    async translateSubtitlesInChunks(video) {
      if (!video?.id || !video.subs_l2?.length) return [];

      // Create a fresh AbortController for this translation
      this.cancelTranslation(); // cancel any previous one first
      this.translationAbortController = new AbortController();
      const signal = this.translationAbortController.signal;

      const subsL2 = this._deepCopyArray(video.subs_l2);
      const lines = subsL2.map((s) => s.line);
      const translatedSubs = [];
      const totalLines = lines.length;
      const totalChunks = Math.ceil(totalLines / CHUNK_SIZE);

      console.log(
        `🔄 Starting translation of ${totalLines} lines in ${totalChunks} chunks (${CHUNK_SIZE} lines per chunk)`
      );

      for (let start = 0; start < lines.length; start += CHUNK_SIZE) {
        // Check if translation has been cancelled
        if (signal.aborted) {
          console.log("🛑 Translation aborted mid-way.");
          break;
        }

        const end = Math.min(start + CHUNK_SIZE, lines.length);
        const chunk = lines.slice(start, end);
        const chunkIndex = Math.floor(start / CHUNK_SIZE) + 1;

        // console.log(
        //   `📤 Sending chunk ${chunkIndex}/${totalChunks} (lines ${start + 1}-${end}):`,
        //   chunk
        // );

        try {
          const response = await this.$axios.$post(
            `${PYTHON_SERVER}translate_array`,
            {
              texts: chunk,
              l1: this.$l1.code,
              l2: this.$l2.code,
            },
            { signal } // pass the abort signal to axios
          );

          const translated_texts = response.translated_texts;

          // console.log(
          //   `📥 Received translation for chunk ${chunkIndex}/${totalChunks}:`,
          //   translated_texts
          // );

          for (let i = 0; i < translated_texts.length; i++) {
            const globalIndex = start + i;
            const original = subsL2[globalIndex];
            translatedSubs[globalIndex] = {
              line: translated_texts[i],
              starttime: original.starttime,
              ...(original.duration != null && { duration: original.duration }),
            };
          }

          // Commit a deep copy to the store (only if not aborted)
          if (!signal.aborted) {
            this.$store.commit("shows/MODIFY_ITEM", {
              item: video,
              key: "subs_l1",
              value: this._deepCopyArray(translatedSubs),
            });

            console.log(
              `✅ Loaded chunk ${chunkIndex}/${totalChunks} into store. Total translated lines: ${
                translatedSubs.filter(Boolean).length
              }/${totalLines}`
            );
          }
        } catch (error) {
          // If the request was cancelled, simply stop further chunks
          if (this.$axios.isCancel?.(error) || error?.code === "ERR_CANCELED" || signal.aborted) {
            console.log("🛑 Translation request cancelled.");
            break;
          }
          console.error(
            `❌ Chunk ${chunkIndex}/${totalChunks} translation failed (lines ${start + 1}-${end}):`,
            error
          );
          throw error; // rethrow real errors
        }
      }

      this.translationAbortController = null;

      if (!signal.aborted) {
        console.log(`🎉 Translation complete! All ${totalLines} lines translated and loaded.`);
      }

      return this._deepCopyArray(translatedSubs);
    },

    /**
     * Automatically translates video subtitles if auto-translate is enabled.
     */
    async performAutoTranslate(video) {
      if (!this.autoTranslate) return;
      if (!video.id || !video.subs_l2?.length) return;

      // Skip if already translated in this SPA session
      if (translatedInSession.has(video.id)) {
        console.log(`📋 Video ${video.id} already translated this session, skipping.`);
        return;
      }

      console.log(`🤖 Auto-translating video ${video.id} (${video.title || "Untitled"})`);
      this.$nuxt.$emit("retranslating", true);
      this.translating = true;

      try {
        await this.translateSubtitlesInChunks(video);
        translatedInSession.add(video.id);
        console.log(`✨ Auto-translation completed for video ${video.id}`);
      } catch (error) {
        // Only log if it wasn't a cancellation
        if (!(error?.code === "ERR_CANCELED" || error?.name === "AbortError")) {
          console.error(`💥 Auto-translation failed for video ${video.id}:`, error);
        }
      } finally {
        this.translating = false;
        this.$nuxt.$emit("retranslating", false);
      }
    },

    /**
     * Retranslates video subtitles (triggered manually by user).
     */
    async retranslate(video) {
      if (!video?.id) return;

      console.log(`🔄 Retranslating video ${video.id} (${video.title || "Untitled"})`);
      this.$nuxt.$emit("retranslating", true);

      try {
        await this.translateSubtitlesInChunks(video);
        console.log(`✨ Retranslation completed for video ${video.id}`);
      } catch (error) {
        if (!(error?.code === "ERR_CANCELED" || error?.name === "AbortError")) {
          console.error(`💥 Retranslation failed for video ${video.id}:`, error);
        }
      } finally {
        this.$nuxt.$emit("retranslating", false);
      }
    },
  },
};