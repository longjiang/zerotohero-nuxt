<template>
  <div class="video-edit">
    <client-only>
      <div
        :class="{
          'd-none': video.subs_l2 && video.subs_l2.length > 0,
          'subs-drop drop p-4 mt-3': true,
        }"
        :key="`drop-${transcriptKey}`"
      >
        <p>
          <i class="fa fa-file mr-2"></i>
          {{ $t("Upload subtitles (.srt or .ass)") }}
        </p>
        <input type="file" accept=".srt,.ass" @change="handleDrop" />
      </div>
      <div
        class="mt-4 mb-5 rounded"
        style="color: rgba(136, 136, 136, 0.85)"
        v-if="
          (!video.subs_l2 || video.subs_l2.length === 0) && !video.checkingSubs
        "
      >
        <div>
          {{
            $t("This video does not have closed captions (CC) in {l2}.", {
              l2: $t($l2.name),
            })
          }}
          {{
            $t(
              "If you have the subtitles file (.srt or .ass), you can add it by uploading it above."
            )
          }}
        </div>
      </div>
      <div class="video-edit-public" v-if="$adminMode">
        <b-button
          size="small"
          :class="{
            'd-none bg-success text-white': true,
            'd-inline-block':
              !saving &&
              !(video && video.id) &&
              ((video.subs_l2 && video.subs_l2.length > 0) || $adminMode),
          }"
          @click="save"
          variant="success"
        >
          <i class="fas fa-plus mr-1"></i>
          {{ $t("Add Video") }}
        </b-button>
        <span v-if="saving">
          <i class="fas fa-hourglass mr-2 text-secondary"></i>
          {{ $t("Adding...") }}
        </span>
        <span v-if="video && video.id && isNewVideo">
          <i class="fas fa-check-circle mr-2 text-success"></i>
          {{ $t("Added") }}
        </span>
        <div
          v-if="
            !saving &&
            !(video && video.id) &&
            ((video.subs_l2 && video.subs_l2.length > 0) || $adminMode)
          "
          style="font-size: 0.7em; opacity: 0.7"
          class="mt-2"
        >
          {{
            $t(
              "Once saved, the video will be available for everyone to see. You can find it from Media > YouTube, then arrange the videos by date."
            )
          }}
        </div>
      </div>
      <div
        :class="{
          'video-edit-admin rounded p-2 mt-2 mb-2 d-none': true,
          'd-block': $adminMode && video && video.id,
        }"
      >
        <div class="video-edit-admin-first-line">
          <!-- <b-dropdown
            size="sm"
            id="dropdown-1"
            :text="video.topic ? topics[video.topic] : 'Topic'"
            :variant="video.topic ? 'success' : undefined"
            class="ml-1"
          >
            <b-dropdown-item
              v-for="(title, slug) in topics"
              :key="`change-topic-item-${slug}`"
              @click="changeTopic(slug)"
            >
              {{ title }}
            </b-dropdown-item>
          </b-dropdown> -->
          <template v-if="!video.lesson">
            <!-- <b-dropdown
              id="dropdown-1"
              size="sm"
              :text="video.level ? levels[video.level] : 'Level'"
              :variant="video.level ? 'success' : undefined"
            >
              <b-dropdown-item
                v-for="(title, slug) in levels"
                :key="`change-level-item-${slug}`"
                @click="changeLevel(slug)"
              >
                {{ title }}
              </b-dropdown-item>
            </b-dropdown> -->
            <AssignShow
              @assignShow="saveShow"
              v-if="!video.tv_show && !video.talk"
              :defaultYoutubeId="video.youtube_id"
              :defaultTitle="video.title"
              type="tv-shows"
              variant="secondary"
            />
            <AssignShow
              @assignShow="saveShow"
              v-if="!video.tv_show && !video.talk"
              :defaultYoutubeId="video.youtube_id"
              :defaultTitle="video.title"
              type="talks"
              variant="secondary"
            />
            <b-button
              v-if="!deleted"
              @click="remove"
              size="small"
              variant="danger"
            >
              <i class="fas fa-trash-alt"></i>
              Remove
            </b-button>
            <span :class="{ 'd-none': !deleting }">
              <i class="fas fa-hourglass mr-2 text-secondary"></i>
              Removing...
            </span>
            <span :class="{ 'd-none': !deleted }">
              <i class="fas fa-check-circle mr-2 text-success"></i>
              Removed
            </span>
            <b-button
              v-if="video?.subs_l2?.length"
              @click="syncSubs"
              size="small"
              variant="success"
              ><span v-if="syncingSrt"><b-spinner small /> Syncing</span
              ><span v-else><i class="fas fa-sync"></i> Sync Subs</span>
            </b-button>
            <small
              :class="{
                'd-none': !showSubsEditing && !enableTranslationEditing,
              }"
            >
              <b-button size="small" variant="danger" @click="clearSubs">
                <i class="fas fa-times mr-1" />
                Subs
              </b-button>
              <b-button size="small" variant="danger" @click="clearTranslation">
                <i class="fas fa-times mr-1" />
                Translation
              </b-button>
            </small>
            <ShowBadge :video="video"/>
          </template>
          <div class="video-admin-checkboxes">
            <b-form-checkbox
              v-model="showSubsEditing"
              class="mt-2 d-inline-block"
            >
              Show Subs Editing
            </b-form-checkbox>
            <b-form-checkbox
              v-model="enableTranslationEditing"
              class="mt-2 d-inline-block"
            >
              Enable Translation Editing
            </b-form-checkbox>
          </div>
        </div>
        <b-form-textarea
          :class="{
            'd-none': !enableTranslationEditing && !showSubsEditing,
            'original-textarea': true,
          }"
          v-model="originalText"
          placeholder="Original text"
          class="mt-2"
          @blur="updateOriginalText"
          v-if="showTextEditing"
        ></b-form-textarea>
        <b-form-textarea
          :class="{
            'd-none': !enableTranslationEditing,
            'translation-textarea': true,
          }"
          v-model="translation"
          @blur="updateTranslation"
          placeholder="Translation"
          class="mt-2"
          v-if="showTextEditing"
        ></b-form-textarea>
        <client-only>
          <div :class="{ 'd-none': !enableTranslationEditing }">
            <b-form-checkbox
              :class="{
                'mt-2 d-inline-block': true,
              }"
              v-model="autoBreakTranslationLines"
            >
              Auto Break Lines
            </b-form-checkbox>
            <b-form-checkbox
              :class="{
                'ml-2 mt-2 d-inline-block': true,
              }"
              v-model="enableNormalizeNotes"
            >
              Normalize Notes
            </b-form-checkbox>
          </div>
        </client-only>
        <b-form-textarea
          :class="{
            'd-none': !enableTranslationEditing,
            'notes-textarea': true,
          }"
          v-model="notes"
          @blur="updateNotes"
          placeholder="Notes"
          class="mt-2"
        ></b-form-textarea>
        <div
          :class="{
            'mt-2': true,
            'd-none': !showSubsEditing && !enableTranslationEditing,
          }"
        >
          First line starts at
          <b-form-input
            v-model="firstLineTime"
            size="small"
            type="text"
            placeholder="0"
            class="d-inline-block ml-1"
            style="width: 4rem"
            :lazy="true"
          />
          <b-button
            v-if="!updating && !subsUpdated"
            size="small"
            variant="ghost-dark"
            @click="updateSubs"
            class="ml-2"
            style="margin-bottom: 0.2rem"
          >
            <i class="fa fa-save mr-2"></i>
            Update Subs
          </b-button>
          <span class="ml-2">
            <span :class="{ 'd-none': !updating }">
              <i class="fas fa-hourglass mr-2 text-secondary"></i>
              Updating...
            </span>
            <span :class="{ 'd-none': !subsUpdated }">
              <i class="fas fa-check-circle mr-2 text-success"></i>
              Updated
            </span>
          </span>
        </div>
      </div>
    </client-only>
  </div>
