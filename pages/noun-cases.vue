<router>
  {
    path: '/:l1/:l2/cases/nouns/:args?',
    props: true,
    meta: {
      title: 'Learn Noun Cases | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Learn how to decline nouns.'
        }
      ]
    }
  }
</router>
<template>
  <div class="bookmarklet-view">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-12">
          <h1 class="mb-5">Russian Noun Cases</h1>
        </div>
      </div>
      <div class="row">
        <div class="col-md-3">
          <CaseNav :types="types" />
        </div>
        <div class="col-md-9">
          <Case v-if="type" :type="type" :data="data" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CaseNav from "@/components/CaseNav";
import Case from "@/components/Case";

export default {
  components: {
    Case,
    CaseNav,
  },
  props: {
    args: {
      type: String,
    },
  },
  created() {
    loadAllCsvsThen((files) => {
      const nounFile = files.find((file) => file.pos === "noun");
      this.types = nounFile.dataColumns;
      this.data = formatExampleSentenceHtml(this.types, nounFile.data);
      this.route();
    });
  },
  data() {
    return {
      types: [],
      type: undefined,
    };
  },
  methods: {
    route() {
      if (this.args) {
        this.type = this.args.replace("_", " ");
      } else {
        this.$router.push({
          path: `/${this.$l1.code}/${
            this.$l2.code
          }/cases/nouns/${this.types[0].replace(" ", "_")}`,
        });
      }
    },
  },
  watch: {
    $route() {
      if (this.$route.name === "noun-cases") {
        this.route();
      }
    },
  },
};
</script>
