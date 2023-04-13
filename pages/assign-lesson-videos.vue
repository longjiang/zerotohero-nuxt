<router>
    {
      path: '/:l1/:l2/assign-lesson-videos/:level?/:lesson?',
      props: true,
      meta: {
        title: 'Lesson Videos | Language Player',
        skin: 'dark',
        metaTags: [
          {
            name: 'description',
            content: 'Assign videos to reenforce lesson vocabulary.'
          }
        ]
      }
    }
</router>
<template>
  <div class="container-fluid main main-dark mb-5">
    <div class="row">
      <div class="col-md-12">
        <router-link
          class="btn btn-gray mr-2"
          :to="{
            name: 'assign-lesson-videos',
            params: { level: level, lesson: Number(lesson) - 1 },
          }"
        >
          Previous Lesson
        </router-link>
        <router-link
          class="btn btn-gray"
          :to="{
            name: 'assign-lesson-videos',
            params: { level: level, lesson: Number(lesson) + 1 },
          }"
        >
          Next Lesson
        </router-link>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4">
        <h4 class="mt-5">Lesson Vocabulary</h4>
        <p class="mb-4">
          {{ words.length - matchedWords.length }} unmatched words
        </p>
        <WordList
          :words="words"
          :matchedWords="matchedWords"
          :key="`matched-words-${matchedWordsKey}`"
        ></WordList>
      </div>
      <div class="col-md-8">
        <h4 class="mt-5">Lesson Videos</h4>
        <p class="mb-4">{{ lessonVideos.length }} videos</p>
        <LazyYouTubeVideoList
          :noThumbs="false"
          :updateVideos="updateLessonVideos"
          :videos="lessonVideos"
          :checkSubs="false"
          :assignLessonMode="true"
          :lesson="lesson"
          :level="level"
          skin="dark"
        >
          <template v-slot:footer="{ video }">
            <div>"{{ video.matches.map((w) => w.head).join(", ") }}"</div>
            <b-button @click="removeVideoFromLesson(video)" class="mt-2 btn-sm"
              >Remove from Lesson</b-button
            >
          </template>
        </LazyYouTubeVideoList>
        <h4 class="mt-5 mb-4">
          More Videos
          <span
            @click="refresh()"
            class="text-success small"
            style="cursor: pointer"
            ><u>Refresh</u></span
          >
        </h4>
        <LazyYouTubeVideoList
          v-if="sortedVideos"
          :noThumbs="false"
          :updateVideos="updateVideos"
          :videos="sortedVideos"
          :checkSubs="false"
          :assignLessonMode="true"
          :lesson="lesson"
          :level="level"
          skin="dark"
        >
          <template v-slot:footer="{ video }">
            <div>
              {{ video.lesson }}"{{
                video.matches.map((w) => w.head).join(", ")
              }}"
            </div>
            <b-button @click="addVideoToLesson(video)" class="mt-2 btn-sm"
              >Add to Lesson</b-button
            >
          </template>
        </LazyYouTubeVideoList>
        <div class="text-center mt-3 mb-3">
          <Loader :sticky="true" v-if="loading" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList";
import Helper from "@/lib/helper";
import { parseDuration, timeStringToSeconds } from "@/lib/utils";

