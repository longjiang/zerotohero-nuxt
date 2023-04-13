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
        :title="`${$l2.name} Books: ${booklists
          .slice(0, 1)
          .map((b) => b.title)
          .join(', ')} and more | Language Player`"
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
          <h3 class="mb-5 text-center">
            {{ $t("{l2} Books", { l2: $t($l2.name) }) }}
          </h3>
          <p
            class="text-center lead"
            style="margin-bottom: 5rem"
            v-if="booklists && booklists.length > 0"
          >
            {{
              $t(
                "This is where you can enjoy reading a variety of {l2} books with the help of hover dictionary and the ability to save words.",
                { l2: $t($l2.name) }
              )
            }}
          </p>
          <p class="text-center lead" style="margin-bottom: 5rem" v-else>
            {{
              $t("Sorry, no books are currently available for {l2}.", {
                l2: $t($l2.name),
              })
            }}
          </p>

          <ul
            class="list-unstyled p-0 booklists"
            v-if="booklists && booklists.length > 0"
          >
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

          <div
            v-if="$l2.han && $l2.code !== 'lzh'"
            class="text-center lead rounded bg-gray p-3 mt-3"
          >
            Also check out the
            <router-link to="/en/lzh/library">
              Classical Chinese library
            </router-link>
            .
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
