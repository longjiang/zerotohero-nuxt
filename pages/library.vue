<router>
  {
    path: '/:l1/:l2/library',
    meta: {
      title: 'Library | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Read free, open books with hover dictionary and save new words for review.'
        }
      ]
    }
  }
</router>
<template>
  <div class="container pt-5 pb-5 main" id="library">
    <div class="row">
      <div class="col-sm-12">
        <h1 class="mb-5 text-center">{{ $t("Library") }}</h1>
        <p class="text-center lead" style="margin-bottom: 5rem">
          {{
            $t(
              "This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.",
              { l2: $t($l2.name) }
            )
          }}
        </p>

        <ul class="list-unstyled p-0 mb-5 booklists">
          <li v-for="booklist in booklists" class="text-center mb-5">
            <a
              class="link-unstyled"
              :href="`/${$l1.code}/${
                $l2.code
              }/book/list?url=${encodeURIComponent(booklist.url)}`"
            >
              <img
                :src="`/img/books-${Math.floor(Math.random() * 10)}.png`"
                class="shadowed book-thumb mb-4"
              />
              <h5 class="mt-3">
                <Annotate tag="b">
                  <span>{{ booklist.title }}</span>
                </Annotate>
              </h5>
              <p
                class="mb-0"
                style="color: #aaa"
                v-if="Library.source(booklist.url)"
              >
                Source: {{ Library.source(booklist.url).name }}
              </p>
            </a>
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
            <li v-for="(source, index) in sources" :key="`library-source-${index}`">
              {{ source.name }}, example URL:
              <code v-if="typeof source.example === 'function'" v-html="`${source.example($l2.code)}`"></code>
            </li>
          </ul>
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
      Library,
      libraryL2: undefined,
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
  async mounted() {
    try {
      this.libraryL2 = await (
        await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
      ).default;
      Library.setLangSources(this.libraryL2.sources);
      this.booklists = await this.libraryL2.booklists();
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
