<template>
  <div class="main">
    <div class="container pt-5 mb-5">
      <SocialHead
        :title="`Learn Chinese Idioms (成语 chéngyǔ) | Language Player`"
        :description="`A list of idioms in the HSK curriculum, and their origins.`"
        :image="`/img/placeholder.jpg`"
      />
      <h3 class="mb-5 text-center">Idioms (成语) in the HSK</h3>
      <div class="text-center mb-5">
        <p>
          The HSK curriculum has a total
          <b>112 idioms</b>
          . With the exception of
          <TokenizedText text="讨价还价" /> and
          <TokenizedText text="名胜古迹" />
          being in HSK 5, the rest 110 are all in HSK 6.
        </p>
      </div>
      <table class="table table-responsive">
        <thead>
          <tr>
            <th style="min-width: 9rem" class="text-center">Idiom</th>
            <th>Period</th>
            <th>Source</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="idiom in idioms.filter((row) => row.idiom === 'yes')"
            :key="idiom.simplified"
          >
            <th class="text-center">
              <TokenizedText :text="idiom.simplified" />
            </th>
            <td>
              <TokenizedText :text="idiom.sourcePeriod" />
            </td>
            <td style="min-width: 30rem">
              <TokenizedText :text="idiom.sourceAuthor" />
              <TokenizedText :text="idiom.sourceBook" />
              <TokenizedText :text="idiom.sourceChapter" />：
              <TokenizedText :text="idiom.sourceQuote" />
            </td>
            <td>
              <a :href="`https://www.zdic.net/hans/${idiom.simplified}`">
                <img
                  src="/img/logo-zdic.png"
                  style="height: 1rem"
                  alt="汉典 (Zdic)"
                />
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <hr class="mb-5" />
      <p>
        There are also 9 four-character phrases in the HSK that are obviously
        <b>
          <em>not</em>
          idioms:
        </b>
        <TokenizedRichText text="公共汽车 电子邮件 高速公路 归根到底 二氧化碳 新陈代谢 烟花爆竹 迄今为止 通货膨胀" />
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      idioms: [],
    };
  },
  mounted() {
    Papa.parse(
      "https://server.chinesezerotohero.com/data/zh-4char/4char.csv.txt",
      {
        download: true,
        header: true,
        complete: (results) => {
          this.idioms = results.data.sort(
            (a, b) => a.periodStart - b.periodStart
          );
        },
      }
    );
  },
};
</script>

<style></style>