</template>

<script>
import { Drag, Drop } from "vue-drag-drop";
import subsrt from "subsrt";
import {
  languageLevels,
  formatK,
  TOPICS,
  PYTHON_SERVER,
  normalizeStylizedNumbersInText,
  logError,
  timeout,
} from "@/lib/utils";
import Vue from "vue";
import SmartQuotes from "smartquotes";

export default {
  components: {
    Drag,
    Drop,
  },
  props: {
    video: Object,
    showVideoDetails: {
      default: true,
    },
    showTextEditing: {
      default: true,
    },
  },
  data() {
    return {
      autoBreakTranslationLines: false,
      country: undefined, // the country object as defined in the locale
      deleted: false,
      deleting: false,
      enableNormalizeNotes: false,
      enableTranslationEditing: false,
      firstLineTime: 0,
      isNewVideo: false,
      language: undefined, // the language object as defined in the locale
      localeDescription: undefined, // a description string of the locale e.g. French (France)
      mounted: false,
      notes: "",
      originalText: "",
      over: false,
      punctuations: "。！？；：!?;:♪",
      saving: false,
      showSubsEditing: false,
      subsUpdated: false,
      topics: TOPICS,
      transcriptKey: 0,
      translation: "",
      updating: false,
      syncingSrt: false,
    };
  },
  computed: {
    levels() {
      return languageLevels(this.$l2);
    },
    text() {
      if (this.video.subs_l2)
        return this.video.subs_l2
          .map((line) => (line ? line.line.replace(/\n/g, " ") : ""))
          .join("\n");
    },
  },
  async mounted() {
    this.mounted = true; // So that this component shows up on first load (updates $adminMode)
    this.originalText = this.text;
  },
  watch: {
    showSubsEditing() {
      this.$emit("showSubsEditing", this.showSubsEditing);
    },
    enableTranslationEditing() {
      this.$emit("enableTranslationEditing", this.enableTranslationEditing);
    },
    firstLineTime() {
      if (this.video.subs_l2 && this.video.subs_l2.length > 0) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
        this.transcriptKey++;
      }
    },
    levels() {
      return languageLevels(this.$l2);
    },
  },
  methods: {
    async syncSubs() {
      const srt_content = this.getSrt();
      const youtube_id = this.video.youtube_id;
      this.syncingSrt = true;
      const res = await axios.post(`${PYTHON_SERVER}/sync-srt`, {
        youtube_id,
        srt_content,
      });
      if (res?.data) {
        const syncedSrt = res.data;
        this.video.subs_l2 = this.$subs.parseSrt(syncedSrt);
        this.$toast.success("Subtitles synced successfully.", {
          duration: 3000,
        });
      }
      this.syncingSrt = false;
    },
    getSrt() {
      let captions = this.video.subs_l2.map((item, i) => ({
        id: i + 1,
        start: item.starttime * 1000,
        end: (item.starttime + item.duration) * 1000,
        text: item.line,
      }));

      let srt = subsrt.build(captions);
      return srt;
    },
    clearSubs() {
      this.video.subs_l2 = undefined;
      this.originalText = "";
    },
    clearTranslation() {
      this.video.subs_l1 = undefined;
      this.translation = "";
      Vue.set(this.video, "subs_l1", undefined);
    },
    formatK(number) {
      return formatK(number, 2, this.$l1.code);
    },
    breaklines(text) {
      return text
        .replace(new RegExp(`([${this.punctuations}])\n`, "g"), "$1")
        .replace(new RegExp(`([${this.punctuations}])`, "g"), "$1\n")
        .replace(/\n([”″」’]+)/g, "$1\n")
        .replace(/^\s*\n/gm, "")
        .replace(/\n$/m, "");
    },
    updateNotes() {
      let notesStr = this.normalizeNotes(this.notes);
      let lines = notesStr.split("\n");
      let notes = lines.map((line, index) => {
        return {
          id: index + 1,
          note: this.normalizeNoteStart(line),
        };
      });
      this.video.notes = notes;
    },
    normalizeNotes(text) {
      let normalized = text.replace(
        /[(（【［\[〔]*(\d+)[)）〕】］\]]*/g,
        "[$1]"
      );
      normalized = normalizeStylizedNumbersInText(normalized);
      normalized = SmartQuotes.string(normalized);
      return normalized;
    },
    normalizeNoteStart(line) {
      let notes = line;
      notes = normalizeStylizedNumbersInText(notes);
      notes = notes
        .trim()
        .replace(/^[\d【】\[\]〔〕［］\(\)（）]+[.．、]*\s*/, "");
      return notes;
    },
    updateOriginalText() {
      let text = this.originalText || "";
      if (this.autoBreakTranslationLines) text = this.breaklines(text);
      if (this.enableNormalizeNotes) text = this.normalizeNotes(text);
      this.$emit("updateOriginalText", text);
    },
    updateTranslation() {
      let translation = SmartQuotes.string(this.translation);
      if (this.autoBreakTranslationLines)
        translation = this.breaklines(translation);
      this.$emit("updateTranslation", translation);
    },
    async save() {
      this.saving = true;
      try {
        let id = await this.$directus.postVideo(this.video, this.$l2);
        if (id) {
          this.video.id = id;
          this.saving = false;
          this.isNewVideo = true;
          this.videoInfoKey++;
        }
      } catch (err) {
        logError(err);
      }
    },
    async saveShow(show, type) {
      if (!this.video[type] || this.video[type].id !== show.id) {
        let payload = {};
        payload[type] = show.id;
        let query = `fields=${type}.*`;
        let data = await this.$directus.patchVideo({
          l2Id: this.$l2.id,
          id: this.video.id,
          query,
          payload,
        });
        if (data) {
          Vue.set(this.video, type, {
            id: data[type].id,
            title: data[type].title,
          });
        }
      }
    },
    handleDrop(event) {
      event.preventDefault();
      let file = event.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      let parsed = [];
      reader.onload = (event) => {
        let srt = event.target.result;
        this.video.subs_l2 = this.$subs.parseSrt(srt);
        this.firstLineTime = this.video.subs_l2[0].starttime;
        this.originalText = this.text; // Update the text in the textarea
        this.transcriptKey++;
        this.$emit("updateTranscript", true);
      };
    },
    async changeLevel(slug) {
      let payload = { level: slug };
      let updatedVideo = await this.$directus.patchVideo({
        id: this.video.id,
        l2Id: this.$l2.id,
        payload,
      });
      if (updatedVideo) this.video = updatedVideo;
    },
    async updateSubs() {
      this.updating = true;
      let payload = {
        subs_l2: this.video.subs_l2
          ? this.$subs.unparseSubs(this.video.subs_l2, this.$l2.code)
          : undefined,
        subs_l1: this.video.subs_l1
          ? this.$subs.unparseSubs(this.video.subs_l1)
          : undefined,
        notes: this.video.notes
          ? this.$subs.unparseNotes(this.video.notes)
          : undefined,
      };

      let data = await this.$directus.patchVideo({
        l2Id: this.$l2.id,
        id: this.video.id,
        payload,
      });
      if (data) {
        this.updating = false;
        this.subsUpdated = true;
        await timeout(2000);
        this.subsUpdated = false;
      }
    },
    async changeTopic(slug) {
      let data = await this.$directus.patch({
        l2Id: this.$l2.id,
        id: this.video.id,
        payload: { topic: slug },
      });
      if (data) {
        this.video = data;
      }
    },
    async remove() {
      // Confirm before deleting
      if (!confirm("Are you sure you want to remove this video?")) return;
      let data = await this.$directus.deleteVideo({
        l2Id: this.$l2.id,
        id: this.video.id,
      });
      if (data) {
        this.deleted = true;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.video-view-minimized {
  .subs-drop {
    display: none;
  }
}
.subs-drop {
  border: 2px dashed rgba(136, 136, 136, 0.5);
  color: rgba(136, 136, 136, 0.85);
  border-radius: 0.25rem;
  max-width: calc(
    (100vh - 3rem - env(safe-area-inset-top) - 12rem) * 16 / 9 - 3rem
  );
  margin: 0 auto;

  &:over {
    border: 2px dashed rgba(136, 136, 136, 0.8);
    color: rgba(136, 136, 136, 1);
  }
}

.skin-dark {
  .video-edit-admin {
    background-color: #88888822;
  }
}

.original-textarea,
.translation-textarea,
.notes-textarea {
  font-size: 0.8rem;
  height: 8em;
}
</style>
