<router>
  {
    path: '/:l1/:l2/phrasebooks',
    props: true
  }
</router>
<template>
  <div class="main container" id="main">
    <div class="row">
      <div class="col-sm-12">
        <h3 class="text-center mt-5 mb-5">{{ $l2.name }} Phrasebooks</h3>
        <div class="mb-5">
          <div
            :class="{
              'loader text-center': true,
              'd-none': phrasebooks,
            }"
            style="flex: 1"
          >
            <div class="heartbeat-loader"></div>
          </div>

          <ul
            class="list-unstyled p-0 mb-5 booklists"
            v-if="phrasebooks && phrasebooks.length > 0"
          >
            <li
              v-for="(phrasebook, phrasebookIndex) in phrasebooks"
              class="text-center mb-5"
              :key="`phrasebook-${phrasebookIndex}`"
            >
              <router-link
                class="link-unstyled"
                :to="`/${$l1.code}/${$l2.code}/phrasebook/${phrasebook.id}/`"
              >
                <img
                  :src="`/img/book-thumb-${phrasebook.id % 10}.jpg`"
                  class="shadowed book-thumb mb-4"
                  data-not-lazy
                />
                <h5 class="mt-3">{{ phrasebook.title }}</h5>
              </router-link>
            </li>
          </ul>
          <div
            class="text-center"
            v-if="phrasebooks && phrasebooks.length === 0"
          >
            Sorry, we could not find any phrasebooks for {{ $l2.name }} 😭.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from "@/lib/config";
import axios from "axios";

export default {
  data() {
    return {
      phrasebooks: undefined,
    };
  },
  async fetch() {
    let response = await axios.get(
      `${Config.wiki}items/phrasebook?filter[l2][eq]=${
        this.$l2.id
      }&fields=id,title,l2&limit=500&timestamp=${
        this.$adminMode ? Date.now() : 0
      }`
    );
    if (response && response.data) this.phrasebooks = response.data.data;
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
  },
  methods: {},
};
</script>

<style scoped>
</style>