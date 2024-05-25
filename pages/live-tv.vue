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
  <container-query :query="query" v-model="params">
    <div>
      <div class="pb-5 container-fluid">
        <SocialHead
          v-if="channels"
          :title="title"
          :description="description"
          :image="image"
        />
        <div class="row">
          <div
            :class="{
              'live-video-column': true,
              'col-sm-12': portrait,
              'col-sm-7 col-md-8': !portrait,
            }"
          >
            <div
              class="live-tv-wrapper rounded shadow"
              style="overflow: hidden"
            >
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
              'channel-switch-wrapper mt-3': true,
              'col-sm-12': portrait,
              'col-sm-5 col-md-4 pl-0': !portrait,
            }"
          >
            <!-- <b-input-group
              :class="`${portrait ? 'mt-3' : ''} mb-3`"
            >
              <b-form-input
                v-model="keyword"
                @compositionend.prevent.stop="() => false"
                :placeholder="
                  $t('Filter {num} channels...', {
                    num: this.channels ? this.channels.length : '',
                  })
                "
              />
            </b-input-group> -->
            <div v-if="channels" class="d-flex">
              <b-form-select
                v-model="country"
                @change="
                  keyword = null;
                  featured = false;
                "
                class="form-control mr-1"
              >
                <b-form-select-option :value="null">
                  {{ $t("All Countries/Regions") }}
                </b-form-select-option>
                <b-form-select-option
                  v-for="c in countries"
                  :key="`live-tv-cat-tab-${c}`"
                  :value="c"
                >
                  {{ $t(c ? countryNameFromCode(c) : 'Other countries') }}
                </b-form-select-option>
              </b-form-select>
              <b-form-select
                v-model="category"
                @change="
                  keyword = null;
                  if (category === 'featured') {
                    featured = true;
                    category = null;
                  } else {
                    featured = false;
                  }
                "
                class="form-control"
              >
                <b-form-select-option :value="null">
                  {{ $t("All Categories") }}
                </b-form-select-option>
                <b-form-select-option
                  v-for="cat in categories"
                  :key="`live-tv-cat-tab-${cat}`"
                  :value="cat"
                >
                  {{ $t(cat) }}
                </b-form-select-option>
                <b-form-select-option :value="'featured'" v-if="hasFeatured">
                  {{ $t('Featured') }}
                </b-form-select-option>
              </b-form-select>
            </div>
            <div
              v-if="channels"
              :class="{
                'channel-buttons pt-2': true,
                'channel-buttons-two-cols': portrait && !params.xs,
              }"
            >
              <b-button
                size="sm"
                :class="{
                  'channel-button': true,
                  'bg-secondary': currentChannel === channel,
                }"
                v-for="channel in filteredChannels"
                :key="`channel-button-${channel.url}`"
                :data-url="channel.url"
                @click="setChannel(channel)"
              >
                <img
                  v-if="channel.logo"
                  :src="channel.logo.replace('http:', 'https:')"
                  :alt="channel.name"
                  @error="logoLoadError(channel)"
                />
                <div class="channel-logo-placeholder" v-else>
                  <i class="fa fa-tv"></i>
                </div>
                <span>{{ channel.name }}</span>
              </b-button>
            </div>
          </div>
        </div>
        <div class="row mt-5">
          <div class="col-sm-12">
            <LazyIdenticalLanguages routeName="live-tv" />
          </div>
        </div>
      </div>
    </div>
  </container-query>
</template>

<script>
import axios from "axios";
import { unique, escapeRegExp, SERVER } from "@/lib/utils";
import Papa from "papaparse";
import Vue from "vue";
import CountryCodeLookup from "country-code-lookup";
import { ContainerQuery } from "vue-container-query";
import { Capacitor } from "@capacitor/core";
export default {
  components: {
    ContainerQuery,
  },
  data() {
    return {
      channels: undefined,
      currentChannel: undefined,
      category: null,
      country: null,
      featured: false,
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
      params: {},
      isSafari: false,
      query: {
        xs: {
          minWidth: 0,
          maxWidth: 423,
        },
        sm: {
          minWidth: 423,
          maxWidth: 720,
        },
        md: {
          minWidth: 720,
          maxWidth: 960,
        },
        lg: {
          minWidth: 960,
          maxWidth: 1140,
        },
        xl: {
          minWidth: 1140,
        },
      },
    };
  },
  computed: {
    portrait() {
      return this.params.xs || this.params.sm || this.params.md;
    },
    hasFeatured() {
      return this.channels.find((c) => c.featured);
    },
    filteredChannels() {
      return this.channels.filter((c) => {
        if (this.keyword && !c.name.match(new RegExp(escapeRegExp(this.keyword), "i"))) {
          return false;
        }
        if (this.featured && !c.featured) {
          return false;
        }
        if (this.category && c.category !== this.category) {
          return false;
        }
        if (this.country && !c.countries.includes(this.country)) {
          return false;
        }
        return true;
      });
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
      title = `${title} | Language Player`;
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
    native() {
      return Capacitor.isNativePlatform();
    },
  },
  destroyed() {
    if (typeof window !== "undefined")
      window.removeEventListener("resize", this.onResize);
  },
  async mounted() {
    if (typeof window !== "undefined")
      window.addEventListener("resize", this.onResize);
    if (!this.channels) this.loadChannels();
    if (/^((?!chrome|android).)*safari/i.test(navigator?.userAgent))
      this.isSafari = true;
  },
  methods: {
    async loadChannels() {
      let code = this.$l2["iso639-3"];
      if (code === "nor") code = "nob"; // Use 'Bokmal' for Norwegian.
      let res = await axios.get(
        `${SERVER}data/live-tv-channels/${code}.csv.txt`
      );
      if (res && res.data) {
        let channels = Papa.parse(res.data, { header: true }).data;
        // Make sure each channel has only one country
        channels = channels.map((c) => {
          if (c.countries) c.countries = c.countries.split("|")[0];
          return c;
        });
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
          a.name.localeCompare(b.name, this.$l2.locales[0])
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
      categories = unique(categories);
      this.categories = categories;
    },
    loadCountries() {
      let countries = [];
      for (let c of this.channels) {
        if (!c.countries) c.countries = [];
        else c.countries = c.countries.split("|");
        countries = countries.concat(c.countries);
      }
      countries = unique(countries);
      this.countries = countries;
    },
    countryNameFromCode(code) {
      if (code === "cn") return "Democratic Republic of the Congo";
      if (code === "cd") return "China";
      if (code === "int") return "International";
      let country = CountryCodeLookup.byInternet(code.toUpperCase());
      if (country) return country.country;
      else return code;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/variables.scss";
.live-video-column {
  position: sticky;
  top: 0;
  z-index: 1;
  .live-tv-wrapper {
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
  }
}
.channel-button {
  background: none;
  border: none;
  &:hover {
    background: rgba(121, 121, 121, 0.2);
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

.channel-buttons-two-cols {
  .channel-button {
    width: calc(50% - 0.25rem);
  }
  .channel-button:nth-child(even) {
    margin-right: 0;
  }
}

.channel-logo-placeholder {
  display: inline-block;
  width: 4rem;
  line-height: 2rem;
  text-align: center;
  font-size: 1.5em;
  opacity: 0.5;
  margin-right: 0.5rem;
}
</style>
