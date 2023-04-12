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
            content: 'Assign videos to enforce lesson vocabulary.'
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
        />
        <h4 class="mt-5 mb-4">More Videos</h4>
        <b-button @click="refresh()">Refresh</b-button>
        <LazyYouTubeVideoList
          :noThumbs="false"
          :updateVideos="updateVideos"
          :videos="videos"
          :checkSubs="false"
          :assignLessonMode="true"
          :lesson="lesson"
          :level="level"
          skin="dark"
        />
      </div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList";
import Helper from "@/lib/helper";

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
    };
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
  },
  methods: {
    async refresh() {
      await this.getVideos();
      this.updateVideos++;
    },
    async getLessonVideos() {
      this.lessonVideos = [];
      let videos = await this.$directus.getVideos(
        { l2Id: this.$l2.id, query: `filter[l2][eq]=${
          this.$l2.id
        }&filter[level][eq]=${this.level}&filter[lesson][eq]=${this.lesson}`}
      );
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
    async getVideos() {
      let words = this.unmatchedWords;
      this.videos = [];
      let videos = [];
      if (words.length > 0) {
        if (videos.length === 0) {
          let promises = [];
          for (let word of words.slice(0, 10)) {
            let wordForms =
              this.$l2.han && this.$l2.code !== "ja"
                ? [word.simplified, word.traditional]
                : [word.head];
            wordForms = Helper.unique(wordForms);
            for (let wordForm of wordForms) {
              let query = `?filter[l2][eq]=${
                this.$l2.id
              }&filter[lesson][null]&filter[subs_l2][contains]=${JSON.stringify(
                wordForm
              ).replace(/"/gi, "")}&limit=200`;
              let promise = new Promise(async (resolve, reject) => {
                let newVideos = await this.$directus.getVideos({
                  l2Id: this.$l2.id,
                  query: query,
                });
                videos = videos.concat(newVideos)
                resolve();
              });
              promises.push(promise);
            }
          }
          await Promise.all(promises);
        }
        videos = Helper.uniqueByValue(videos, "id");
        if (videos.length > 0) {
          videos = videos.map((video) => {
            if (video.subs_l2) {
              video.subs_l2 = this.$subs.parseSavedSubs(video.subs_l2);
              video.matches = this.matchWords(video).filter(
                (word) => !this.matchedWords.map((w) => w.id).includes(word.id)
              );
            }
            return video;
          });
        }
        videos = videos.filter((video) => {
          for (let line of video.subs_l2) {
            if (line.line.length > 50) return false;
          }
          return true;
        });

        videos = videos
          .sort((a, b) => {
            let aScore = a.text ? a.text.length || 0 : 0;
            let bScore = b.text ? b.text.length || 0 : 0;
            return aScore - bScore;
          })
          .sort((a, b) => {
            let aScore = a.matches ? a.matches.length || 0 : 0;
            let bScore = b.matches ? b.matches.length || 0 : 0;
            return bScore - aScore;
          });
        videos = Helper.uniqueByValue(videos, "youtube_id");
        if (this.lessonVideos.length > 0) {
          videos = videos.filter((video) => {
            let overlap = this.lessonVideos.filter(
              (lessonVideo) => video.id === lessonVideo.id
            );
            return overlap.length === 0;
          });
        }

        this.videos = videos;
      }
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
      let response = await $.ajax({
        url: `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${
          video.id
        }`,
        data: JSON.stringify({ level: null, lesson: null }),
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
        video = Object.assign(video, response.data);
        this.lessonVideos = this.lessonVideos.filter((v) => v.id !== video.id);
        this.updateMatches();
        this.updateVideos++;
      }
    },
    async addVideoToLesson(video) {
      let response = await $.ajax({
        url: `${this.$directus.youtubeVideosTableName(this.$l2.id)}/${
          video.id
        }`,
        data: JSON.stringify({ level: this.level, lesson: this.lesson }),
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
        video = Object.assign(video, response.data);
        this.lessonVideos.push(video);
        this.updateMatches();
        this.videos = this.videos
          .filter((v) => v != video)
          .map((video) => {
            if (video.subs_l2) {
              video.matches = this.matchWords(video).filter(
                (word) => !this.matchedWords.map((w) => w.id).includes(word.id)
              );
            }
            return video;
          })
          .sort((a, b) => {
            let aScore = a.matches
              ? Math.pow(a.matches.length, 4) / a.text.length || 0
              : 0;
            let bScore = b.matches
              ? Math.pow(b.matches.length, 4) / b.text.length || 0
              : 0;
            return bScore - aScore;
          });
      }
    },
    matchWords(video) {
      let matches = [];
      if (video.subs_l2) {
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