<router>
  {
    path: '/:l1/:l2/live-tv',
    props: true
  }
</router>
<template>
  <div class="main mt-4 mb-5 container-xl">
    <SocialHead
      v-if="channels"
      :title="`Learn ${$l2.name} from Live ${$l2.name} TV | ${$l2.name} Zero to Hero`"
      :description="`Watch ${$l2.name} TV Channels: ${channels
        .slice(0, 5)
        .map((c) => c.name)
        .join(', ')} ...`"
      :image="image"
    />
    <div class="row">
      <div class="col-sm-12 mb-4">
        <h4 class="text-center">Learn {{ $l2.name }} from Live TV</h4>
        <div v-if="channels" class="text-center">
          {{ channels.length }} Channel(s)
        </div>
      </div>
    </div>
    <div class="row">
      <div
        :class="{
          'live-video-column pl-0 pr-0': true,
          'col-sm-12': portrait,
          'col-sm-7 col-md-8': !portrait,
        }"
      >
        <div class="live-tv-wrapper">
          <LazyLiveVideo
            v-if="currentChannel"
            :url="currentChannel.url"
            :key="`live-video-${currentChannel.url}`"
            ref="liveVideo"
          />
          <div v-if="currentChannel" class="p-3">
            <b>Channel:</b>
            {{ currentChannel.name }}
          </div>
        </div>
      </div>
      <div
        :class="{
          'pl-0 pr-0': true,
          'col-sm-12': portrait,
          'col-sm-5 col-md-4': !portrait,
        }"
      >
        <div
          v-if="channels"
          class="tabs text-center channel-category-tabs pl-3 pr-3"
        >
          <button
            v-if="hasFeatured"
            :key="`live-tv-cat-tab-featured`"
            :class="{
              'btn btn-gray mr-1': true,
              'text-dark': !featured,
              'bg-primary text-white': featured,
            }"
            @click="
              country = undefined;
              category = undefined;
              featured = true;
            "
          >
            Featured
          </button>
          <button
            :key="`live-tv-cat-tab-all`"
            :class="{
              'btn btn-gray mr-1': true,
              'text-dark': typeof category !== 'undefined' || featured,
              'bg-primary text-white':
                typeof category === 'undefined' && typeof country === 'undefined' && !featured,
            }"
            @click="
              country = undefined;
              category = undefined;
              featured = false;
            "
          >
            All
          </button>
          <button
            v-for="c in countries"
            :key="`live-tv-cat-tab-${c}`"
            :class="{
              'btn btn-gray mr-1': true,
              'text-dark': country !== c,
              'bg-primary text-white': country === c,
            }"
            @click="
              category = undefined;
              country = c;
              featured = false;
            "
          >
            {{ c ? countryNameFromCode(c) : "Other countries" }}
          </button>
          <button
            v-for="cat in categories"
            :key="`live-tv-cat-tab-${cat}`"
            :class="{
              'btn btn-gray mr-1': true,
              'text-dark': category !== cat,
              'bg-primary text-white': category === cat,
            }"
            @click="
              country = undefined;
              category = cat;
            "
          >
            {{ cat }}
          </button>
        </div>
        <div
          v-if="channels"
          :class="{
            'channel-buttons': true,
            'channel-buttons-portrait': portrait,
          }"
        >
          <b-button
            variant="gray"
            size="sm"
            :class="{
              'channel-button': true,
              'channel-button-current': currentChannel === channel,
            }"
            v-for="channel in filteredChannels"
            :key="`channel-button-${channel.url}`"
            :data-url="channel.url"
            @click="setChannel(channel)"
          >
            <img
              v-if="channel.logo"
              :src="channel.logo"
              :alt="channel.name"
              @error="logoLoadError(channel)"
            />
            <div
              style="
                display: inline-block;
                width: 4rem;
                line-height: 2rem;
                text-align: center;
                font-size: 1.5em;
                opacity: 0.5;
              "
              v-else
            >
              <i class="fa fa-tv"></i>
            </div>
            <span>{{ channel.name }}</span>
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Config from "@/lib/config";
import Papa from "papaparse";
import Helper from "@/lib/helper";
import Vue from "vue";
import CountryCodeLookup from "country-code-lookup";

export default {
  data() {
    return {
      channels: undefined,
      currentChannel: undefined,
      category: undefined,
      country: undefined,
      featured: false,
      portrait: true,
      bannedChannels: {
        zh: [
          "http://174.127.67.246/live330/playlist.m3u8", // NTD
        ],
      },
      bannedKeywords: {
        zh: ["arirang", "cgtn", "rt", "新唐人"],
      },
      categories: [],
      countries: [],
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
    $adminMode() {
      if (typeof this.$store.state.settings.adminMode !== "undefined")
        return this.$store.state.settings.adminMode;
    },
    image() {
      let channelsWithLogos = this.channels.filter((c) => c.logo);
      if (channelsWithLogos.length > 0) {
        return channelsWithLogos[0].logo;
      }
    },
    hasFeatured() {
      return this.channels.find((c) => c.featured);
    },
    filteredChannels() {
      let channels = this.channels;
      channels = channels.filter((c) => {
        if (this.featured) return c.featured;
        if (this.category) return c.category === this.category;
        if (this.country) return c.countries.includes(this.country);
        return true
      });
      return channels;
    },
  },
  created() {
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
    this.portrait = Helper.portrait();
  },
  destroyed() {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", this.onResize);
  },
  async fetch() {
    let res = await axios.get(
      `${Config.server}data/live-tv-channels/${this.$l2["iso639-3"]}.csv.txt`
    );
    if (res && res.data) {
      let channels = Papa.parse(res.data, { header: true }).data;
      channels = Helper.uniqueByValue(channels, "url");
      channels = channels
        .filter((c) => c.url && c.url.startsWith("https://"))
        .filter((c) => c.category !== "XXX")
        .filter((c) => !c.name.includes("新唐人"));
      if (this.$l2.code in this.bannedChannels) {
        channels = channels.filter(
          (c) => !this.bannedChannels[this.$l2.code].includes(c.url)
        );
      }
      if (this.$l2.code in this.bannedKeywords) {
        channels = channels.filter((c) => {
          for (let keyword of this.bannedKeywords[this.$l2.code]) {
            if (
              c.url.includes(keyword) ||
              c.name.toLowerCase().includes(keyword)
            )
              return false;
          }
          return true;
        });
      }
      channels = channels.sort((a, b) =>
        a.name.localeCompare(b.name, this.$l2.code)
      );
      this.channels = channels;
      if (channels[0]) {
        if (this.hasFeatured)
          this.currentChannel = channels.find((c) => c.featured);
        else this.currentChannel = channels[0];
      }
      if (this.hasFeatured) this.featured = true;
      this.loadCategories();
      this.loadCountries();
    }
  },
  methods: {
    setChannel(channel) {
      this.currentChannel = channel;
    },
    logoLoadError(channel) {
      Vue.delete(channel, "logo");
    },
    loadCategories() {
      let categories = this.channels.map((c) => {
        if (!c.category) c.category = "Misc";
        return c.category;
      });
      categories = Helper.unique(categories);
      this.categories = categories;
    },
    loadCountries() {
      let countries = [];
      for (let c of this.channels) {
        if (!c.countries) c.countries = [];
        else c.countries = c.countries.split("|");
        countries = countries.concat(c.countries);
      }
      countries = Helper.unique(countries);
      this.countries = countries;
    },
    onResize() {
      this.portrait = Helper.portrait();
    },
    countryNameFromCode(code) {
      if (code === 'cn') return 'China (Mainland)'
      let country = CountryCodeLookup.byInternet(code.toUpperCase());
      if (country) return country.country;
      else return code;
    },
  },
};
</script>

<style lang="scss" scoped>
.live-video-column {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
  .live-tv-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
  }
}
.channel-button {
  &.channel-button-current {
    background-color: #fd4f1c;
    color: white;
  }
  img {
    height: 2rem;
    width: 4rem;
    object-fit: contain;
    margin-right: 0.5rem;
  }
  width: 100%;
  text-align: left;
  margin-bottom: 0.5rem;
  margin-right: 0.5rem;
  padding-left: 0.2;
}
.channel-buttons {
  padding: 1rem 0 0 1rem;
}

@media (max-width: 992px) {
  .channel-buttons {
    padding-right: 1rem;
  }
}
@media (min-width: 768px) and (max-width: 992px) {
  .channel-buttons-portrait {
    .channel-button {
      width: calc(50% - 0.25rem);
    }
    .channel-button:nth-child(even) {
      margin-right: 0;
    }
  }
}
</style>