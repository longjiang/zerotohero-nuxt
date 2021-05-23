<router>
  {
    path: '/:l1/:l2/compare/:method/:args',
    meta: {
      title: 'Compare | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Compare two words and see how they are used differently.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main" v-cloak>
    <div class="container mt-4 mb-4 focus">
      <div class="row">
        <div class="col-12">
          <SearchCompare :searchEntry="a" :compareEntry="b" :compare="true" />
        </div>
      </div>
      <div class="row mt-4 mb-3">
        <div class="col-6">
          <div class="text-center">
            <Loader v-if="!a" class="mt-5" />
          </div>
          <EntryHeader
            v-if="a"
            :entry="a"
            class="text-center"
            :key="`${a.id}-header`"
            @prevWord="prevWord()"
            @nextWord="nextWord()"
          ></EntryHeader>
        </div>
        <div class="col-6">
          <div class="text-center">
            <Loader v-if="!b" class="mt-5" />
          </div>
          <EntryHeader
            v-if="b"
            :entry="b"
            class="text-center"
            :key="`${b.id}-header`"
          ></EntryHeader>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-12">
          <CompareDefs
            v-if="a && b"
            :a="a"
            :b="b"
            :key="`${a.id}-${b.id}-defs`"
          ></CompareDefs>
        </div>
      </div>
    </div>
    <div
      class="jumbotron-fluid bg-light mt-5 focus"
      v-if="a && b && a.example && b.example"
    >
      <div class="container">
        <div class="row">
          <div class="col-sm-6 mt-5 mb-5">
            <EntryExample
              :key="`${a.id}-example`"
              :entry="a"
              id="compare-example-a"
            ></EntryExample>
          </div>
          <div class="col-sm-6 mt-5 mb-5">
            <EntryExample
              :key="`${b.id}-example`"
              :entry="b"
              id="compare-example-b"
            ></EntryExample>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="row mt-4">
        <div class="col-sm-6">
          <WebImages
            v-if="a"
            :text="a.bare"
            limit="10"
            :key="`${a.id}-images`"
          ></WebImages>
        </div>
        <div class="col-sm-6">
          <WebImages
            v-if="b"
            :text="b.bare"
            limit="10"
            :key="`${b.id}-images`"
          ></WebImages>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <CompareCollocations
            class="mt-5 focus"
            v-if="a && b"
            :term="a.bare"
            :compareTerm="b.bare"
            :level="a.level"
            :compareLevel="b.level"
          ></CompareCollocations>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-md-12 mt-5">
          <div
            class="widget"
            v-if="a && b"
            :key="`${a.id}-subs`"
            id="compare-search-subs"
          >
            <div class="widget-title">
              “{{ a.bare }}” and “{{ b.bare }}” in TV Shows
            </div>
            <div class="widget-body">
              <CompareSearchSubs
                :key="`compare-search-subs-${a.id}-${b.id}`"
                :levelA="a.newHSK && a.newHSK === '7-9' ? '7-9' : a.hsk"
                :termsA="
                  ['zh', 'yue'].includes($l2.code)
                    ? a.simplified === a.traditional
                      ? [a.simplified]
                      : [a.simplified, a.traditional]
                    : [a.bare]
                "
                :levelB="b.newHSK && b.newHSK === '7-9' ? '7-9' : b.hsk"
                :termsB="
                  ['zh', 'yue'].includes($l2.code)
                    ? b.simplified === b.traditional
                      ? [b.simplified]
                      : [b.simplified, b.traditional]
                    : [b.bare]
                "
                class="mt-4 mb-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div class="col-sm-12 mt-5" v-if="a">
          <EntryRelated :key="`${a.id}-related`" :entry="a"></EntryRelated>
        </div>
        <div class="col-sm-12 mt-5" v-if="b">
          <EntryRelated :key="`${a.id}-related`" :entry="b"></EntryRelated>
        </div>
      </div>
    </div>

    <!-- <EntryCharacters :entry="entry"></EntryCharacters> -->
    <div class="container mt-5 mb-5 focus">
      <div class="row">
        <div class="col-sm-6">
          <Concordance
            v-if="a"
            :text="a.bare"
            :level="a.hsk"
            :key="`${a.id}-concordance`"
          ></Concordance>
        </div>
        <div class="col-sm-6">
          <Concordance
            v-if="b"
            :text="b.bare"
            :level="b.hsk"
            :key="`${b.id}-concordance`"
          ></Concordance>
        </div>
      </div>
    </div>

    <!--
      
    <div class="container focus mt-5">
      <div class="row">
        <div class="col-sm-6">
          <Grammar v-if="a" :text="a.bare" :key="`${a.id}-grammar`"></Grammar>
        </div>
        <div class="col-sm-6">
          <Grammar v-if="b" text="b.bare" :key="`${b.id}-grammar`"></Grammar>
        </div>
      </div>
    </div>

    <div class="container focus">
      <div class="row">
        <div class="col-sm-6">
          <Mistakes v-if="a" :text="a.bare" :key="aKey"></Mistakes>
        </div>
        <div class="col-sm-6">
          <Mistakes v-if="b" :text="b.bare" :key="bKey"></Mistakes>
        </div>
      </div>
      -->
    <!--
      <div class="row" v-if="['ja', 'ko'].includes($l2.code)">
        <div class="col-sm-6">
          <Chinese
            v-if="a && a.cjk && a.cjk.canonical && a.cjk.canonical !== 'NULL'"
            :text="a.cjk.canonical"
            :key="`${a.id}-chinese`"
          />
        </div>
        <div class="col-sm-6">
          <Chinese
            v-if="b && b.cjk && b.cjk.canonical && b.cjk.canonical !== 'NULL'"
            :text="b.cjk.canonical"
            :key="`${b.id}-chinese`"
          />
        </div>
      </div>
      <div class="row" v-if="['zh', 'ja'].includes($l2.code)">
        <div class="col-sm-6">
          <Korean
            v-if="a && a.cjk && a.cjk.canonical && a.cjk.canonical !== 'NULL'"
            class="mb-5"
            :text="a.cjk.canonical"
            :key="`${a.id}-korean`"
          />
        </div>
        <div class="col-sm-6">
          <Korean
            v-if="b && b.cjk && b.cjk.canonical && b.cjk.canonical !== 'NULL'"
            class="mb-5"
            :text="b.cjk.canonical"
            :key="`${b.id}-korean`"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-sm-6" v-if="['zh', 'ko'].includes($l2.code)">
          <Japanese
            v-if="a && a.cjk && a.cjk.canonical && a.cjk.canonical !== 'NULL'"
            class="mb-5"
            :text="a.cjk.canonical"
            :key="`${a.id}-japanese`"
          />
        </div>
        <div class="col-sm-6">
          <Japanese
            v-if="b && b.cjk && b.cjk.canonical && b.cjk.canonical !== 'NULL'"
            class="mb-5"
            :text="b.cjk.canonical"
            :key="`${b.id}-japanese`"
          />
        </div>
      </div>
    </div>
    -->

    <EntryCourseAd
      v-if="$l2 === 'zh' && a && b"
      :entry="b.hsk > a.hsk ? b : a"
      :key="`${a.id}-${b.id}-ad`"
    ></EntryCourseAd>
  </div>
</template>

<script>
import Concordance from '@/components/Concordance.vue'
import EntryCourseAd from '@/components/EntryCourseAd.vue'
import EntryExample from '@/components/EntryExample.vue'
import Grammar from '@/components/Grammar.vue'
import EntryHeader from '@/components/EntryHeader.vue'
import Mistakes from '@/components/Mistakes.vue'
import WebImages from '@/components/WebImages.vue'
import CompareCollocations from '@/components/CompareCollocations.vue'
import CompareDefs from '@/components/CompareDefs.vue'
import SearchCompare from '@/components/SearchCompare.vue'
import Korean from '@/components/Korean'
import Japanese from '@/components/Japanese'
import Chinese from '@/components/Chinese'
import EntryRelated from '@/components/EntryRelated'
import CompareSearchSubs from '@/components/CompareSearchSubs'

export default {
  components: {
    SearchCompare,
    Concordance,
    EntryCourseAd,
    EntryExample,
    Grammar,
    EntryHeader,
    Mistakes,
    CompareCollocations,
    WebImages,
    Korean,
    Japanese,
    Chinese,
    CompareDefs,
    EntryRelated,
    CompareSearchSubs,
  },
  data() {
    return {
      a: undefined,
      b: undefined,
      aKey: 0,
      bKey: 100,
    }
  },
  methods: {
    async route() {
      let method = this.$route.params.method
      let args = this.$route.params.args.split(',')
      let aId = args[0]
      let bId = args[1]
      if (args.length === 6) {
        // When we use hsk-cedict for chinese
        aId = [args[0], args[1], args[2]].join(',')
        bId = [args[3], args[4], args[5]].join(',')
      }
      if (method && args) {
        if (method === 'hsk') {
          this.a = await (await this.$getDictionary()).getByHSKId(aId)
          this.b = await (await this.$getDictionary()).getByHSKId(bId)
        } else if (method === 'bare') {
          let resultsA = await (await this.$getDictionary()).lookupbare(aId)
          this.a = resultsA[0]
          let resultsB = await (await this.$getDictionary()).lookupbare(bId)
          this.b = resultsB[0]
        } else if (method === 'simplified') {
          let resultsA = await (await this.$getDictionary()).lookupSimplified(
            args[0]
          )
          this.a = resultsA[0]
          let resultsB = await (await this.$getDictionary()).lookupSimplified(
            args[1]
          )
          this.b = resultsB[0]
        } else if (method === 'traditional') {
          let resultsA = await (await this.$getDictionary()).lookupTraditional(
            args[0]
          )
          this.a = resultsA[0]
          let resultsB = await (await this.$getDictionary()).lookupTraditional(
            args[1]
          )
          this.b = resultsB[0]
        } else {
          this.a = await (await this.$getDictionary()).get(aId)
          this.b = await (await this.$getDictionary()).get(bId)
        }
      }
    },
    unbindKeys() {
      window.onkeydown = null
    },
    bindKeys() {
      window.onkeydown = (e) => {
        if (
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName.toUpperCase()) &&
          !e.metaKey
        ) {
          if (e.keyCode == 36) {
            // home
            document
              .getElementById('main')
              .scrollIntoView({ behavior: 'smooth' })
            // this.$refs.searchCompare.focusOnSearch()
            e.preventDefault()
            return false
          }
          if (e.keyCode == 35) {
            // end
            document
              .getElementById('compare-search-subs')
              .scrollIntoView({ behavior: 'smooth' })
            e.preventDefault()
            return false
          }
        }
      }
    },
  },
  watch: {
    a() {
      if (this.b)
        document.title = `${this.a.bare} vs ${this.b.bare} | Zero to Hero`
      this.aKey++
    },
    b() {
      if (this.a)
        document.title = `${this.a.bare} vs ${this.b.bare} | Zero to Hero`
      this.bKey++
    },
    $route() {
      if (this.$route.name === 'compare') {
        this.route()
      }
    },
  },
  mounted() {
    if (this.$route.name === 'compare') {
      this.route()
    }
  },
  activated() {
    this.bindKeys()
  },
  deactivated() {
    this.unbindKeys()
  },
}
</script>
