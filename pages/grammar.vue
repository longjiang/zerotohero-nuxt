<router>
  {
    path: '/:l1/:l2/grammar'
  }
</router>
<template>
  <div class="main pt-5 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="focus text-center">
            <!-- <Sale class="mb-4" /> -->
            <h3 class="mb-3">Ultimate Chinese Grammar Cheatsheet</h3>
            <p>
              Here is a list of all grammar notes from HSK 1 to 6 included in
              the
              <a
                href="https://www.blcup.com/EnSeriesBook/index/8"
                target="_blank"
              >
                HSK Standard Course textbooks
              </a>
              , as covered by
              <a
                href="https://chinesezerotohero.teachable.com/"
                target="_blank"
              >
                our video courses
              </a>
              , plus a few we added based on the official HSK grammar list from
              <a href="http://www.cltguides.com/user/yufaka.action">
                CLT Guides
              </a>
              .
            </p>
            <p class="mb-5">
              <b>Download</b>
              the list as a
              <a
                href="https://server.chinesezerotohero.com/data/zh-grammar/zh-grammar.csv.txt"
                download="Chinese Zero to Hero Grammar Chart.csv"
              >
                CSV
              </a>
              ,
              <a href="/files/grammar.numbers">Apple Numbers file</a>
              (recommended), or
              <a href="/files/grammar.xlsx">Microsoft Excel file</a>
              🤦‍♂️.
            </p>
          </div>
          <FeedbackPrompt class="mb-5" :skin="$route.meta ? $route.meta.skin : 'light'"/>
        </div>
          
      </div>
    </div>

    <div class="container-fluid">
      <GrammarChart />
    </div>
  </div>
</template>

<script>
import GrammarChart from "@/components/GrammarChart.vue";

export default {
  components: {
    GrammarChart,
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
  data() {
    return {};
  },
};
</script>
