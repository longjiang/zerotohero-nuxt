<template>
  <div class="main">
    <div class="container pb-5">
      <SocialHead v-if="lesson && images && images[0]" :title="`${level(lesson.level)} ${$l2.name} Lesson Kit: “${lesson.name
        }” | Language Player`" :description="`Topic focus: ${lesson.subjects.replace(/<.*?>/gi, '')}`"
        :image="images[0].src" />
      <div class="row">
        <div class="col-sm-12">
          <h6 class="text-center">
            <router-link class="link-unstyled" :to="`/${$l1.code}/${$l2.code}/tutoring/`">
              {{ $l2.name }} Tutoring Kit
            </router-link>
            /
            <router-link class="link-unstyled" :to="`/${$l1.code}/${$l2.code}/tutoring/${lesson.level}`" v-if="lesson">
              <span :data-level="level(lesson.level).replace('-', '')">
                {{ level(lesson.level) }} Level
              </span>
            </router-link>
          </h6>
          <div class="nav-btns mb-3 text-center">
            <router-link v-if="Number(id) > 1" :to="{
              name: 'l1-l2-tutoring-lesson-id',
              params: { id: Number(id) - 1 },
            }" :class="`btn btn-sm btn-${$skin}`">
              <i class="fa fa-chevron-left"></i> {{ $t('Previous') }}
            </router-link>
            <router-link :to="{
              name: 'l1-l2-tutoring-lesson-id',
              params: { id: Number(id) + 1 },
            }" :class="`btn btn-sm btn-${$skin}`">
              {{ $t('Next') }} <i class="fa fa-chevron-right"></i> 
            </router-link>
          </div>
          <h2 class="text-left" style="
                margin-top: 2rem;
                margin-bottom: 0;
                text-transform: uppercase;
              " v-if="lesson">
            {{ lesson.name }}
          </h2>
        </div>
        <div class="col-sm-12 col-xl-6" v-if="lesson">
          <div class="lesson-section">
            <h4>Topic Focus</h4>
            <div v-html="removeInlineStylesFromString(lesson.subjects)"></div>
            <h6 class="mt-5 mb-4">Vocabulary focus:</h6>
            <div v-html="removeInlineStylesFromString(lesson.vocabulary)"></div>
          </div>
          <div class="lesson-section">
            <h4>Free Talk</h4>
            <div v-html="removeInlineStylesFromString(lesson.free_talk)"></div>
            <p>
              • Describe one of the pictures to your tutor, and ask him or her
              to guess which picture you are talking about.
            </p>
            <div class="image-wall" :key="`web-images-${lesson.name}`" v-cloak v-if="images && images.length > 0">
              <img alt class="image-wall-image" v-for="(image, index) in images"
                :key="`web-images-${lesson.name}-${index}`" :src="`${IMAGE_PROXY}?${image.src}`"
                @click="goto(image.url)" />
            </div>
          </div>
        </div>
        <div class="col-sm-12 col-xl-6">
          <div v-if="lesson">
            <div class="lesson-section" v-if="lesson.youtubeVideos">
              <h4>Watch and Learn</h4>
              <p>Watch any one of the videos and study the subtitles:</p>
              <LazyYouTubeVideoList v-if="lesson.youtubeVideos.length > 0" :videos="lesson.youtubeVideos"
                :showProgress="true" />
              <LazyYouTubeSearchResults v-if="lesson.youtubeVideos.length === 0" :term="`${$l2.name} ${lesson.name}`"
                :start="0" :hideVideosWithoutSubs="true" :showPaginator="false" :showProgress="true" />
            </div>
            <div class="lesson-section">
              <h4>Read Together</h4>
              <p>
                Read any one of the following articles with the help of your
                tutor. Use the
                <a target="_blank" :href="`/${$l1.code}/${$l2.code}/reader`">
                  Text Reader
                </a>
                for word lookup.
              </p>
              <div v-if="!lesson.readings" v-html="removeInlineStylesFromString(lesson.reading)"></div>
              <div v-else>
                <div v-for="(reading, index) in lesson.readings" class="reading-card rounded shadow p-3 mb-4"
                  :key="`lesson-readings-${index}`">
                  <a class="link-unstyled" :href="reading.url" target="_blank">
                    <h6>{{ reading.title }}</h6>
                    <div>
                      {{ reading.body | striphtml | truncate(150, "...") }}
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div class="lesson-section">
              <h4>Homework: Writing</h4>
              <p>
                Complete the following task as homework, and go over with your
                tutor at the next session.
              </p>
              <div v-html="removeInlineStylesFromString(lesson.writing)"></div>
            </div>
          </div>
        </div>
        <div class="col-sm-12">
          <hr class="mt-5 mb-5" />
          <p>
            <b>About this kit:</b>
            When you are having a lesson with either a free language exchange
            partner or a paid tutor through services such as
            <a href="https://www.tandem.net/">Tandem</a>
            ,
            <a href="https://amikumu.com/">Amikumu</a>
            ,
            <a href="https://www.italki.com/affshare?ref=zerotohero">iTalki</a>
            ,
            <a href="https://www.hellotalk.com/">HelloTalk</a>
            or
            <a href="https://preply.com/">Preply</a>
            , you can make use of this lesson kit to give structure and content
            to your lesson.
          </p>
          <p>
            The kit is based around the Cambridge
            <em>Touchstone</em>
            and
            <em>Viewpoint</em>
            series of American English textbooks.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordPhotos from "../../../../../lib/word-photos";
import { removeInlineStylesFromString, level, IMAGE_PROXY } from "../../../../../lib/utils";

export default {
  props: ["id"],
  data() {
    return {
      lesson: undefined,
      images: [],
      IMAGE_PROXY
    };
  },
  async created() {
    let lesson = await this.$directus.get(`items/tutoring_kit/${this.id}`);
    lesson = lesson.data.data;
    let readings = await this.$directus.get(
      `items/reading?filter[l2][eq]=${this.$l2.id}&filter[lesson][eq]=${this.id}`
    );
    readings = readings.data.data;
    let youtubeVideos = await this.$directus.get(
      `${this.$directus.youtubeVideosTableName(this.$l2.id)}?filter[l2][eq]=${this.$l2.id}&filter[lesson][eq]=${this.id}`
    );
    youtubeVideos = youtubeVideos.data.data.map((video) => {
      return {
        youtube_id: video.youtube_id,
        title: video.title,
      };
    });
    if (lesson) {
      this.lesson = lesson;
      this.lesson.readings = readings;
      this.lesson.youtubeVideos = youtubeVideos;
      this.images = await this.getImages(
        this.$l2.name + " " + this.lesson.name
      );
    }
  },
  methods: {
    removeInlineStylesFromString(...args) {
      return removeInlineStylesFromString(...args);
    },
    async getImages(term) {
      let images = await WordPhotos.getGoogleImages({
        term: `${this.$l2.name} + ${term}`,
        lang: "en",
      });
      return images;
    },
    level(level) {
      return level(level, this.$l2).name;
    },
  },
  computed: {
  },
};
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
  margin-top: 2.5rem;

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