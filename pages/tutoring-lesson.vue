<router>
  {
    path: '/:l1/:l2/tutoring/lesson/:id',
    props: true,
    meta: {
      title: 'Tutoring Kit | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Tools to help you get the most out of your online tutoring lessons.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main pt-5 pb-5">
    <div class="row">
      <div class="col-sm-12">
        <div v-if="lesson">
          <h6>
            <a class="link-unstyled" :href="`/${$l1.code}/${$l2.code}/tutoring/`">{{ $l2.name }} Tutoring Kit</a> /
            <a class="link-unstyled" :href="`/${$l1.code}/${$l2.code}/tutoring/${Helper.level(lesson.level).replace('-', '')}`"><span
              :data-level="Helper.level(lesson.level).replace('-', '')"
            >{{ Helper.level(lesson.level) }} Level</span></a>
          </h6>
          <hr />

          <h1 class="mt-5 mb-5 text-center">{{ lesson.name }}</h1>
          <div class="jumbotron shadow rounded mt-5 mb-5 pt-5 pb-3 bg-white topics">
            <h6 class="mb-4">Topic focus:</h6>
            <div v-html="lesson.subjects"></div>
            <h6 class="mt-5 mb-4">Vocabulary focus:</h6>
            <div v-html="lesson.vocabulary"></div>
          </div>
          <div class="lesson-section"  v-if="lesson.youtubeVideos">
            <h4>Pre-Study</h4>
            <p>Watch any one of the videos and study the subtitles:</p>
            <YouTubeVideoList :videos="lesson.youtubeVideos" />
          </div>
          <div class="lesson-section">
            <h4>Activity 1: Read Together</h4>
            <p>Read any one of the following articles with the help of your tutor. Use the <a target="_blank" :href="`/${$l1.code}/${$l2.code}/reader`">Text Reader</a> for word lookup.</p>
            <div v-if="!lesson.readings" v-html="lesson.reading"></div>
            <div v-else>
              <div v-for="reading in lesson.readings" class="reading-card rounded shadow p-3 mb-4">
                <a class="link-unstyled" :href="reading.url" target="_blank">
                  <h6>{{ reading.title }}</h6>
                  <div>{{ reading.body | striphtml | truncate(150, '...') }}</div>
                </a>
              </div>
            </div>
          </div>
          <div class="lesson-section">
            <h4>Activity 2: Free Talk</h4>
            <div v-html="lesson.free_talk"></div>
            <p>• Describe one of the pictures to your tutor, and ask him or her to guess which picture you are talking about.</p>
            <div
              class="image-wall"
              :key="`web-images-${lesson.name}`"
              v-cloak
              v-if="images && images.length > 0"
            >
              <img
                alt
                class="image-wall-image"
                v-for="(image, index) in images"
                :key="`web-images-${lesson.name}-${index}`"
                :src="`${Config.imageProxy}?${image.src}`"
                @click="goto(image.url)"
              />
            </div>
          </div>
          <div class="lesson-section">
            <h4>Homework: Writing</h4>
            <p>Complete the following task as homework, and go over with your tutor at the next session.</p>
            <div v-html="lesson.writing"></div>
          </div>
        </div>
        <hr class="mt-5 mb-5" />
        <p>
          <b>About this kit: </b>When you are having a lesson with either a free language exchange partner or a paid tutor through services such as
          <a
            href="https://www.tandem.net/"
          >Tandem</a>,
          <a href="https://amikumu.com/">Amikumu</a>,
          <a href="https://www.italki.com/">iTalki</a>,
          <a href="https://www.hellotalk.com/">HelloTalk</a> or
          <a href="https://preply.com/">Preply</a>, you can make use of this lesson kit to give structure and content to your lesson.
        </p>
        <p>The kit is based around the Cambridge <em>Touchstone</em> and <em>Viewpoint</em> series of American English textbooks.</p>
      </div>
    </div>
  </div>
</template>

<script>
import WordPhotos from '@/lib/word-photos'
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import YouTubeVideoList from '@/components/YouTubeVideoList'

export default {
  components: {
    YouTubeVideoList
  },
  props: ['id'],
  data() {
    return {
      Config,
      Helper,
      lesson: undefined,
      images: []
    }
  },
  methods: {
    async route() {
      let lesson = (await $.getJSON(
        `${Config.wiki}items/tutoring_kit/${this.id}`
      )).data
      let readings = (await $.getJSON(
        `${Config.wiki}items/reading?filter[l2][eq]=${this.$l2.id}&filter[lesson][eq]=${this.id}`
      )).data
      let youtubeVideos = (await $.getJSON(
        `${Config.wiki}items/youtube_videos?filter[l2][eq]=${this.$l2.id}&filter[lesson][eq]=${this.id}`
      )).data.map(video => {
        return {
          youtube_id: video.youtube_id,
          title: video.title
        }
      })
      if (lesson) {
        this.lesson = lesson
        this.lesson.readings = readings
        this.lesson.youtubeVideos = youtubeVideos
        this.updateImages(this.$l2.name + ' ' + this.lesson.name)
      }
    },
    async updateImages(term) {
      this.images = []
      let images = (await WordPhotos.getGoogleImages({
        term: `${this.$l2.name} + ${term}`,
        lang: 'en'
      }))
      this.images = images
    }
  },
  watch: {
    $route() {
      if (this.$route.name === 'tutoring-lesson') {
        this.route()
      }
    }
  },
  created() {
    this.route()
  }
}
</script>

<style lang="scss" scoped>
.reading-card {
  div {
    opacity: 0.5;
  }
}
.topics-heading {
  margin-top: 1rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.lesson-section {
  margin-top: 3rem;
  h4 {
    border-bottom: 1px solid #ddd;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
}
.image-wall {
  display: flex;
  flex-wrap: wrap;
}
.image-wall-image {
  object-fit: cover;
  flex: 1;
  height: 5rem;
  width: auto;
  background-color: #f5f5f5;
  cursor: pointer;
  margin: 0.2rem;
  max-width: 10rem;
}
.image-wall-image:last-child {
  flex: 0;
}
</style>