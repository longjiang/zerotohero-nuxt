<template>
  <div class="video-edit">
    <div class="video-edit-public">
      <b-button
        :class="{
          'd-none': true,
          'd-inline-block':
            !saving && !(video && video.id) && (video.subs_l2 || $adminMode),
        }"
        @click="save"
      >
        <i class="fas fa-plus mr-2"></i>
        Add to Library
      </b-button>
      <span v-if="saving">
        <i class="fas fa-hourglass mr-2 text-secondary"></i>
        Adding...
      </span>
      <span v-if="video && video.id && isNewVideo">
        <i class="fas fa-check-circle mr-2 text-success"></i>
        Added
      </span>
    </div>
    <div class="show-and-date mt-2">
      <router-link
        class="btn btn-small bg-secondary text-white"
        v-if="video.tv_show"
        :to="{
          name: 'show',
          params: { type: 'tv-show', id: String(video.tv_show.id) },
        }"
      >
        <i class="fa fa-tv mr-2" />
        {{ video.tv_show.title }}
        <i
          :class="{ 'fas fa-times-circle ml-1': true, 'd-none': !$adminMode }"
          @click.stop.prevent="unassignShow('tv_show')"
        />
      </router-link>
      <router-link
        class="btn btn-small bg-secondary text-white"
        v-if="video.talk"
        :to="{
          name: 'show',
          params: { type: 'talk', id: String(video.talk.id) },
        }"
      >
        <i class="fas fa-graduation-cap mr-2"></i>
        {{ video.talk.title }}
        <i
          :class="{ 'fas fa-times-circle ml-1': true, 'd-none': !$adminMode }"
          @click.stop.prevent="unassignShow('talk')"
        />
      </router-link>
    </div>
    <div
      :class="{
        'video-edit-admin rounded p-3 mt-3 mb-3 d-none': true,
        'd-block': $adminMode && video && video.id,
      }"
    >
      <div class="video-edit-admin-first-line">
        <b-dropdown
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
        </b-dropdown>
        <template v-if="!video.lesson">
          <b-dropdown
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
          </b-dropdown>
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
          <b-button v-if="!deleted" @click="remove" size="sm">
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
        <div
          :class="{
            'mt-2 ml-1': true,
            'd-none': !enableTranslationEditing && !showSubsEditing,
          }"
        >
          <a :href="translationURL" target="_blank" class="link-unstyled mr-1">
            <i class="fa fa-language"></i>
            Get Translation
          </a>
          <a
            :href="originalTextHref"
            :download="`${video.title}.txt`"
            target="_blank"
            class="link-unstyled"
          >
            <i class="fa fa-download"></i>
            Download Text
          </a>
        </div>
      </div>
      <div
        :class="{
          'video-edit-admin-second-line': true,
          'd-none': !showSubsEditing,
        }"
      >
        <drop
          @drop="handleDrop"
          :class="{
            over: over,
            'subs-drop drop text-dark btn btn-sm btn-light w-100 mt-2': true,
          }"
          :key="`drop-${transcriptKey}`"
          @dragover="over = true"
          @dragleave="over = false"
        >
          Drop Subs Here
        </drop>
      </div>
      <b-form-textarea
        :class="{
          'd-none': !enableTranslationEditing && !showSubsEditing,
        }"
        v-model="originalText"
        placeholder="Original text"
        rows="3"
        class="mt-2"
        max-rows="6"
        @blur="updateOriginalText"
      ></b-form-textarea>
      <b-form-textarea
        :class="{
          'd-none': !enableTranslationEditing,
        }"
        v-model="translation"
        @blur="updateTranslation"
        placeholder="Translation"
        rows="3"
        class="mt-2"
        max-rows="6"
      ></b-form-textarea>
      <b-form-checkbox
        :class="{
          'mt-2': true,
          'd-none': !enableTranslationEditing,
        }"
        v-model="autoBreakTranslationLines"
      >
        Auto Break Lines
      </b-form-checkbox>
      <b-form-textarea
        :class="{
          'd-none': !enableTranslationEditing,
        }"
        v-model="notes"
        @blur="updateNotes"
        placeholder="Notes"
        rows="3"
        class="mt-2"
        max-rows="6"
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
          size="sm"
          type="text"
          placeholder="0"
          class="d-inline-block ml-1"
          style="width: 4rem"
          :lazy="true"
        />
        <b-button
          v-if="!updating && !subsUpdated"
          size="sm"
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
  </div>
</template>

<script>
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import Config from "@/lib/config";
import YouTube from "@/lib/youtube";
import Vue from "vue";
import SmartQuotes from "smartquotes";

