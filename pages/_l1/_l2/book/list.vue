<template>
  <div class="main">
    <div class="container pt-5 pb-5" id="book-list">
      <SocialHead
        v-if="booklist"
        :title="`${$l2.name} Guided Readers: ${booklist
          .slice(0, 2)
          .map((b) => b.title)
          .join(', ')} and more | Language Player`"
        :image="`${
          booklist[0] && booklist[0].thumbnail
            ? booklist[0].thumbnail
            : '/img/books-1.png'
        }`"
        :description="`Annoated ${
          $l2.name
        } books with learning tools. Other titles including: “${booklist
          .slice(3)
          .map((b) => b.title)
          .join(', ')}`"
      />
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
        <li
          v-for="(book, index) in booklist"
          class="booklist-item text-center"
          :key="`book-${index}`"
        >
          <router-link
            :to="`/${$l1.code}/${$l2.code}/book/index?url=${encodeURIComponent(
              book.url
            )}`"
            class="link-unstyled"
          >
            <img
              :src="
                book.thumbnail
                  ? `${IMAGE_PROXY}?${book.thumbnail}`
                  : `/img/book-thumb-${Math.floor(Math.random() * 10)}.jpg`
              "
              alt="Book cover"
              class="mb-4 shadow book-thumb"
            />
            <h6><TokenizedText v-if="book.title" :text="book.title" /></h6>
            <small><TokenizedText v-if="book.author" :text="book.author" /></small>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { IMAGE_PROXY } from "../../../../lib/utils";
import Library from "../../../../lib/library";

export default {
  props: {
    method: {
      type: String,
    },
  },
  data() {
    return {
      IMAGE_PROXY,
      booklist: [],
      args: this.$route.query.url
    };
  },
  async created() {
    let url = decodeURIComponent(this.args);
    try {
      let libraryL2 = await (
        await import(`../../../../lib/library-l2s/library-${this.$l2["iso639-3"]}.js`)
      ).default;
      await Library.setLangSources(libraryL2.sources);
    } catch (err) {
      console.log(`Booklists for ${this.$l2["iso639-3"]} is unavailable.`);
    }
    this.booklist = await Library.getBooklist(url, this.$l1.code);
  },
  mounted() {
    let url = decodeURIComponent(this.args);
    this.$refs.search.text = url;
  },
};
</script>
