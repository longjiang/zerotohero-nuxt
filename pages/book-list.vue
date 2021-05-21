<router>
  {
    path: '/:l1/:l2/book/list',
    props: route => ({ args: route.query.url }),
    meta: {
      title: 'Books | Zero to Hero',
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
  <div class="container main pt-5 pb-5" id="book-list">
    <h1 class="mb-5">Book List</h1>
    <SimpleSearch
      placeholder="Enter the URL of a book list from a variety of eBook websites"
      :action="
        (url) => {
          this.$router.push({
            path: `/${this.$l1.code}/${
              this.$l2.code
            }/book/list?url=${encodeURIComponent(url)}`,
          });
        }
      "
      ref="search"
      class="mb-5"
    />
    <ul class="list-unstyled booklist">
      <li v-for="book in booklist" class="booklist-item text-center">
        <a
          :href="`/${$l1.code}/${$l2.code}/book/index?url=${encodeURIComponent(
            book.url
          )}`"
          class="link-unstyled"
        >
          <img
            :src="
              book.thumbnail
                ? `${Config.imageProxy}?${book.thumbnail}`
                : `/img/book-thumb-${Math.floor(Math.random() * 10)}.jpg`
            "
            alt="Book cover"
            class="mb-4 shadow book-thumb"
          />
          <Annotate tag="h6">
            <b>{{ book.title }}</b>
          </Annotate>
          <Annotate tag="small" v-if="book.author">
            <span>{{ book.author }}</span>
          </Annotate>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import Config from "@/lib/config";
import Library from "@/lib/library";
import SimpleSearch from "@/components/SimpleSearch";

export default {
  props: {
    args: {
      type: String,
    },
    method: {
      type: String,
    },
  },
  components: {
    SimpleSearch,
  },
  data() {
    return {
      Config,
      location,
      libraryL2: undefined,
      booklist: [],
    };
  },
  watch: {
    args() {
      this.updateURL();
    },
  },
  methods: {
    async updateURL() {
      let url = decodeURIComponent(this.args);
      this.$refs.search.text = url;
      this.booklist = [];
      try {
        this.libraryL2 = await (
          await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
        ).default;
        await Library.setLangSources(this.libraryL2.sources);
      } catch (err) {
        console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
      }
      this.booklist = await Library.getBooklist(url, this.$l1.code);
    },
  },
  async mounted() {
    this.updateURL();
  },
};
</script>
