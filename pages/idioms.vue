<router>
  {
    path: '/:l1/:l2/idioms/:method?/:args?',
    props: true,
    meta: {
      title: 'Idioms | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Learn idioms (成语 chéngyǔ).'
        }
      ]
    }
  }
</router>
<template>
  <div class="container main mt-5 mb-5">
    <h1 class="mb-5 text-center">
      Idioms (成语) in the HSK
    </h1>
    <div class="text-center mb-5">
      <p>
        The HSK curriculum has a total <b>112 idioms</b>. With the exception of
        <Annotate><span>讨价还价 and 名胜古迹</span></Annotate> being in HSK 5, the rest 110
        are all in HSK 6.
      </p>
    </div>
    <table class="table table-responsive" style="color: #666">
      <thead>
        <tr>
          <th style="min-width: 9rem" class="text-center">Idiom</th>
          <th>Period</th>
          <th>Source</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="idiom in idioms.filter(row => row.idiom === 'yes')">
          <th class="text-center">
            <Annotate><span>{{ idiom.simplified }}</span></Annotate>
          </th>
          <td>
            <Annotate><span>{{ idiom.sourcePeriod }}</span></Annotate>
          </td>
          <td style="min-width: 30rem">
            <Annotate
              ><span>{{ idiom.sourceAuthor }} {{ idiom.sourceBook }}
              {{ idiom.sourceChapter }}：{{ idiom.sourceQuote }}</span></Annotate
            >
          </td>
          <td>
            <a :href="`https://www.zdic.net/hans/${idiom.simplified}`"
              ><img
                src="/img/logo-zdic.png"
                style="height: 1rem"
                alt="汉典 (Zdic)"
            /></a>
          </td>
        </tr>
      </tbody>
    </table>
    <hr class="mb-5" />
    <p>
      There are also 9 four-character phrases in the HSK that are obviously
      <b><em>not</em> idioms:</b>
      <Annotate
        ><span>公共汽车 电子邮件 高速公路 归根到底 二氧化碳 新陈代谢 烟花爆竹 迄今为止
        通货膨胀</span></Annotate
      >
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      idioms: []
    }
  },
  mounted() {
    Papa.parse('https://server.chinesezerotohero.com/data/zh-4char/4char.csv.txt', {
      download: true,
      header: true,
      complete: results => {
        this.idioms = results.data.sort((a, b) => a.periodStart - b.periodStart)
      }
    })
  }
}
</script>

<style></style>
