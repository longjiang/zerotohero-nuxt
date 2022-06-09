<router>
  {
    path: '/:l1/:l2/explore',
  }
</router>
<template>
  <div class="main container mx-auto mt-10">
    <div
      class="jw-study-aid-explore"
      v-for="article in randomArticles"
      :key="`article-snippet-${article.url}`"
    >
      <h4 class="text-3xl text-gray-400 mb-5">{{ article.subject }}</h4>
      <ArticleSnippet
        :url="article.url"
        class="shadow-xl rounded-xl mb-10 p-10"
      />
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/Helper";
import Wol from "@/lib/jw/Wol";

export default {
  data() {
    return {
      subjectsNested: undefined,
      randomArticles: [],
      max_subjects: 3,
      maxArticles: 10,
      researchGuideUrl: `https://wol.jw.org/en/wol/library/r1/lp-e/all-publications/research-guide/subjects?snip=yes`,
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
    let { subjectsNested, randomArticles } = await this.processResearchGuide(
      this.researchGuideUrl
    );
    this.subjectsNested = subjectsNested;
    this.randomArticles = randomArticles;
  },
  methods: {
    async processResearchGuide(url) {
      let root = await Helper.proxyParsed(url);
      // Get random subjects
      var $rows = root.querySelectorAll(".row");
      var subject_links = [];
      for (var i = 0; i < this.max_subjects; i++) {
        var random_row =
          $rows[Math.round(Math.random() * ($rows.length - 1) + 1)]; // We don't want the first row which is subject list
        subject_links.push(random_row.querySelector("a"));
      }

      // Process each subject
      this.num_subjects_remaining = subject_links.length;
      let subjectsNested = [];
      let randomArticles = [];
      for (let subject_link of subject_links) {
        var h1_text = subject_link.innerText.trim();

        // Load the page of the subject
        let article = await Wol.getArticle(
          subject_link.getAttribute("href"),
          "#article",
          true,
          false
        );
        let articlesNested = this.process_subject(
          h1_text,
          article.contentParsed
        );
        subjectsNested.push(articlesNested);
        randomArticles = randomArticles.concat(
          this.getRandomArticles(articlesNested)
        );
      }
      randomArticles = Helper.shuffle(
        Helper.uniqueByValue(randomArticles, "url")
      );
      return { subjectsNested, randomArticles };
    },

    flatten(articlesNested) {
      let articles = [];
      for (let child of articlesNested.children) {
        if (child.level === "a") {
          child.subject = articlesNested.title;
          articles.push(child);
        } else {
          articles.concat(this.flatten(child));
        }
      }
      return articles;
    },

    getRandomArticles(articlesNested) {
      let articles = this.flatten(articlesNested);
      // Get 10 random articles
      let randomArticles = Helper.shuffle(articles);

      randomArticles = randomArticles.slice(
        0,
        Math.min(this.maxArticles, randomArticles.length)
      );
      return randomArticles;
    },

    process_subject(h1_text, root) {
      // Get all headings and links
      var $headings_and_links = root.querySelectorAll("h2, h3, a");
      // Create nested data. See comments in nestByHeadings() function to see how it works

      // Append nested data to $articles_nested
      return this.nestByHeadings($headings_and_links, h1_text);
    },

    nestByHeadings(elements, h1_text) {
      // The returned elements are not nested, make them nested by headings
      // <div class="wrapper-level-1">
      //    <h1>
      //    <div class="wrapper-level-2">
      //    <div class="wrapper-level-2">
      //    <div class="wrapper-level-2">
      //       <h2>
      //       <div class="wrapper-level-3">
      //       <div class="wrapper-level-3">
      //       <div class="wrapper-level-3">
      //          <h3>
      //          <a>
      //          <a>
      //          <a>
      //          <a>
      //          <a>
      // Make new h1 wrapper
      let h1 = {
        level: 1,
        title: h1_text,
        children: [],
      };
      let currentH2;
      let currentH3;
      for (let element of elements) {
        // See h2, start new wrapper-level-2 wrapper
        if (element.tagName.toUpperCase() === "H2") {
          let h2 = {
            level: 2,
            title: element.innerText,
            children: [],
          };
          h1.children.push(h2);
          currentH2 = h2;
          currentH3 = false; // unset current wrapper 3
        }

        // See h3, start new wrapper-level-3 wrapper and attach
        if (element.tagName.toUpperCase() === "H3") {
          let h3 = {
            level: 3,
            title: element.innerText,
            children: [],
          };
          currentH2.children.push(h3);
          currentH3 = h3;
        }
        // See a, attach to wrapper-level-3
        if (element.tagName.toUpperCase() === "A") {
          if (currentH3) {
            currentH3.children.push({
              level: "a",
              title: element.innerText.trim(),
              url: element.getAttribute("href"),
            });
          } else if (currentH2) {
            currentH2.children.push({
              level: "a",
              title: element.innerText.trim(),
              url: element.getAttribute("href"),
            });
          } else {
            h1.children.push({
              level: "a",
              title: element.innerText.trim(),
              url: element.getAttribute("href"),
            });
          }
        }
      }
      return h1;
    },
  },
};
</script>

<style>
.jw-study-aid-explore {
  margin-bottom: 2rem;
}

#jw-study-aid-explore-load-more-btn {
  width: 100%;
}

</style>