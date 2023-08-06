<router>
  {
    path: '/:l1/:l2/grammar'
  }
</router>
<template>
  <div class="main pt-3 pb-5">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div class="focus text-center">
            <!-- <Sale class="mb-4" /> -->
            <h3 class="mb-5">{{ $t('Ultimate {l2} Grammar Cheatsheet', {l2: $t($l2.name)}) }}</h3>
            <div v-if="$l2.code === 'zh'">
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
                , plus a few we added based on the official HSK grammar list
                from
                <a href="http://www.cltguides.com/user/yufaka.action">
                  CLT Guides
                </a>
                .
              </p>
              <p class="mb-5">
                <b>Download</b>
                the list as a
                <a
                  :href="`/data/grammar/${$l2.code}-grammar.csv.txt`"
                  :download="`Language Player ${$l2.name} Grammar Chart.csv`"
                >
                  CSV
                </a>
                ,
                <a href="/files/grammar.numbers" download>Apple Numbers file</a>
                (recommended), or
                <a href="/files/grammar.xlsx" download>Microsoft Excel file</a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid">
      <GrammarChart />
    </div>
  </div>
</template>

<script>

export default {
  computed: {
  },
  data() {
    return {};
  },
};
</script>
