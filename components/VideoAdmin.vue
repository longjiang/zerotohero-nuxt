<template>
  <div class="video-edit">
    <div class="video-details">
      <span v-if="$adminMode && video.subs_l2 && video.subs_l2.length > 0">
        <a
          :href="originalTextHref"
          v-if="$adminMode"
          :download="`${video.title}.txt`"
          target="_blank"
          class="link-unstyled"
        >
          <i class="fas fa-file-alt mr-1"></i>
          Transcript
        </a>
        <a :href="translationURL" target="_blank" class="link-unstyled ml-2">
          <i class="fa fa-language mr-1"></i>
          Translation
        </a>
        <Share class="ml-2" />
      </span>
      <div class="video-meta">
        <span v-if="video.date">{{ formatDate(video.date) }}</span>
        <span v-if="localeDescription">
          <img
            v-if="country"
            :alt="`Flag of ${country.name}`"
            :title="`Flag of ${country.name} (${country.alpha2Code})`"
            :src="`/vendor/flag-svgs/${country.alpha2Code}.svg`"
            class="flag-icon mr-1"
            style="width: 1rem; position: relative; bottom: 0.1rem;"
          />
          {{ localeDescription }}
        </span>
        <span><a :href="`https://downsub.com/?url=youtu.be%2F${video.youtube_id}`" target="_blank" class="link-unstyled"><u>Download Transcript</u></a></span>
      </div>
      <div class="video-engagement">
        <span v-if="video.views">
          <i class="fa-solid fa-eye"></i>
          {{ formatK(video.views) }}
        </span>
        <span v-if="video.likes">
          <i class="fa-solid fa-thumbs-up"></i>
          {{ formatK(video.likes) }}
        </span>
        <span v-if="video.comments">
          <i class="fa-solid fa-comment"></i>
          {{ formatK(video.comments) }}
        </span>
      </div>
      <router-link
        class="link-unstyled"
        v-if="$adminMode && video.channel"
        :to="{
          name: 'youtube-channel',
          params: {
            channel_id: video.channel.id,
            title: video.channel.title || undefined,
          },
        }"
      >
        <i class="fab fa-youtube ml-2"></i>
        {{ video.channel.title || "Channel" }}
      </router-link>
    </div>
    <client-only>
      <drop
        @drop="handleDrop"
        :class="{
          'd-none': video.subs_l2 && video.subs_l2.length > 0,
          over: over,
          'subs-drop drop p-4': true,
        }"
        :key="`drop-${transcriptKey}`"
        @dragover="over = true"
        @dragleave="over = false"
      >
        <i class="fa fa-file mr-2"></i>
        Drop .srt or .ass files here to add subtitles
      </drop>
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
          Save Video for Everyone
        </b-button>
        <span v-if="saving">
          <i class="fas fa-hourglass mr-2 text-secondary"></i>
          Adding...
        </span>
        <span v-if="video && video.id && isNewVideo">
          <i class="fas fa-check-circle mr-2 text-success"></i>
          Added
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
          Once saved, the video will be available for everyone to see. You can
          find it at
          <i class="fas fa-photo-video"></i>
          Media →
          <i class="fa fa-play"></i>
          New Videos.
        </div>
      </div>
      <div class="show-and-date" v-if="$adminMode">
        <span class="mr-2">
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
              :class="{
                'fas fa-times-circle ml-1': true,
                'd-none': !$adminMode,
              }"
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
              :class="{
                'fas fa-times-circle ml-1': true,
                'd-none': !$adminMode,
              }"
              @click.stop.prevent="unassignShow('talk')"
            />
          </router-link>
        </span>
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
    </client-only>
  </div>
</template>

<script>
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import { languageLevels, formatK } from "@/lib/utils";
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
      enableNormalizeNotes: false,
      originalText: "",
      punctuations: "。！？；：!?;:♪",
      translationURL: undefined,
      language: undefined, // the language object as defined in the locale
      country: undefined, // the country object as defined in the locale
      localeDescription: undefined, // a description string of the locale e.g. French (France)
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
    levels() {
      return Helper.languageLevels(this.$l2);
    },
    $adminMode() {
      this.mounted; // So that this component shows up on first load (updates $adminMode)
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    text() {
      if (this.video.subs_l2)
        return this.video.subs_l2
          .map((line) => (line ? line.line.replace(/\n/g, " ") : ""))
          .join("\n");
    },
    originalTextHref() {
      return Helper.makeTextFile(this.text);
    },
  },
  async mounted() {
    this.mounted = true; // So that this component shows up on first load (updates $adminMode)
    this.originalText = this.text;
    this.translationURL = this.getTranslationURL();
    if (this.video?.locale) {
      let {country, language, description} = await this.getLocaleDescription(
        this.video.locale
      );
      if (description) this.localeDescription = description
      if (country) this.country = country
      if (language) this.language = language
    }
      
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
    text() {
      this.translationURL = this.getTranslationURL();
    },
    levels() {
      return languageLevels(this.$l2);
    },
  },
  methods: {
    async getLocaleDescription(locale) {
      let language, country;
      let [langCode, countryCode] = locale.split("-");
      language = await this.$languages.getSmart(langCode);
      if (countryCode) {
        country = await this.$languages.countryFromCode(countryCode);
      }
      let description = `${language ? language.name : ""}`;
      if (country) description += ` (${country.name})`;
      return {country, language, description};
    },
    formatK(number) {
      return formatK(number);
    },
    formatDate(date) {
      return DateHelper.formatDate(date);
    },
    getTranslationURL() {
      if (typeof this.$l2 !== "undefined") {
        return this.$languages.translationURL(this.text, this.$l1, this.$l2);
      }
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
    async unassignShow(type) {
      let payload = {};
      payload[type] = null;
      let data = await this.$directus.patchVideo({
        l2Id: this.$l2.id,
        id: this.video.id,
        payload,
      });
      if (data) {
        this.video[type] = undefined;
        this.videoInfoKey++;
      }
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
        Helper.logError(err);
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
            duration: (cue.data.end - cue.data.start) / 1000,
            line: cue.data.text,
          };
        });
        this.video.subs_l2 = Helper.uniqueByValue(parsed, "starttime");
        this.firstLineTime = this.video.subs_l2[0].starttime;
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
        await Helper.timeout(2000);
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
.main-dark {
  .subs-drop {
    border: 2px dashed rgba(136, 136, 136, 0.5);
    color: rgba(136, 136, 136, 0.85);
    border-radius: 0.25rem;

    &:over {
      border: 2px dashed rgba(136, 136, 136, 0.8);
      color: rgba(136, 136, 136, 1);
    }
  }

  .video-edit-admin {
    background-color: #88888822;
  }

  .video-details {
    font-size: 0.8em;
    text-align: left;
    a {
      color: #ccc;
    }
    line-height: 2;
  }
}

.video-meta span + span::before {
  content: " · ";
  margin: 0 0.25rem;
}

.video-engagement span + span {
  margin-left: 0.5rem;
}
</style>