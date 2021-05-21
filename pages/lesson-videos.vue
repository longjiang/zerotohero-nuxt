<router>
  {
    path: '/:l1/:l2/lesson-videos/:level?/:lesson?',
    props: true,
    meta: {
      title: 'Extra Lesson Videos | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Reinforce the vocabulary you learned in an HSK lesson by watching YouTube videos.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <div class="row">
      <div class="col-md-12 text-center">
        <h3 class="mt-5">
          Expansion videos for
          <b-dropdown id="dropdown-1" :text="levels[level]" class="ml-1">
            <b-dropdown-item
              v-for="(title, slug) in levels"
              @click="changeLevel(slug)"
            >
              {{ title }}
            </b-dropdown-item>
          </b-dropdown>
          <b-dropdown id="dropdown-1" :text="`Lesson ${lesson}`" class="ml-1">
            <b-dropdown-item
              v-for="lesson in levelLessons[level]"
              @click="changeLesson(lesson)"
            >
              Lesson {{ lesson }}
            </b-dropdown-item>
          </b-dropdown>
        </h3>
        <p class="mt-3 mb-5">
          After finishing
          <a
            :href="`https://courses.chinesezerotohero.com/p/hsk-${level}-course`"
            target="_blank"
          >
            <b>HSK {{ level }} Lesson {{ lesson }}</b>
          </a>
          , reinforce the vocabulary you learned in the lesson by watching these
          {{ lessonVideos.length }} videos:
        </p>
      </div>
    </div>
    <div v-if="loading" class="text-center">
      <Loader :sticky="true" />
    </div>
    <div class="row mb-4" v-for="(video, videoIndex) in lessonVideos">
      <div class="col-lg-2"></div>
      <div class="col-md-6 col-lg-4">
        <YouTubeVideoList
          :checkSubs="false"
          :lesson="true"
          :updateVideos="updateLessonVideos"
          :videos="[video]"
        />
      </div>
      <div class="col-md-6 col-lg-4">
        <h5 class="mt-3">Vocabulary covered</h5>
        <Loader
          message="Loading words...<br/>Don't wait. View the video now."
        />
        <WordList
          :words="video.matches"
          :key="`matched-words-${videoIndex}-${matchedWordsKey}`"
        ></WordList>
      </div>
      <div class="col-lg-2"></div>
    </div>
    <div class="row mt-5 mb-5">
      <div class="col-lg-2"></div>
      <div class="col-md-12 col-lg-8">
        <div class="jumbotron pt-4 pb-4" v-if="unmatchedWords.length > 0">
          <h4 class="mt-3 mb-4 text-center text-danger">
            Lesson words
            <em>not</em>
            covered in the videos
          </h4>
          <Loader message="Loading words..." />
          <WordList
            :words="unmatchedWords"
            :key="`unmatched-words-${matchedWordsKey}`"
          ></WordList>
        </div>
        <div class="col-sm-12 text-center">
          <router-link
            v-if="lesson > 1"
            class="btn btn-gray mr-2"
            :to="`/${$l1.code}/${$l2.code}/lesson-videos/${level}/${
              Number(lesson) - 1
            }`"
          >
            Previous Lesson
          </router-link>
          <router-link
            v-if="lesson < levelLessons[level]"
            class="btn btn-gray"
            :to="`/${$l1.code}/${$l2.code}/lesson-videos/${level}/${
              Number(lesson) + 1
            }`"
          >
            Next Lesson
          </router-link>
        </div>
      </div>
      <div class="col-lg-2"></div>
    </div>
  </div>
</template>

<script>
import WordList from "@/components/WordList";
import YouTubeVideoList from "@/components/YouTubeVideoList";
import Loader from "@/components/Loader";
import Config from "@/lib/config";
import Helper from "@/lib/helper";

export default {
  data() {
    return {
      loading: true,
      words: [],
      matchedWords: [],
      lessonVideos: [],
      videos: [],
      levels: Helper.levels(this.$l2),
      levelLessons: {
        1: 15,
        2: 15,
        3: 20,
        4: 20,
        5: 36,
        6: 40,
      },
      updateLessonVideos: 0,
      updateVideos: 0,
      matchedWordsKey: 0,
    };
  },
  components: {
    WordList,
    YouTubeVideoList,
  },
  props: {
    level: {
      default: 1,
    },
    lesson: {
      default: 1,
    },
  },
  mounted() {
    this.route();
  },
  watch: {
    $route() {
      if (this.$route.name === "lesson-videos") {
        this.route();
      }
    },
  },
  computed: {
    unmatchedWords() {
      return this.words.filter((word) => {
        let noMatch = true;
        for (let video of this.lessonVideos) {
          if (video.matches && video.matches.includes(word)) noMatch = false;
        }
        return noMatch;
      });
    },
  },
  methods: {
    changeLevel(level) {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/lesson-videos/${level}/1`,
      });
    },
    changeLesson(lesson) {
      this.$router.push({
        path: `/${this.$l1.code}/${this.$l2.code}/lesson-videos/${
          this.level || 1
        }/${lesson}`,
      });
    },
    updateMatches() {
      for (let video of this.lessonVideos) {
        video.matches = this.matchWords(video);
      }
      this.lessonVideos = this.lessonVideos.sort(
        (a, b) => a.text.length - b.text.length
      );
      this.matchedWordsKey++;
    },
    async route() {
      await this.getLessonVideos();
      this.updateVideos++;
      this.updateLessonVideos++;
      let words = await (await this.$dictionary).lookupByLesson(
        this.level,
        this.lesson
      );
      words = words.filter((word) => !word.oofc || !word.oofc === "");
      if (this.$l2.han && this.$l2.code !== "ja") {
        this.words = Helper.uniqueByValue(words, "simplified");
      } else {
        this.words = Helper.uniqueByValue(words, "head");
      }
      this.updateMatches();
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
    async getLessonVideos() {
      this.loading = true;
      this.lessonVideos = [];
      let response = await $.getJSON(
        `${Config.wiki}items/youtube_videos?sort=-id&filter[l2][eq]=${this.$l2.id}&filter[level][eq]=${this.level}&filter[lesson][eq]=${this.lesson}`
      );
      let videos = response.data || [];
      if (videos.length > 0) {
        videos = videos.map((video) => {
          video.subs_l2 = JSON.parse(video.subs_l2);
          return video;
        });
      }
      this.loading = false;
      this.lessonVideos = Helper.uniqueByValue(videos, "youtube_id");
      this.updateLessonVideos++;
      return true;
    },
  },
};
</script>

<style>
</style>