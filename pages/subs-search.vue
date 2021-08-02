<router>
  {
    path: '/:l1/:l2/youtube/search-subs/:term?',
    props: true,
    meta: {
      title: 'Search Subtitles | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Search subtitles across the saved YouTube videos (like YouGlish).'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <SimpleSearch
            class="mb-5"
            :placeholder="`Search across ${$l2.name} YouTube subtitles`"
            buttonText="Search"
            :action="
              url => {
                this.$router.push({path: `/${$l1.code}/${
                  $l2.code
                }/youtube/search-subs/${encodeURIComponent(url)}`})
              }
            "
            ref="search"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-12">
          <LazySearchSubsComp :term="term" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    term: {
      type: String,
    },
  },
  watch: {
    term() {
      this.updateSearchText()
    },
  },
  mounted() {
    this.updateSearchText()
  },
  methods: {
    updateSearchText() {
      let termDecoded = decodeURIComponent(this.term)
      this.$refs.search.text = termDecoded
    }
  }
}
</script>
<style lang="scss">
</style>
