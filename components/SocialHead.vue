<template>
  <span v-if="false" />
</template>

<script>
// Test on: https://cards-dev.twitter.com/validator
// Test on: https://developers.facebook.com/tools/debug/
import Helper from "@/lib/helper";
export default {
  props: {
    title: {
      type: String,
      default: "Zero to Hero Languages",
    },
    description: {
      type: String,
      default: "Language education done right.",
    },
    image: {
      type: String,
    },
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
  head() {
    return {
      title: this.title,
      htmlAttrs: {
        lang: this.$l1 ? this.$l1.code : "en",
      },
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: this.$l2
            ? this.$languages.logo(this.$l2.code)
            : "/img/icons/favicon.ico",
        },
      ],
      meta: [
        { hid: "description", name: "description", content: this.description },
        { name: "twitter:card", content: "summary_large_image" },
        {
          hid: "twitter:title",
          name: "twitter:title",
          content: this.title,
        },
        {
          hid: "twitter:description",
          name: "twitter:description",
          content: this.description,
        },
        {
          hid: "twitter:image",
          name: "twitter:image",
          content: this.getImage(),
        },
        {
          hid: "twitter:image:alt",
          name: "twitter:image:alt",
          content: this.title,
        },
        {
          property: "og:site_name",
          content: this.$l2
            ? `${this.$l2.name} Zero to Hero`
            : "Zero to Hero Languages",
        },
        { hid: "og:type", property: "og:type", content: "website" },
        {
          hid: "og:title",
          property: "og:title",
          content: this.title,
        },
        {
          hid: "og:url",
          property: "og:url",
          content: `https://www.zerotohero.ca/${this.$route.fullPath}`,
        },
        {
          hid: "og:description",
          property: "og:description",
          content: this.description,
        },
        {
          hid: "og:image",
          property: "og:image",
          content: this.getImage(),
        },
        { property: "og:image:width", content: "1280" },
        { property: "og:image:height", content: "720" },
        {
          hid: "og:image:secure_url",
          property: "og:image:secure_url",
          content: this.getImage(),
        },
        {
          hid: "og:image:alt",
          property: "og:image:alt",
          content: this.title,
        },
      ],
    };
  },
  methods: {
    getImage() {
      if (this.image) return this.image;
      let image = Helper.background(this.$l2);
      if (image !== "/img/background-branch.jpg") return image;
      else return "/img/zth-share-image.jpg";
    },
  },
};
</script>
