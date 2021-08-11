<router>
  {
    path: '/:l1/:l2/library'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5" id="library">
      <SocialHead
        v-if="booklists"
        :title="`${$l2.name} Guided Readers: ${booklists
          .slice(0, 1)
          .map((b) => b.title)
          .join(', ')} and more | ${$l2.name} Zero to Hero`"
        image="/img/books-1.png"
        :description="`Annoated ${
          $l2.name
        } books with learning tools: ${booklists
          .slice(2)
          .map((b) => b.title)
          .join(', ')}`"
      />
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5 text-center">{{ $l2.name }} Guided Readers</h3>
          <p class="text-center lead" style="margin-bottom: 5rem">
            {{
              $t(
                "This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.",
                { l2: $t($l2.name) }
              )
            }}
          </p>

          <ul class="list-unstyled p-0 mb-5 booklists">
            <li
              v-for="(booklist, index) in booklists"
              :key="`booklist-item-${index}`"
              class="text-center mb-5"
            >
              <router-link
                class="link-unstyled"
                :to="`/${$l1.code}/${
                  $l2.code
                }/book/list?url=${encodeURIComponent(booklist.url)}`"
              >
                <img
                  :src="`/img/books-${Math.floor(Math.random() * 10)}.png`"
                  class="shadowed book-thumb mb-4"
                  data-not-lazy
                />
                <h5 class="mt-3">
                  <Annotate tag="b">
                    <span>{{ booklist.title }}</span>
                  </Annotate>
                </h5>
                <p class="mb-0" style="color: #aaa" v-if="source(booklist.url)">
                  Source: {{ source(booklist.url).name }}
                </p>
              </router-link>
            </li>
          </ul>

          <hr class="mb-5" />

          <h3 class="text-center mt-5 mb-4">{{ $t("Custom Reading") }}</h3>

          <p class="text-center lead mb-5">
            {{ $t("Read any online document by pasting the URL.") }}
          </p>

          <div class="jumbotron bg-light pt-4 pb-3 mt-3 mb-3">
            <SimpleSearch
              placeholder="Enter the URL of a book from one of the sites below."
              :action="
                (url) => {
                  this.$router.push({
                    path: `/${$l1.code}/${
                      $l2.code
                    }/book/index?url=${encodeURIComponent(url)}`,
                  });
                }
              "
              class="mb-3"
              ref="search"
            />
            <p>
              We can work with these content providers.
              <b>Copy paste</b>
              URLs like the following into the above text box and enjoy reading!
            </p>
            <ul>
              <li
                v-for="(source, index) in sources"
                :key="`library-source-${index}`"
              >
                {{ source.name }}, example URL:
                <code
                  v-if="typeof source.example === 'function'"
                  v-html="`${source.example($l2.code)}`"
                ></code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Library from "@/lib/library";
import SimpleSearch from "@/components/SimpleSearch";

export default {
  components: {
    SimpleSearch,
  },
  props: {
    args: {
      type: String,
    },
  },
  data() {
    return {
      booklists: [],
      sources: [],
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
  },
  methods: {
    source(url) {
      return Library.source(url);
    },
  },
  async fetch() {
    try {
      let libraryL2 = await (
        await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
      ).default;
      Library.setLangSources(libraryL2.sources);
      this.booklists = await libraryL2.booklists();
    } catch (err) {
      console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
    }
    this.sources = Library.sources();
  },
};
</script>

<style lang="scss">
.booklists {
  display: flex;
  flex-wrap: wrap;
}
.booklists li {
  flex: 1;
  min-width: 15rem;
}
</style>
