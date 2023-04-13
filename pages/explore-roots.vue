<router>
  {
    path: '/:l1/:l2/explore/roots/:arg?',
    props: true,
    meta: {
      title: 'Roots | Language Player',
      metaTags: [
        {
          name: 'description',
          content:
            'Learn some common word-building patterns.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-5 pb-4">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div v-if="!arg" class="focus">
            <div class="text-center">
              <h3>Word Builder</h3>
              <p class="mb-5">Explore word patterns. See how words are built.</p>
              <Loader class="mt-5 mb-5" />
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Pattern</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(root, index) in rootsAugmented"
                  :key="`root=${index}`"
                >
                  <td class="root">
                    <router-link
                      :to="`/${$l1.code}/${$l2.code}/explore/roots/${root.pattern}`"
                    >
                      <span
                        class="root-word"
                        v-if="root.word"
                        v-html="
                          highlight(
                            root.pattern,
                            root.word.simplified,
                            root.word.hsk
                          )
                        "
                      ></span>
                    </router-link>
                  </td>
                  <td>
                    <b>{{ root.count }}</b>
                    HSK words match this pattern.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="arg" class="focus">
            <div class="paginate-buttons">
              <button
                class="paginate-button previous focus-hover"
                v-on:click="previousClick"
              >
                <img src="/img/angle-left.svg" alt />
              </button>
              <button
                class="paginate-button next focus-hover"
                v-on:click="nextClick"
              >
                <img src="/img/angle-right.svg" alt />
              </button>
            </div>
            <div :key="rootsKey">
              <div class="big-word text-center">
                <Annotate>
                  <span>{{ arg }}</span>
                </Annotate>
                Words
              </div>
              <Loader class="mt-5 text-center" />
              <div style="max-width: 30rem; margin: 0 auto">
                <EntryCharacters
                  :text="arg.replace(/～/g, '')"
                ></EntryCharacters>
              </div>
            </div>
            <WordListExtended v-if="rootWords" :words="rootWords" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WordListExtended from "@/components/WordListExtended.vue";
import EntryCharacters from "@/components/EntryCharacters.vue";
import Helper from "@/lib/helper";

export default {
  components: {
    EntryCharacters,
    WordListExtended,
  },
  props: {
    arg: undefined,
  },
  computed: {
  },
  methods: {
    highlight(a, b, c) {
      return Helper.highlight(a, b, c);
    },
    currentIndex() {
      return this.roots.findIndex((root) => root.pattern === this.arg);
    },
    previousClick() {
      const i = this.currentIndex();
      if (i > 0) {
        this.$router.push({
          path:
            `/${this.$l1.code}/${this.$l2.code}/explore/roots/` +
            this.roots[i - 1].pattern,
        });
      }
    },
    nextClick() {
      const i = this.currentIndex();
      if (i < this.roots.length - 1) {
        this.$router.push({
          path:
            `/${this.$l1.code}/${this.$l2.code}/explore/roots/` +
            this.roots[i + 1].pattern,
        });
      }
    },
  },
  async mounted() {
    let rootsAugmented = [];
    for (let root of this.roots) {
      let words = await (
        await this.$getDictionary()
      ).lookupSimplified(root.pattern.replace(/～/g, ""));
      root.word = words[0];
      rootsAugmented.push(root);
    }
    this.rootsAugmented = rootsAugmented;
  },
  async fetch() {
    if (this.arg) {
      let words = await (await this.$getDictionary()).lookupByPattern(this.arg);
      let rootWords = words
        .sort((a, b) => a.simplified.length - b.simplified.length)
        .sort((a, b) => a.hsk - b.hsk);
      this.rootWords = rootWords;
    }
  },
  data() {
    return {
      rootsKey: 0,
      rootCharacter: undefined,
      rootWords: [],
      rootsAugmented: [],
      roots: [
        {
          pattern: "～子",
          count: 59,
        },
        {
          pattern: "不～",
          count: 38,
        },
        {
          pattern: "～心",
          count: 28,
        },
        {
          pattern: "～不～",
          count: 27,
        },
        {
          pattern: "一～",
          count: 27,
        },
        {
          pattern: "～气",
          count: 26,
        },
        {
          pattern: "～力",
          count: 25,
        },
        {
          pattern: "发～",
          count: 24,
        },
        {
          pattern: "～理",
          count: 24,
        },
        {
          pattern: "天",
          count: 23,
        },
        {
          pattern: "无～",
          count: 22,
        },
        {
          pattern: "公～",
          count: 22,
        },
        {
          pattern: "～然",
          count: 21,
        },
        {
          pattern: "打～",
          count: 21,
        },
        {
          pattern: "机",
          count: 21,
        },
        {
          pattern: "～动",
          count: 20,
        },
        {
          pattern: "大～",
          count: 20,
        },
        {
          pattern: "人～",
          count: 19,
        },
        {
          pattern: "生～",
          count: 19,
        },
        {
          pattern: "～实",
          count: 19,
        },
        {
          pattern: "～面",
          count: 19,
        },
        {
          pattern: "学",
          count: 19,
        },
        {
          pattern: "本",
          count: 19,
        },
        {
          pattern: "情",
          count: 19,
        },
        {
          pattern: "分～",
          count: 18,
        },
        {
          pattern: "～行",
          count: 18,
        },
        {
          pattern: "～明",
          count: 18,
        },
        {
          pattern: "对～",
          count: 18,
        },
        {
          pattern: "～儿",
          count: 18,
        },
        {
          pattern: "出～",
          count: 18,
        },
        {
          pattern: "～业",
          count: 18,
        },
        {
          pattern: "～定",
          count: 18,
        },
        {
          pattern: "为",
          count: 18,
        },
        {
          pattern: "要",
          count: 18,
        },
        {
          pattern: "节",
          count: 18,
        },
        {
          pattern: "光",
          count: 18,
        },
        {
          pattern: "成～",
          count: 17,
        },
        {
          pattern: "开～",
          count: 17,
        },
        {
          pattern: "自～",
          count: 17,
        },
        {
          pattern: "反～",
          count: 17,
        },
        {
          pattern: "和",
          count: 17,
        },
        {
          pattern: "现",
          count: 17,
        },
        {
          pattern: "口",
          count: 17,
        },
        {
          pattern: "记",
          count: 17,
        },
        {
          pattern: "立",
          count: 17,
        },
        {
          pattern: "制",
          count: 17,
        },
        {
          pattern: "～意",
          count: 16,
        },
        {
          pattern: "地～",
          count: 16,
        },
        {
          pattern: "～道",
          count: 16,
        },
        {
          pattern: "主～",
          count: 16,
        },
        {
          pattern: "起",
          count: 16,
        },
        {
          pattern: "家",
          count: 16,
        },
        {
          pattern: "上",
          count: 16,
        },
        {
          pattern: "后",
          count: 16,
        },
        {
          pattern: "长",
          count: 16,
        },
        {
          pattern: "用",
          count: 16,
        },
        {
          pattern: "信",
          count: 16,
        },
        {
          pattern: "～人",
          count: 15,
        },
        {
          pattern: "～得",
          count: 15,
        },
        {
          pattern: "平～",
          count: 15,
        },
        {
          pattern: "年",
          count: 15,
        },
        {
          pattern: "化",
          count: 15,
        },
        {
          pattern: "交",
          count: 15,
        },
        {
          pattern: "流",
          count: 15,
        },
        {
          pattern: "通",
          count: 15,
        },
        {
          pattern: "收",
          count: 15,
        },
        {
          pattern: "观",
          count: 15,
        },
        {
          pattern: "领",
          count: 15,
        },
        {
          pattern: "～发",
          count: 14,
        },
        {
          pattern: "实～",
          count: 14,
        },
        {
          pattern: "正～",
          count: 14,
        },
        {
          pattern: "～来",
          count: 14,
        },
        {
          pattern: "过～",
          count: 14,
        },
        {
          pattern: "～于",
          count: 14,
        },
        {
          pattern: "小～",
          count: 14,
        },
        {
          pattern: "保～",
          count: 14,
        },
        {
          pattern: "～度",
          count: 14,
        },
        {
          pattern: "好",
          count: 14,
        },
        {
          pattern: "见",
          count: 14,
        },
        {
          pattern: "期",
          count: 14,
        },
        {
          pattern: "想",
          count: 14,
        },
        {
          pattern: "工",
          count: 14,
        },
        {
          pattern: "能",
          count: 14,
        },
        {
          pattern: "水",
          count: 14,
        },
        {
          pattern: "日",
          count: 14,
        },
        {
          pattern: "外",
          count: 14,
        },
        {
          pattern: "务",
          count: 14,
        },
        {
          pattern: "～望",
          count: 14,
        },
        {
          pattern: "调",
          count: 14,
        },
        {
          pattern: "应",
          count: 14,
        },
        {
          pattern: "目",
          count: 14,
        },
        {
          pattern: "而",
          count: 14,
        },
        {
          pattern: "失",
          count: 14,
        },
        {
          pattern: "品",
          count: 14,
        },
        {
          pattern: "～成",
          count: 13,
        },
        {
          pattern: "～体",
          count: 13,
        },
        {
          pattern: "时～",
          count: 13,
        },
        {
          pattern: "作～",
          count: 13,
        },
        {
          pattern: "当～",
          count: 13,
        },
        {
          pattern: "可～",
          count: 13,
        },
        {
          pattern: "文～",
          count: 13,
        },
        {
          pattern: "相～",
          count: 13,
        },
        {
          pattern: "～视",
          count: 13,
        },
        {
          pattern: "关",
          count: 13,
        },
        {
          pattern: "名",
          count: 13,
        },
        {
          pattern: "中",
          count: 13,
        },
        {
          pattern: "有",
          count: 13,
        },
        {
          pattern: "前",
          count: 13,
        },
        {
          pattern: "爱",
          count: 13,
        },
        {
          pattern: "车",
          count: 13,
        },
        {
          pattern: "服",
          count: 13,
        },
        {
          pattern: "新",
          count: 13,
        },
        {
          pattern: "间",
          count: 13,
        },
        {
          pattern: "乐",
          count: 13,
        },
        {
          pattern: "问",
          count: 13,
        },
        {
          pattern: "进",
          count: 13,
        },
        {
          pattern: "着",
          count: 13,
        },
        {
          pattern: "复",
          count: 13,
        },
        {
          pattern: "难",
          count: 13,
        },
        {
          pattern: "照",
          count: 13,
        },
        {
          pattern: "安",
          count: 13,
        },
        {
          pattern: "性",
          count: 13,
        },
        {
          pattern: "格",
          count: 13,
        },
        {
          pattern: "导",
          count: 13,
        },
        {
          pattern: "神",
          count: 13,
        },
        {
          pattern: "～生",
          count: 12,
        },
        {
          pattern: "动～",
          count: 12,
        },
        {
          pattern: "～时",
          count: 12,
        },
        {
          pattern: "～手",
          count: 12,
        },
        {
          pattern: "～重",
          count: 12,
        },
        {
          pattern: "～合",
          count: 12,
        },
        {
          pattern: "～解",
          count: 12,
        },
        {
          pattern: "～会",
          count: 12,
        },
        {
          pattern: "报～",
          count: 12,
        },
        {
          pattern: "以～",
          count: 12,
        },
        {
          pattern: "～利",
          count: 12,
        },
        {
          pattern: "精～",
          count: 12,
        },
        {
          pattern: "表～",
          count: 12,
        },
        {
          pattern: "空～",
          count: 12,
        },
        {
          pattern: "～法",
          count: 12,
        },
        {
          pattern: "～话",
          count: 12,
        },
        {
          pattern: "～常",
          count: 12,
        },
        {
          pattern: "指～",
          count: 12,
        },
        {
          pattern: "提～",
          count: 12,
        },
        {
          pattern: "是",
          count: 12,
        },
        {
          pattern: "美",
          count: 12,
        },
        {
          pattern: "国",
          count: 12,
        },
        {
          pattern: "同",
          count: 12,
        },
        {
          pattern: "电",
          count: 12,
        },
        {
          pattern: "先",
          count: 12,
        },
        {
          pattern: "备",
          count: 12,
        },
        {
          pattern: "到",
          count: 12,
        },
        {
          pattern: "告",
          count: 12,
        },
        {
          pattern: "包",
          count: 12,
        },
        {
          pattern: "放",
          count: 12,
        },
        {
          pattern: "接",
          count: 12,
        },
        {
          pattern: "位",
          count: 12,
        },
        {
          pattern: "受",
          count: 12,
        },
        {
          pattern: "断",
          count: 12,
        },
        {
          pattern: "确",
          count: 12,
        },
        {
          pattern: "示",
          count: 12,
        },
        {
          pattern: "传",
          count: 12,
        },
        {
          pattern: "密",
          count: 12,
        },
        {
          pattern: "布",
          count: 12,
        },
        {
          pattern: "气～",
          count: 11,
        },
        {
          pattern: "体～",
          count: 11,
        },
        {
          pattern: "事～",
          count: 11,
        },
        {
          pattern: "～事",
          count: 11,
        },
        {
          pattern: "方～",
          count: 11,
        },
        {
          pattern: "手～",
          count: 11,
        },
        {
          pattern: "合～",
          count: 11,
        },
        {
          pattern: "～物",
          count: 11,
        },
        {
          pattern: "风～",
          count: 11,
        },
        {
          pattern: "经～",
          count: 11,
        },
        {
          pattern: "～别",
          count: 11,
        },
        {
          pattern: "结～",
          count: 11,
        },
        {
          pattern: "干～",
          count: 11,
        },
        {
          pattern: "～代",
          count: 11,
        },
        {
          pattern: "～点",
          count: 11,
        },
        {
          pattern: "感～",
          count: 11,
        },
        {
          pattern: "高～",
          count: 11,
        },
        {
          pattern: "～论",
          count: 11,
        },
        {
          pattern: "～件",
          count: 11,
        },
        {
          pattern: "周～",
          count: 11,
        },
        {
          pattern: "～头",
          count: 11,
        },
        {
          pattern: "～质",
          count: 11,
        },
        {
          pattern: "商",
          count: 11,
        },
        {
          pattern: "果",
          count: 11,
        },
        {
          pattern: "足",
          count: 11,
        },
        {
          pattern: "色",
          count: 11,
        },
        {
          pattern: "思",
          count: 11,
        },
        {
          pattern: "所",
          count: 11,
        },
        {
          pattern: "场",
          count: 11,
        },
        {
          pattern: "往",
          count: 11,
        },
        {
          pattern: "急",
          count: 11,
        },
        {
          pattern: "容",
          count: 11,
        },
        {
          pattern: "清",
          count: 11,
        },
        {
          pattern: "求",
          count: 11,
        },
        {
          pattern: "除",
          count: 11,
        },
        {
          pattern: "如",
          count: 11,
        },
        {
          pattern: "向",
          count: 11,
        },
        {
          pattern: "象",
          count: 11,
        },
        {
          pattern: "原",
          count: 11,
        },
        {
          pattern: "证",
          count: 11,
        },
        {
          pattern: "消",
          count: 11,
        },
        {
          pattern: "资",
          count: 11,
        },
        {
          pattern: "任",
          count: 11,
        },
        {
          pattern: "～量",
          count: 11,
        },
        {
          pattern: "标",
          count: 11,
        },
        {
          pattern: "支",
          count: 11,
        },
        {
          pattern: "命",
          count: 11,
        },
        {
          pattern: "预",
          count: 11,
        },
        {
          pattern: "争",
          count: 11,
        },
        {
          pattern: "民",
          count: 11,
        },
        {
          pattern: "待",
          count: 11,
        },
        {
          pattern: "固",
          count: 11,
        },
        {
          pattern: "致",
          count: 11,
        },
        {
          pattern: "字",
          count: 10,
        },
        {
          pattern: "了",
          count: 10,
        },
        {
          pattern: "说",
          count: 10,
        },
        {
          pattern: "在",
          count: 10,
        },
        {
          pattern: "热",
          count: 10,
        },
        {
          pattern: "张",
          count: 10,
        },
        {
          pattern: "认",
          count: 10,
        },
        {
          pattern: "花",
          count: 10,
        },
        {
          pattern: "步",
          count: 10,
        },
        {
          pattern: "身",
          count: 10,
        },
        {
          pattern: "真",
          count: 10,
        },
        {
          pattern: "教",
          count: 10,
        },
        {
          pattern: "比",
          count: 10,
        },
        {
          pattern: "便",
          count: 10,
        },
        {
          pattern: "算",
          count: 10,
        },
        {
          pattern: "其",
          count: 10,
        },
        {
          pattern: "总",
          count: 10,
        },
        {
          pattern: "特",
          count: 10,
        },
        {
          pattern: "差",
          count: 10,
        },
        {
          pattern: "数",
          count: 10,
        },
        {
          pattern: "护",
          count: 10,
        },
        {
          pattern: "留",
          count: 10,
        },
        {
          pattern: "活",
          count: 10,
        },
        {
          pattern: "及",
          count: 10,
        },
        {
          pattern: "式",
          count: 10,
        },
        {
          pattern: "验",
          count: 10,
        },
        {
          pattern: "严",
          count: 10,
        },
        {
          pattern: "态",
          count: 10,
        },
        {
          pattern: "程",
          count: 10,
        },
        {
          pattern: "规",
          count: 10,
        },
        {
          pattern: "言",
          count: 10,
        },
        {
          pattern: "演",
          count: 10,
        },
        {
          pattern: "推",
          count: 10,
        },
        {
          pattern: "局",
          count: 10,
        },
        {
          pattern: "转",
          count: 10,
        },
        {
          pattern: "装",
          count: 10,
        },
        {
          pattern: "充",
          count: 10,
        },
        {
          pattern: "产",
          count: 10,
        },
        {
          pattern: "势",
          count: 10,
        },
        {
          pattern: "念",
          count: 10,
        },
      ],
    };
  },
};
</script>

<style lang="scss">
.paginate-buttons {
  position: relative;
  .paginate-button {
    background: none;
    position: absolute;
    border: 0;
    top: 0;
    &.previous {
      left: 0;
    }
    &.next {
      right: 0;
    }
    img {
      height: 5rem;
      opacity: 0.5;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.root a {
  text-decoration: none;
  color: inherit;
}

.root-word {
  font-size: 1.4rem;
}
</style>