<router>
  {
    path: '/:l1/:l2/book/index',
    name: 'book-index',
    props: route => ({ args: route.query.url })
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5" id="book-index">
      <SocialHead
        v-if="book"
        :title="`${$l2.name} Guided Reader: ${book.title}${
          book.author ? ' by ' + book.author : ''
        } | Language Player`"
        :image="`${book.thumbnail ? book.thumbnail : '/img/books-1.png'}`"
        :description="`Annoated ${
          $l2.name
        } book with learning tools. The whole book: ${book.chapters
          .map((c) => c.title)
          .join(', ')}`"
      />
      <div class="row mb-5">
        <div class="col-sm-12">
          <SimpleSearch
            placeholder="Enter the URL of a book from a variety of eBook websites"
            :action="
              (url) => {
                this.$router.push({
                  path: `/${$l1.code}/${
                    $l2.code
                  }/book/index?url=${encodeURIComponent(url)}`,
                });
              }
            "
            :text="decodeURIComponent(this.args)"
            ref="search"
          />
        </div>
      </div>
      <div class="row" v-if="book">
        <div class="col-sm-12 text-center" :key="'book-' + book.title">
          <img
            :src="
              book.thumbnail
                ? `${IMAGE_PROXY}?${book.thumbnail}`
                : `/img/book-thumb-${Math.floor(Math.random() * 10)}.jpg`
            "
            alt="Book cover"
            class="mb-4 shadow book-thumb"
            data-not-lazy
          />
          <Annotate
            v-if="book.title"
            :showTranslate="true"
            tag="div"
            :buttons="false"
          >
            <h6>
              <em>{{ book.title }}</em>
            </h6>
            <p>{{ book.author }}</p>
          </Annotate>
          <div class="list-group text-left">
            <router-link
              v-for="(chapter, index) in book.chapters"
              class="link-unstyled"
              :key="`chapter-${chapter.title}-${index}`"
              :to="`/${$l1.code}/${
                $l2.code
              }/book/chapter?url=${encodeURIComponent(chapter.url)}`"
            >
              <Annotate
                :class="{
                  'list-group-item': true,
                  active:
                    $route.fullPath ===
                    `/${$l1.code}/${
                      $l2.code
                    }/book/chapter?url=${encodeURIComponent(chapter.url)}`,
                }"
                :buttons="false"
              >
                <span>{{ chapter.title }}</span>
              </Annotate>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { IMAGE_PROXY } from "@/lib/utils";
import Library from "@/lib/library";
import SimpleSearch from "@/components/SimpleSearch";

export default {
  props: {
    method: {
      type: String,
    },
    args: {
      type: String,
    },
  },
  components: {
    SimpleSearch,
  },
  data() {
    return {
      IMAGE_PROXY,
      book: undefined,
    };
  },
  mounted() {
    let url = decodeURIComponent(this.args);
    this.$refs.search.text = url;
  },
  async created() {
    let url = decodeURIComponent(this.args);
    try {
      let libraryL2 = await (
        await import(`@/lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
      ).default;
      await Library.setLangSources(libraryL2.sources);
    } catch (err) {
      console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
    }
    let book = await Library.getBook(url);
    if (book) {
      book.chapters =
        book.chapters && book.chapters.length > 0
          ? book.chapters
          : [
              {
                title: "Read",
                url: encodeURIComponent(this.args),
              },
            ];
      this.book = book;
    } else {
      this.$router.push({
        path: `/${this.$l1.code}/${
          this.$l2.code
        }/book/chapter?url=${encodeURIComponent(this.args)}`,
      });
    }
  },
};
</script>

<style></style>