export default {
  components: {
    Drag,
    Drop,
  },
  props: {
    video: Object,
  },
  data() {
    return {
      subsUpdated: false,
      firstLineTime: 0,
      over: false,
      saving: false,
      isNewVideo: false,
      topics: Helper.topics,
      levels: Helper.levels(this.$l2),
      transcriptKey: 0,
      deleted: false,
      deleting: false,
      updating: false,
      showSubsEditing: false,
      enableTranslationEditing: false,
      translation: "",
      notes: "",
      mounted: false,
      autoBreakTranslationLines: false,
      originalText: "",
      punctuations: "。！？；：!?;:♪",
    };
  },
  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    $adminMode() {
      this.mounted; // So that this component shows up on first load (updates $adminMode)
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    text() {
      if (this.video.subs_l2)
        return this.video.subs_l2
          .map((line) => line.line.replace(/\n/g, " "))
          .join("\n");
    },
    translationURL() {
      if (typeof this.$l2 !== "undefined") {
        let url = this.$languages.translationURL(this.originalText, this.$l1, this.$l2);
        return url;
      }
    },
    originalTextHref() {
      return Helper.makeTextFile(this.originalText);
    },
  },
  mounted() {
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
  },
  methods: {
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
      normalized = Helper.normalizeCircleNumbers(normalized);
      normalized = SmartQuotes.string(normalized);
      return normalized;
    },
    normalizeNoteStart(line) {
      let notes = line;
      notes = Helper.normalizeCircleNumbers(notes);
      notes = notes
        .trim()
        .replace(/^[\d【】\[\]〔〕［］\(\)（）]+[.．、]*\s*/, "");
      return notes;
    },
    updateOriginalText() {
      let text = this.originalText || "";
      if (this.autoBreakTranslationLines)
        text = this.breaklines(text);
      text = this.normalizeNotes(text);
      this.$emit("updateOriginalText", text);
    },
    updateTranslation() {
      let translation = SmartQuotes.string(this.translation);
      if (this.autoBreakTranslationLines)
        translation = this.breaklines(translation);
      this.$emit("updateTranslation", translation);
    },
    async unassignShow(type) {
      let data = {};
      data[type] = null;
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data
      );
      if (response && response.data) {
        this.video[type] = undefined;
        this.videoInfoKey++;
      }
    },
    async save() {
      this.saving = true;
      try {
        let data = {
          l2: this.$l2.id,
          title: this.video.title || "Untitled",
          youtube_id: this.video.youtube_id,
          channel_id: this.video.channel ? this.video.channel.id : null,
          subs_l2: this.video.subs_l2
            ? YouTube.unparseSubs(this.video.subs_l2, this.$l2.code)
            : undefined,
          date: DateHelper.unparseDate(this.video.date),
        };
        let response = await axios.post(
          `${Config.wiki}items/youtube_videos`,
          data
        );
        if (response) {
          this.video.id = response.data.data.id;
          this.saving = false;
          this.isNewVideo = true;
          this.videoInfoKey++;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async saveShow(show, type) {
      if (!this.video[type] || this.video[type].id !== show.id) {
        let data = {};
        data[type] = show.id;
        let response = await axios.patch(
          `${Config.wiki}items/youtube_videos/${this.video.id}?fields=${type}.*`, // type is 'tv_show' or 'talk'
          data
        );
        response = response.data;
        if (response && response.data) {
          Vue.set(this.video, type, {
            id: response.data[type].id,
            title: response.data[type].title,
          });
        }
      }
    },
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      let reader = new FileReader();
      reader.readAsText(file);
      let parsed = [];
      reader.onload = (event) => {
        let srt = event.target.result;
        parsed = parseSync(srt).map((cue) => {
          return {
            starttime: cue.data.start / 1000,
            line: cue.data.text,
          };
        });
        this.video.subs_l2 = Helper.uniqueByValue(parsed, "starttime");
        this.firstLineTime = this.video.subs_l2[0].starttime;
        this.transcriptKey++;
      };
    },
    async changeLevel(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ level: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async updateSubs() {
      this.updating = true;
      try {
        let response = await axios.patch(
          `${Config.wiki}items/youtube_videos/${this.video.id}`,
          {
            subs_l2: this.video.subs_l2
              ? YouTube.unparseSubs(this.video.subs_l2)
              : undefined,
            subs_l1: this.video.subs_l1
              ? YouTube.unparseSubs(this.video.subs_l1)
              : undefined,
            notes: this.video.notes
              ? YouTube.unparseNotes(this.video.notes)
              : undefined,
          }
        );
        if (response && response.data) {
          this.updating = false;
          this.subsUpdated = true;
          await Helper.timeout(2000);
          this.subsUpdated = false;
        }
      } catch (err) {}
    },
    async changeTopic(slug) {
      let response = await $.ajax({
        url: `${Config.wiki}items/youtube_videos/${this.video.id}`,
        data: JSON.stringify({ topic: slug }),
        type: "PATCH",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response && response.data) {
        this.video = response.data;
      }
    },
    async remove() {
      try {
        let response = await axios.delete(
          `${Config.wiki}items/youtube_videos/${this.video.id}`
        );
        if (response) {
          this.deleted = true;
        }
      } catch (err) {}
    },
  },
};
</script>

<style>
.main-dark .video-edit-admin {
  background-color: #88888822;
}
</style>