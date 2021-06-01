<router>
  {
    path: '/:l1/:l2/tv-shows',
    props: true
  }
</router>
<template>
  <div class="main container" id="main">
    <SocialHead
      v-if="shows[0]"
      :title="`Learn ${$l2.name} with TV Shows | ${$l2.name} Zero to Hero`"
      :description="`Learn ${$l2.name} with TV shows.`"
      :image="`https://img.youtube.com/vi/${shows[0].youtube_id}/hqdefault.jpg`"
    />
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5 mb-5">Study {{ $l2.name }} with {{ shows.length ? shows.length : '' }} TV Shows</h3>
        <div class="tv-shows mb-5">
          <div class="tv-show media rounded shadow" v-for="show of shows">
            <router-link
              class="youtube-thumbnail-wrapper aspect-wrapper d-block"
              :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/all/0/${encodeURIComponent(show.title)}`"
            >
              <img
                :src="`//img.youtube.com/vi/${show.youtube_id}/hqdefault.jpg`"
                class="youtube-thumbnail aspect"
                v-lazy-load
              />
            </router-link>
            <div class="media-body">
              <router-link
                :to="`/${$l1.code}/${$l2.code}/youtube/browse/all/all/0/${show.title}`"
                class="link-unstyled"
              >
                <h6>
                  <Annotate>
                    <span>{{ show.title }}</span>
                  </Annotate>
                </h6>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/lib/config'
import Helper from '@/lib/helper'
import axios from 'axios'

export default {
  data() {
    return {
      shows: [],
    }
  },
  async fetch() {
    let response = await axios.get(
      `${Config.wiki}items/tv_shows?sort=title&filter[l2][eq]=${
        this.$l2.id
      }&limit=500&timestamp=${this.$settings.adminMode ? Date.now() : 0}`
    )
    let shows = response.data.data.sort((x,y)=>x.title.localeCompare(y.title, this.$l2.code)) || []
    this.shows = Helper.uniqueByValue(shows, 'youtube_id')
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
  },
  methods: {
  },
}
</script>

<style scoped>
.tv-shows {
  display: flex;
  flex-wrap: wrap;
}
.tv-show {
  min-width: 15rem;
  max-width: 480px;
  flex: 1;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
.tv-show-thumbnail {
  width: 100%;
  max-height: 270px;
  object-fit: cover;
}
</style>