export default {
  props: ["level", "lesson"],
  data() {
    return {
      words: [],
      matchedWords: [],
      lessonVideos: [],
      videos: [],
      updateLessonVideos: 0,
      updateVideos: 0,
      matchedWordsKey: 0,
      loading: false,
    };
  },
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    unmatchedWords() {
      return this.words.filter(
        (word) => !this.matchedWords.map((w) => w.id).includes(word.id)
      );
    },
    sortedVideos() {
      if (!this.videos) return []
      let videos = this.videos
        .sort((a, b) => {
          return b.views - a.views;
        })
        .sort((a, b) => {
          return (
            Math.round(a.parsedDuration / 300) * 300 -
            Math.round(b.parsedDuration / 300) * 300
          );
        })
        .sort((a, b) => {
          let aMatchCount = a.matches?.length || 0;
          let bMatchCount = b.matches?.length || 0;
          return bMatchCount - aMatchCount;
        });
      videos = Helper.uniqueByValue(videos, "youtube_id");
      return videos
    },
  },
  components: {
    WordList,
  },
  activated() {
    this.route();
  },
  async mounted() {
    let dictionary = await this.$getDictionary();
    let words = await dictionary.lookupByLesson(this.level, this.lesson);
    words = words.filter((word) => !word.oofc || !word.oofc === "");
    if (this.$l2.han && this.$l2.code !== "ja") {
      this.words = Helper.uniqueByValue(words, "simplified");
    } else {
      this.words = Helper.uniqueByValue(words, "head");
    }
    await this.getLessonVideos();
    await this.getVideos();
    this.updateVideos++;
    this.updateLessonVideos++;
  },
  methods: {
    async refresh() {
      await this.getVideos();
      this.updateVideos++;
    },
    async getLessonVideos() {
      this.lessonVideos = [];
      let videos = await this.$directus.getVideos({
        l2Id: this.$l2.id,
        query: `filter[l2][eq]=${this.$l2.id}&filter[level][eq]=${
          this.level
        }&filter[lesson][eq]=${this.lesson}&timestamp=${Date.now()}`,
      });
      if (videos.length > 0) {
        videos = videos.map((video) => {
          video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
          video.matches = this.matchWords(video);
          return video;
        });
      }
      videos = videos.sort((a, b) => {
        let aScore = a.matches ? a.matches.length || 0 : 0;
        let bScore = b.matches ? b.matches.length || 0 : 0;
        return bScore - aScore;
      });
      this.lessonVideos = Helper.uniqueByValue(videos, "youtube_id");
      this.updateMatches();
      this.updateLessonVideos++;
      return true;
    },
    rankByViews(arr) {
      // Sort the array in descending order based on the views property
      const sortedArray = arr.slice().sort((a, b) => b.views - a.views);

      // Iterate through the sorted array and add the rank property to each object
      sortedArray.forEach((item, index) => {
        // If it's the first item or the views are different from the previous item,
        // assign the current index + 1 as the rank
        if (index === 0 || sortedArray[index - 1].views !== item.views) {
          item.viewRank = index + 1;
        } else {
          // If the views are the same as the previous item, assign the same viewRank
          item.viewRank = sortedArray[index - 1].viewRank;
        }
      });

      return sortedArray;
    },
    async getVideos() {
      this.loading = true;
      let words = this.unmatchedWords;
      this.videos = [];
      let videos = [];

      if (words.length > 0) {
        let allWordForms = [];
        if (videos.length === 0) {
          allWordForms = words.slice(0, 10).map((word) => word.head); // We're only using the head to make the search simpler
        }
        allWordForms = Helper.unique(allWordForms);

        let params = {
          l2Id: this.$l2.id,
          terms: allWordForms,
          limit: 1000,
        };
        let newVideos = await this.$directus.searchCaptions(params);
        videos = videos.concat(newVideos);
        videos = Helper.uniqueByValue(videos, "id");

        if (videos.length > 0) {
          videos = videos.map((video) => {
            if (video.subs_l2) {
              video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
              video.matches = this.matchWords(video).filter(
                (word) => !this.matchedWords.map((w) => w.id).includes(word.id)
              );
              video.parsedDuration = video.duration
                ? timeStringToSeconds(parseDuration(video.duration))
                : 0;
            }
            return video;
          });
        }

        // Do not return videos already in a lesson, or has more than 50 characters on any line
        videos = videos.filter((video) => {
          if (video.lesson) return false;
          for (let line of video.subs_l2) {
            if (line.line.length > 50) return false;
          }
          return true;
        });

        this.rankByViews(videos);

        this.videos = videos;
      }
      this.loading = false;
      return true;
    },
    async removeVideo(video) {
      let response = await $.ajax({
        url: `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${
          video.id
        }`,
        type: "DELETE",
        contentType: "application/json",
        xhr: function () {
          return window.XMLHttpRequest == null ||
            new window.XMLHttpRequest().addEventListener == null
            ? new window.ActiveXObject("Microsoft.XMLHTTP")
            : $.ajaxSettings.xhr();
        },
      });
      if (response) {
        this.videos = this.videos.filter((v) => v.id !== video.id);
        this.updateVideos++;
      }
    },
    async removeVideoFromLesson(video) {
      let payload = { level: null, lesson: null };
      let updatedVideo = await this.$directus.patchVideo({
        id: video.id,
        l2Id: this.$l2.id,
        payload,
      });
      if (updatedVideo) {
        video = Object.assign(video, updatedVideo);
        this.lessonVideos = this.lessonVideos.filter((v) => v.id !== video.id);
        this.updateMatches();
        this.updateVideos++;
      }
    },
    async addVideoToLesson(video) {
      let payload = { level: this.level, lesson: this.lesson };
      let updatedVideo = await this.$directus.patchVideo({
        id: video.id,
        l2Id: this.$l2.id,
        payload,
      });
      if (updatedVideo) {
        video = Object.assign(video, updatedVideo);
        this.lessonVideos.push(video);
        this.updateMatches();
        this.videos = this.videos
          .filter((v) => {
            return v !== video;
          })
          .map((video) => {
            if (video.subs_l2) {
              video.matches = this.matchWords(video).filter(
                (word) => !this.matchedWords.map((w) => w.id).includes(word.id)
              );
            }
            return video;
          })
          .filter((v) => {
            return v.matches?.length > 0;
          });
      }
    },
    matchWords(video) {
      let matches = [];
      if (video.subs_l2) {
        if (!video.text)
          video.text = video.subs_l2.map((line) => line.line).join("\n");
        if (this.words && this.words.length > 0) {
          for (let word of this.words) {
            if (
              video.text.includes(word.simplified) ||
              video.text.includes(word.traditional) ||
              video.text.includes(word.head)
            ) {
              matches.push(word);
            }
          }
        }
      }
      return matches;
    },
    updateMatches() {
      // called from child
      this.matchedWords = [];
      for (let video of this.lessonVideos) {
        if (video.matches) {
          this.matchedWords = Helper.uniqueByValue(
            this.matchedWords.concat(video.matches),
            "id"
          );
        }
      }
      this.matchedWordsKey++;
    },
  },
};
</script>

<style>
</style>