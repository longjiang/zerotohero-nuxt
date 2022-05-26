<template>
  <!-- ANCHOR img/anchors/example-bar.png -->
  <div :id="id" v-cloak v-if="entry.example && entry.example !== ''">
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12 example-wrapper text-center">
          <div class="example-sentence">
            <!-- <p class="example-sentence-pinyin">{{ entry.examplePinyin }} <i class="speak glyphicon glyphicon-volume-up" v-bind:data-speak="entry.example"></i></p> -->

            <Annotate
              tag="p"
              class="example-sentence-word"
            >
              <span
                v-html="
                  highlight(entry.example, entry.simplified, entry.newHSK && entry.newHSK === '7-9' ? '7-9' : entry.hsk)
                "
              ></span>
            </Annotate>
            <p class="example-sentence-english">{{ entry.exampleTranslation }}</p>
          </div>
        </div>
      </div>
      <div class="unsplash-sources" v-if="admin">
        <div class="row mb2">
          <div class="col-sm-12">
            Search
            <input type="text" class="search-image" v-on:keyup.enter="searchImageKeyupEnter" />
          </div>
        </div>
        <div class="row">
          <div class="col-md-6 mb2" v-for="src in unsplashSrcs">
            <div class="example-image-wrapper">
              <img
                v-bind:src="src"
                alt
                class="example-image unsplash-thumb"
                v-on:click="unsplashThumbClick"
              />
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-sm-12">
            <div>
              Image URL:
              <input
                type="text"
                class="image-url d-block"
                v-on:keyup.enter="imageUrlKeyupEnter"
              />
            </div>
            <div class="mt2">
              <a
                :href="
                  'https://www.canva.com/photos/search/' +
                    HSK.simplifyEnglish(entry.english)
                "
                target="_blank"
              >Search on Canva</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  props: {
    entry: {
      type: Object
    },
    id: {
      default: 'entry-example'
    },
    scale: {
      default: 1
    }
  },
  data() {
    return {
      hasImage: true,
      image: undefined,
      admin: false
    }
  },
  methods: {
    highlight(...args) {
      return Helper.highlight(...args)
    },
    searchImageKeyupEnter(e) {
      const app = this
      WordPhotos.getSrcsFromUnsplash($(e.target).val(), function(srcs) {
        app.unsplashSrcs = srcs
      })
    },
    imageUrlKeyupEnter(e) {
      var $input = $(e.target)
      var url = $(e.target).val()
      this.uploadPhotoAndUpdate(url, $input)
    },
    uploadPhotoAndUpdate(url, $button) {
      WordPhotos.savePhoto(this.entry, url, function(response) {
        $button.after('<span class="success">Uploaded</span>')
        this.hasImage = true
        this.image = response.url + '?' + Date.now()
        setTimeout(function() {
          $('.success').remove()
        }, 3000)
      })
    },
    unsplashThumbClick(e) {
      var $button = $(e.target)
      var url = $button.attr('src')
      this.uploadPhotoAndUpdate(url, $button)
    }
  }
}
</script>

<style>
.example-sentence p,
.lyrics p {
  margin: 0;
}

.example-sentence-word {
  font-weight: bold;
  font-size: 1.3rem;
}

.example-sentence .example-sentence-english {
  margin-top: 0.5rem;
}

.example-image-wrapper {
  padding-bottom: 56%;
  height: 0;
  position: relative;
  width: 100%;
  margin-bottom: 1rem;
}

.example-image {
  width: 100%;
  display: block;
  margin: 0 auto;
  height: 100%;
  position: absolute;
  object-fit: cover;
}

.unsplash-sources {
  background: white;
  padding: 2rem;
  overflow: hidden;
}

.unsplash-sources img {
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
}
</style>