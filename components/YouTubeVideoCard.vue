<template>
  <drop
    @drop="handleDrop"
    :class="{
      over: over,
      'youtube-video': true,
      media: true,
      rounded: true,
      shadow: true,
      nosubs: checkSubs && !video.checkingSubs && !video.hasSubs && !video.id,
      drop: checkSubs && !video.checkingSubs,
    }"
    @dragover="over = true"
    @dragleave="over = false"
    :key="`video-${video.youtube_id}-${videoInfoKey}`"
  >
    <div class="youtube-link">
      <router-link
        :to="`/${$l1.code}/${$l2.code}/youtube/view/${video.youtube_id}/${
          video.lesson ? 'lesson' : ''
        }`"
        class="youtube-thumbnail-wrapper aspect-wrapper d-block"
      >
        <img
          :src="
            video.thumbnail ||
            `//img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`
          "
          class="youtube-thumbnail aspect"
        />
      </router-link>
      <div class="media-body">
        <div class="font-weight-bold">
          <span contenteditable="true" v-if="$adminMode" @blur="saveTitle">
            {{ video.title }}
          </span>
          <router-link
            v-else
            :to="`/${$l1.code}/${$l2.code}/youtube/view/${video.youtube_id}/${
              video.lesson ? 'lesson' : ''
            }`"
            class="youtube-title d-block link-unstyled"
          >
            {{ video.title }}
          </router-link>
        </div>
        <div v-if="video.hasSubs || video.id" class="btn btn-small mt-2 ml-0">
          {{ $l2.name }} CC
          <span v-if="video.l2Locale">({{ video.l2Locale }})</span>
          <span v-if="srt">- {{ srt.name }}</span>
        </div>
        <div
          v-if="
            video.checkingSubs === false && video.hasSubs === false && !video.id
          "
          class="btn btn-small mt-2 ml-0"
        >
          <span v-if="!over">No {{ $l2.name }} CC</span>
          <span v-else>Drop SRT to Add Subs</span>
        </div>
        <div
          v-if="checkSaved && video.id"
          class="btn btn-small bg-success text-white mt-2 ml-0"
        >
          <i class="fa fa-check mr-2"></i>
          Added
        </div>
        <b-button
          v-if="checkSaved && !video.id && video.hasSubs"
          class="btn btn-small mt-2 ml-0"
          @click="getSubsAndSave(video)"
        >
          <i class="fas fa-plus mr-2"></i>
          Add
        </b-button>
        <!-- <b-button
          v-if="$adminMode && video.id && !video.channel_id"
          class="btn btn-small mt-2 ml-0"
          @click="addChannelID(video)"
        >
          <i class="fas fa-plus mr-2"></i>
          Add Channel ID
        </b-button> -->
        <span
          class="btn btn-small mt-2 ml-0 bg-success text-white"
          v-if="video.tv_show"
        >
          <i class="fa fa-tv mr-2" />
          {{ video.tv_show.title }}
          <i
            class="fas fa-times-circle ml-1"
            v-if="$adminMode"
            @click="unassignShow"
          />
        </span>
        <span
          class="btn btn-small mt-2 ml-0 bg-success text-white"
          v-if="video.talk"
        >
          <i class="fas fa-graduation-cap mr-2"></i>
          {{ video.talk.title }}
          <i
            class="fas fa-times-circle ml-1"
            v-if="$adminMode"
            @click="unassignShow"
          />
        </span>
        <AssignShow
          @assignShow="saveShow"
          v-if="$adminMode && video.id && !video.tv_show && !video.talk"
          :defaultYoutubeId="video.youtube_id"
          :defaultTitle="video.title"
          type="tv-shows"
        />
        <AssignShow
          @assignShow="saveShow"
          v-if="$adminMode && video.id && !video.tv_show && !video.talk"
          :defaultYoutubeId="video.youtube_id"
          :defaultTitle="video.title"
          type="talks"
        />
        <b-button
          v-if="$adminMode && video.id"
          class="btn btn-small bg-danger text-white mt-2 ml-0"
          @click="remove()"
        >
          <i class="fa fa-trash"></i>
        </b-button>
        <div
          v-if="video.id && video.topic"
          class="btn btn-small btn-gray mt-2 ml-0"
        >
          {{ Helper.topics[video.topic] }}
        </div>
        <div
          v-if="video.id && video.level"
          class="btn btn-small btn-gray mt-2 ml-0"
        >
          {{ Helper.level(video.level, $l2) }}
        </div>

        <div
          v-if="
            $adminMode &&
            video.subs_l1 &&
            video.subs_l1.length > 0 &&
            showSubsEditing
          "
        >
          <div
            v-for="index in Math.min(20, video.subs_l1.length)"
            :key="`l1-subs-${index}`"
          >
            <b>{{ video.l1Locale }}</b>
            <span
              @click="matchSubsAndUpdate(index - 1)"
              :class="{
                btn: true,
                'btn-small': true,
                'text-danger':
                  video.subs_l2 &&
                  video.subs_l2.length > 0 &&
                  video.subs_l1[index - 1] &&
                  video.subs_l1[index - 1].starttime !==
                    video.subs_l2[0].starttime,
              }"
            >
              {{ video.subs_l1[index - 1].starttime }}
            </span>
            {{ video.subs_l1[index - 1].line }}
          </div>
        </div>
        <div
          v-if="
            $adminMode &&
            video.subs_l2 &&
            video.subs_l2.length > 0 &&
            showSubsEditing
          "
        >
          <b>{{ video.l2Locale || $l2.code }}</b>
          <input
            type="text"
            v-model.lazy="firstLineTime"
            :style="`width: ${String(firstLineTime).length + 1}em`"
            class="ml-1 mr-1 btn btn-small"
          />
          {{ video.subs_l2[0].line }}

          <!-- <b-button v-if="!subsUpdated" @click="updateSubs" class="mt-2 btn btn-small"
            ><i class="fa fa-save mr-2"></i>Update Subs</b-button
          >
          <b-button v-else variant="success" class="mt-2 btn btn-small">
            <i class="fa fa-check mr-2"></i>Updated
          </b-button> -->
        </div>

        <!-- <div
          v-if="
            $adminMode &&
            video.channel_id &&
            Config.approvedChannels[$l2.code] &&
            !Config.approvedChannels[$l2.code].includes(video.channel_id) &&
            Config.talkChannels[$l2.code] &&
            !Config.talkChannels[$l2.code].includes(video.channel_id)
          "
          class="small text-warning mt-1"
        >
          {{ video.channel_id }}
        </div> -->
      </div>
    </div>
  </drop>
</template>

<script>
import Helper from "@/lib/helper";
import Config from "@/lib/config";
import YouTube from "@/lib/youtube";
import { Drag, Drop } from "vue-drag-drop";
import { parseSync } from "subtitle";
import Vue from 'vue';

export default {
  components: {
    Drag,
    Drop,
  },
  data() {
    return {
      Helper,
      Config,
      videoInfoKey: 0,
      over: false,
      firstLineTime:
        this.video.subs_l2 && this.video.subs_l2[0]
          ? this.video.subs_l2[0].starttime
          : undefined,
      subsUpdated: false,
      assignShow: false,
      srt: false,
    };
  },
  props: {
    delay: 0,
    checkSaved: {
      default: false,
    },
    video: {
      type: Object,
    },
    checkSubs: {
      default: false,
    },
    showSubsEditing: {
      default: false,
    },
  },
  async mounted() {
    if (this.checkSubs) {
      await Helper.timeout(this.delay);
      await this.checkSubsFunc(this.video);
    }
    if (this.video.id && this.$adminMode) {
      await this.addSubsL1(this.video);
    }
    this.videoInfoKey++;
  },
  watch: {
    firstLineTime(newTime, oldTime) {
      this.shiftSubs();
      if (oldTime !== undefined) {
        this.updateSubs();
      }
    },
    async checkSaved() {
      if (!this.video.id && this.checkSaved) {
        await this.checkSavedFunc(this.video);
        if (this.video.id) this.addSubsL1(this.video);
        this.video.checkingSubs = false;
        this.videoInfoKey++;
      }
    },
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
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {
    async saveShow(showID, type) {
      console.log(showID, type, 'youtubeVideoCard.saveShow')
      let data = {}
      data[type] = showID
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}?fields=${type}.*`, // type is 'tv_show' or 'talk'
        data
      );
      response = response.data;
      if (response && response.data) {
        Vue.set(this.video, type, {
          id: response.data[type].id,
          title: response.data[type].title,
        })
      }
    },
    async unassignShow() {
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}`,
        { tv_show: null }
      );
      if (response && response.data) {
        this.video.tv_show = undefined;
        this.videoInfoKey++;
      }
    },
    async saveTitle(e) {
      let newTitle = e.target.innerText;
      if (this.video.title !== newTitle) {
        try {
          let response = await axios.patch(
            `${Config.wiki}items/youtube_videos/${this.video.id}`,
            { title: newTitle },
            { contentType: "application/json" }
          );
          response = response.data;
          if (response && response.data) {
            this.titleUpdated = true;
          }
        } catch (err) {
          // Direcuts bug
        }
      }
    },
    matchSubsAndUpdate(index) {
      this.firstLineTime = this.video.subs_l1[index].starttime;
      this.shiftSubs();
      this.updateSubs();
    },
    shiftSubs() {
      if (
        this.video.subs_l2 &&
        this.video.subs_l2.length > 0 &&
        this.firstLineTime !== this.video.subs_l2[0].starttime
      ) {
        let subsShift =
          Number(this.firstLineTime) - Number(this.video.subs_l2[0].starttime);
        if (subsShift !== 0) {
          for (let line of this.video.subs_l2) {
            line.starttime = Number(line.starttime) + subsShift;
          }
        }
      }
    },
    async remove() {
      if (this.video.id) {
        try {
          let response = await axios.delete(
            `${Config.wiki}items/youtube_videos/${this.video.id}`
          );
          if (response) {
            this.video.id = undefined;
            this.videoInfoKey++;
          }
        } catch (err) {
          // Directus bug
        }
      }
    },
    async updateSubs() {
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${this.video.id}`,
        { subs_l2: JSON.stringify(this.video.subs_l2) }
      );
      response = response.data;
      if (response && response.data) {
        this.subsUpdated = true;
      }
    },
    importSrt(file) {
      try {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (event) => {
          let srt = event.target.result;
          this.video.subs_l2 = parseSync(srt).map((cue) => {
            return {
              starttime: cue.data.start / 1000,
              line: cue.data.text,
            };
          });
          this.firstLineTime = this.video.subs_l2[0].starttime;
          this.video.hasSubs = true;
          this.srt = file;
          this.videoInfoKey++;
        };
      } catch (err) {}
    },
    handleDrop(data, event) {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      this.importSrt(file);
    },
    async addChannelID(video) {
      let channelId = await this.getChannelID(video);
      let response = await axios.patch(
        `${Config.wiki}items/youtube_videos/${video.id}`,
        { channel_id: channelId }
      );
      if (response && response.data) {
        video.channel_id = response.data.channel_id;
        this.videoInfoKey++;
      }
    },
    async getSubsAndSave(video = this.video) {
      if (this.checkSaved && !video.id && video.hasSubs) {
        if (!video.subs_l2 && video.l2Locale) {
          video.subs_l2 = await YouTube.getTranscript(
            video,
            video.l2Locale,
            video.l2Name
          );
        }
        if (video.subs_l2[0]) {
          this.firstLineTime = video.subs_l2[0].starttime;
          if (!video.channel_id) await this.getChannelID(video);
          await this.save(video);
        }
      }
    },
    async getChannelID(video) {
      let details = await YouTube.videoByApi(video.youtube_id);
      video.channel_id = details.channel.id;
      return details.channel.id;
    },
    async save(video) {
      try {
        let response = await axios.post(`${Config.wiki}items/youtube_videos`, {
          youtube_id: video.youtube_id,
          title: video.title,
          l2: this.$l2.id,
          subs_l2: JSON.stringify(video.subs_l2),
          channel_id: video.channel_id,
        });
        response = response.data;
        if (response && response.data) {
          video.id = response.data.id;
          this.videoInfoKey++;
          return true;
        }
      } catch (err) {}
    },
    async checkSavedFunc(video) {
      let response = await axios.get(
        `${Config.wiki}items/youtube_videos?filter[youtube_id][eq]=${
          video.youtube_id
        }&filter[l2][eq]=${this.$l2.id}&timestamp=${
          this.$adminMode ? Date.now() : 0
        }`
      );
      response = response.data;
      if (response && response.data.length > 0) {
        let subs_l2 = YouTube.parseSavedSubs(response.data[0].subs_l2);
        if (subs_l2[0]) {
          video = Object.assign(video, response.data[0]);
          video.subs_l2 = subs_l2;
          this.firstLineTime = video.subs_l2[0].starttime;
        }
      }
      return video;
    },
    async checkSubsFunc(video) {
      video.checkingSubs = true;
      video.hasSubs = false;
      if (video.subs_l2 && video.subs_l2.length > 0) {
        video.hasSubs = true;
        video.checkingSubs = false;
      } else {
        video = await YouTube.getYouTubeSubsList(video, this.$l1, this.$l2);
        if (this.checkSaved) {
          video = await this.checkSavedFunc(video);
          video = this.addSubsL1(video);
        }
        video.checkingSubs = false;
      }
      return video;
    },
    async addSubsL1(video) {
      if (!video.l1Locale) {
        video = await YouTube.getYouTubeSubsList(video, this.$l1, this.$l2);
      }
      let subs_l1 = await YouTube.getTranscript(
        video.youtube_id,
        video.l1Locale,
        video.l2Name
      );
      video.subs_l1 = subs_l1.filter((line) => !/^[♫♪()]/.test(line.line));
      return video;
    },
  },
};
</script>

<style lang="scss">
.youtube-video.drop.over {
  border: 2px dashed #ccc;
}

.youtube-video {
  min-width: 12rem;
  max-width: calc(100% - 2rem);
  flex: 1;
  margin: 0 1rem 2rem 1rem;
}

@media (min-width: 768px) {
  .youtube-video {
    max-width: calc(50% - 2rem);
  }
}

.youtube-video.nosubs:not(.over) {
  opacity: 0.2;
}

a.youtube-link,
a.youtube-link:hover {
  color: #666;
  text-decoration: none;
  .youtube-title {
    font-weight: bold;
  }
}
</style>
