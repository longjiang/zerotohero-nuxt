<router>
  {
    path: '/:l1/:l2/live-tv',
    props: true,
    meta: {
      skin: 'dark'
    }
  }
</router>
<template>
  <div class="main-dark">
    <div class="pt-5 pb-5 container-fluid">
      <SocialHead
        v-if="channels"
        :title="title"
        :description="description"
        :image="image"
      />
      <div class="row">
        <div
          :class="{
            'col-sm-12 mb-5': true,
            'pl-0 pr-0': portrait,
          }"
        >
          <h3 class="text-center">Learn {{ $l2.name }} from Live TV</h3>
          <div v-if="channels" class="text-center">
            {{ channels.length }} Channel(s)
          </div>
        </div>
      </div>
      <div class="row">
        <div
          :class="{
            'live-video-column': true,
            'col-sm-12 pl-0 pr-0': portrait,
            'col-sm-7 col-md-8': !portrait,
          }"
        >
          <div class="live-tv-wrapper rounded shadow" style="overflow: hidden">
            <LazyLiveVideo
              v-if="currentChannel"
              :url="currentChannel.url"
              :key="`live-video-${currentChannel.url}`"
              ref="liveVideo"
            />
          </div>
        </div>
        <div
          :class="{
            'channel-switch-wrapper': true,
            'col-sm-12': portrait,
            'col-sm-5 col-md-4 pl-0': !portrait,
          }"
        >
          <b-input-group
            :class="`${portrait ? 'mt-3' : ''} mb-3 input-group-ghost-dark`"
            style="z-index: -1"
          >
            <b-form-input
              v-model="keyword"
              @compositionend.prevent.stop="() => false"
              placeholder="Filter channels..."
              class="input-ghost-dark"
            />
            <b-input-group-append>
              <b-button variant="ghost-dark">
                <i class="fas fa-filter"></i>
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <div v-if="channels" class="tabs text-center channel-category-tabs">
            <button
              v-if="hasFeatured"
              :key="`live-tv-cat-tab-featured`"
              :class="{
                'btn mr-1': true,
                'btn-ghost-dark text-white': !featured,
                'btn-primary': featured,
              }"
              @click="
                keyword = undefined;
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
                'btn mr-1': true,
                'btn-ghost-dark text-white': !all,
                'btn-primary': all,
              }"
              @click="
                keyword = undefined;
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
                'btn mr-1': true,
                'btn-ghost-dark text-white': country !== c,
                'btn-primary': country === c,
              }"
              @click="
                keyword = undefined;
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
                'btn btn-ghost-dark mr-1': true,
                'text-white': category !== cat,
                'btn-primary text-white': category === cat,
              }"
              @click="
                keyword = undefined;
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
              'channel-buttons pt-2': true,
              'channel-buttons-portrait': portrait,
            }"
          >
            <b-button
              variant="ghost-dark"
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
                  margin-right: 0.5rem;
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
      keyword: undefined,
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
    hasFeatured() {
      return this.channels.find((c) => c.featured);
    },
    filteredChannels() {
      let channels = this.channels;
      channels = channels.filter((c) => {
        if (this.keyword && this.keyword !== '')
          return (
            c.name &&
            c.name.match(new RegExp(Helper.escapeRegExp(this.keyword), "i"))
          );
        if (this.featured) return c.featured;
        if (this.category) return c.category === this.category;
        if (this.country) return c.countries.includes(this.country);
        return true;
      });
      return channels;
    },
    all() {
      let all =
        typeof this.category === "undefined" &&
        typeof this.country === "undefined" &&
        !this.featured;
      return all;
    },
    title() {
      let title = `Learn ${this.$l2.name} from Live ${this.$l2.name} TV`;
      if (this.currentChannel) {
        title = `Watch Live: ${this.currentChannel.name}`;
      }
      title = `${title} | ${this.$l2.name} Zero to Hero`;
      return title;
    },
    description() {
      let description = `Watch ${this.$l2.name} TV Channels: ${this.channels
        .slice(0, 5)
        .map((c) => c.name)
        .join(", ")} ...`;
      if (this.currentChannel) {
        description = `Learn English by watching live ${this.$l2.name} TV right in your browser.`;
      }
      return description;
    },
    image() {
      if (this.currentChannel) {
        if (this.currentChannel.logo) return this.currentChannel.logo;
        else return undefined;
      }
      let channelsWithLogos = this.channels.filter((c) => c.logo);
      if (channelsWithLogos.length > 0) {
        return channelsWithLogos[0].logo;
      }
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
    let code = this.$l2["iso639-3"];
    if (code === "nor") code = "nob"; // Use 'Bokmal' for Norwegian.
    let res = await axios.get(
      `${Config.server}data/live-tv-channels/${code}.csv.txt`
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
        if (this.$route.query.tvgID) {
          let channel = this.channels.find(
            (c) => c.tvgID === this.$route.query.tvgID
          );
          this.setChannel(channel);
        } else {
          if (this.hasFeatured) {
            let featuredChannel = channels.find((c) => c.featured);
            this.setChannel(featuredChannel);
          } else this.setChannel(channels[0]);
        }
      }
      if (this.hasFeatured) this.featured = true;
      this.loadCategories();
      this.loadCountries();
    }
  },
  methods: {
    setChannel(channel) {
      this.currentChannel = channel;
      if (typeof window !== "undefined")
        window.history.replaceState("", "", `?tvgID=${channel.tvgID}`);
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
      if (code === "cn") return "China (Mainland)";
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
  .live-tv-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
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

@media (min-width: 540px) and (max-width: 992px) {
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