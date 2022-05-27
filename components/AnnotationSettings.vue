<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div v-if="variant === 'toolbar'">
      <span
        v-if="onceAdmin"
        @click="adminMode = !adminMode"
        style="display: inline-block"
        :class="`annotation-setting-toggle ${
          adminMode ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <i class="fa fa-wrench"></i>
      </span>
      <span
        @click="showPinyin = !showPinyin"
        :class="`annotation-setting-toggle ${
          showPinyin ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <ruby v-if="$l2.han" style="position: relative; bottom: -0.1rem">
          拼
          <rt>pīn</rt>
        </ruby>
        <ruby v-else-if="$l2.code === 'ja'">
          假
          <rt>か</rt>
        </ruby>
        <ruby
          v-else-if="
            $l2.scripts && $l2.scripts[0] && $l2.scripts[0].script === 'Arab'
          "
        >
          نص
          <rt>naṣṣ</rt>
        </ruby>
        <span v-else>
          [pʰ]
        </span>
      </span>
      <span
        v-if="$l2.han"
        @click="useTraditional = !useTraditional"
        :class="`annotation-setting-toggle ${
          useTraditional ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span v-if="useTraditional">繁</span>
        <span v-if="!useTraditional">简</span>
      </span>
      <span
        @click="showTranslation = !showTranslation"
        :class="`annotation-setting-toggle ${
          showTranslation ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <i class="fas fa-language"></i>
      </span>
      <span
        v-if="$l2.code === 'ko'"
        @click="showByeonggi = !showByeonggi"
        :class="`annotation-setting-toggle ${
          showByeonggi ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        자
        <small style="font-size: 0.5em">字</small>
      </span>
      <span
        v-if="$l2.code === 'vi'"
        @click="showByeonggi = !showByeonggi"
        :class="`annotation-setting-toggle ${
          showByeonggi ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        Tự
        <small style="font-size: 0.5em">字</small>
      </span>
    </div>
    <div v-if="variant === 'page'">
      <div class="mt-3">
        <b-form-checkbox
          v-if="['ko', 'vi'].includes($l2.code)"
          class="mb-2"
          v-model="showByeonggi"
        >
          <span v-if="$l2.code === 'ko'">
            Show hanja next to hanguel (
            <a
              href="https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B8%80%EC%A0%84%EC%9A%A9%EA%B3%BC_%EA%B5%AD%ED%95%9C%EB%AC%B8%ED%98%BC%EC%9A%A9#%ED%95%9C%EC%9E%90_%EB%B3%91%EA%B8%B0"
              target="_blank"
            >
              병기, 倂記,
              <em>byeonggi</em>
            </a>
            )
          </span>
          <span v-if="$l2.code === 'vi'">
            Show
            <a
              href="https://en.wikipedia.org/wiki/History_of_writing_in_Vietnam#Ch%E1%BB%AF_H%C3%A1n"
              target="_blank"
            >
              Hán tự
            </a>
            (Chữ Hán, Chữ Nho) next to Sino-Vietnamese words
          </span>
        </b-form-checkbox>
        <template v-if="$hasFeature('transliteration')">
          <b-form-checkbox v-model="showPinyin" class="mb-2">
            Show
            <span v-if="['zh', 'lzh'].includes($l2.code)">pinyin</span>
            <span v-else-if="$l2.code === 'ja'">furigana</span>
            <span v-else>romanization</span>
            above words
          </b-form-checkbox>

          <b-form-checkbox
            class="mb-2"
            v-if="
              $hasFeature('dictionary') &&
              [
                'zh',
                'yue',
                'nan',
                'hak',
                'th',
                'lo',
                'ja',
                'km',
                'ryu',
                'bo',
                'my',
                'lzh',
              ].includes(this.$l2.code)
            "
            v-model="showDefinition"
          >
            Show definition above words
          </b-form-checkbox>
        </template>
        <b-form-checkbox class="mb-2" v-model="showTranslation">
          Show translation
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="showQuiz">
          Show pop quiz
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="disableAnnotation">
          Disable popup dictionary
        </b-form-checkbox>
        <b-button-group v-if="$l2.han" class="d-block mb-2">
          <b-button
            :variant="!useTraditional ? 'secondary' : 'outline-secondary'"
            @click="useTraditional = false"
          >
            Use Simplified
          </b-button>
          <b-button
            :variant="useTraditional ? 'secondary' : 'outline-secondary'"
            @click="useTraditional = true"
          >
            Use Traditional
          </b-button>
        </b-button-group>
        <b-button-group class="d-block">
          <b-button
            :variant="!useSerif ? 'secondary' : 'outline-secondary'"
            @click="useSerif = false"
          >
            Use Sans-Serif
          </b-button>
          <b-button
            :variant="useSerif ? 'secondary' : 'outline-secondary'"
            style="font-family: serif"
            @click="useSerif = true"
          >
            Use Serif
          </b-button>
        </b-button-group>
      </div>
      <div class="jumbotron text-center mt-4 p-4">
        <Annotate
          tag="div"
          class="mt-4 mb-4 text-left"
          :showTranslate="true"
          :buttons="true"
          :sticky="true"
        >
          <div>
            <div v-if="$l2.code === 'ko'">
              <p>
                국가원로자문회의의 의장은 직전대통령이 된다. 대법원과 각급법원의
                조직은 법률로 정한다, 법률과 적법한 절차에 의하지 아니하고는
                처벌·보안처분 또는 강제노역을 받지 아니한다. 국회는 의장 1인과
                부의장 2인을 선출한다.
              </p>
              <p>
                이 경우 그 명령에 의하여 개정 또는 폐지되었던 법률은 그 명령이
                승인을 얻지 못한 때부터 당연히 효력을 회복한다. 국회는 국무총리
                또는 국무위원의 해임을 대통령에게 건의할 수 있다. 국교는
                인정되지 아니하며, 이에 필요한 서류의 제출 또는 증인의 출석과
                증언이나 의견의 진술을 요구할 수 있다.
              </p>
              <p>
                법령의 범위안에서 자치에 관한 규정을 제정할 수 있다, 대통령은
                국가의 독립·영토의 보전·국가의 계속성과 헌법을 수호할 책무를
                진다. 대통령이 임시회의 집회를 요구할 때에는 기간과 집회요구의
                이유를 명시하여야 한다, 국가는 청원에 대하여 심사할 의무를 진다.
              </p>
            </div>
            <div v-if="$l2.code === 'zh'">
              <h4>神奇的丝瓜</h4>
              <p>《标准教程 HSK 6》第18课课文</p>
              <p>
                春天，孩子们在楼旁空地上开出一个小小的花园，随即种上了一棵树、几株花和几粒丝瓜种子。土壤不是很肥沃，但有水的滋润，阳光的照耀，没几天，丝瓜就从土里冒了出来，接着我惊讶地发现，它好像每时每刻都在长大。看着丝瓜，我心中难免不解:古人是怎么想的，愣是编出个拔苗助长的故事来？要是我，宁愿用别的比喻。
              </p>
            </div>
            <div v-else-if="$l2.code === 'yue'">
              <h4>隨想</h4>
              <p>
                大家有玩開social
                media、例如FB同Telegram之類嗰啲，最近有冇發現，多咗好多新朋友？
              </p>
              <p>
                某個早上，我起身後，繼續做碌FB之類嘅老人家morning
                ritual，然後我見到篇呢期好常見嘅陰毛論post，詳細講乜我都唔記得（應該同彥霖老母有關），但當我望一望究竟係邊個些牙嗰陣，咦？條茂利我都唔撚識佢嘅！？名又唔識樣又冇得睇，你點樣鼠入我個newsfeed度㗎？！
              </p>
              <p>
                再click入去個profile度睇真啲，好熟口面喎啲嘢，於是再click多兩click，屌！原來係呢條仆街！做乜撚嘢無啦啦走去改名唧？爭人好多錢咩？定係食咗條女𡁻完唱而家俾人尋仇？
              </p>
            </div>
            <div v-else-if="$l2.code === 'ja'">
              <h4>下がる気温「うちで寝たい」「トイレが」 避難所ルポ</h4>
              <p>
                各地に大雨被害をもたらした台風１９号で、１６日朝までの朝日新聞の集計によると１２都県で計７５人が死亡し、１３人が行方不明になっている。東日本の広い範囲で河川が氾濫（はんらん）し、福島や長野、宮城など１３都県で計約４５００人が避難生活を余儀なくされた。この日の朝は被災地の多くで気温が１０度を下回り、各地で今季最低を記録。先行きの見えない暮らしが続くなか、避難するお年寄りらは疲れをにじませている。
              </p>
            </div>
            <div v-else>
              <div
                v-if="
                  $l2.scripts &&
                  $l2.scripts[0] &&
                  $l2.scripts[0].script === 'Hebr'
                "
              >
                חפש שונה דפים ביוני או. על צעד ניהול המשפט אירועים, חשמל טיפול
                חינוך מתן גם. אחר חינוך משופרות מה. צ'ט אל מאמר העברית. אנא
                למנוע מיתולוגיה אל, את רבה שאלות מדריכים ביוטכנולוגיה, מה והוא
                החברה אנא. אל שמו המלצת אנגלית תיקונים, ב צ'ט כימיה העמוד, בה
                זכר דרכה קישורים סטטיסטיקה. ביולי משפטים הספרות זאת בה. מלא מה
                ביולי הספרות מבוקשים, לערוך מחליטה את זאת. אם כדור למאמרים מתן,
                אתה גם יוני טכנולוגיה. יידיש בהשחתה מונחונים כלל גם, סרבול
                הספרות וכמקובל אל שער. ריקוד ויקיפדיה גם זאת. מה אודות חופשית
                מדינות שמו, דת משחקים איטליה לעריכה סדר. אל צעד אודות הסביבה,
                הספרות יוצרים מיוחדים דת ארץ. מלא אל הרוח שדרות גרמנית, ננקטת
                קלאסיים ממונרכיה את ויש. את לתרום רפואה התפתחות היא. אל זאת שמות
                העריכהגירסאות, רבה פיסיקה האטמוספירה אם.
              </div>
              <div
                v-else-if="
                  $l2.scripts &&
                  $l2.scripts[0] &&
                  $l2.scripts[0].direction === 'rtl'
                "
              >
                أم تلك غرّة، ارتكبها, و ليرتفع بمعارضة انه. ان خطّة اتفاق
                سنغافورة الا, بين مايو وقرى في. لان قد قبضتهم ايطاليا،. وسفن
                إحكام الجديدة، ثم حين, لكون الواقعة الإيطالية فعل أن. به، اعلان
                أسابيع الوراء ٣٠, أم حدى يذكر أحدث. هو رئيس الأخذ بالرغم حدى,
                به، أن عرفها أجزاء. بل وفرنسا بلديهما التقليدي مدن, الخطّة
                العالم، يبق أن, من وزارة استراليا، بحث.
              </div>
              <div v-else>
                Лорем ипсум долор сит амет, вим еи цаусае импетус, не стет
                тамяуам про, пер цу ерант тхеопхрастус. Ех вих аутем албуциус
                ментитум, ад дицит елигенди оффициис иус. Еним лабитур оффендит
                сед цу, апериам цонсулату продессет нец еа, нулла зрил виртуте
                цу пер. Еа посидониум детерруиссет вих, вих не партем деленит
                импердиет. Меа ат харум чоро, деленит фабеллас сит ет, нонумы
                алтера иисяуе еам ет. Еам еи нисл виртуте.
              </div>
            </div>
          </div>
        </Annotate>
        <div class="text-left translated-line">
          Translation text is shown. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
          irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  props: {
    variant: {
      default: "page", // or 'toolbar'
    },
  },
  data() {
    return {
      showDefinition: undefined,
      showTranslation: undefined,
      showPinyin: undefined,
      useTraditional: undefined,
      showQuiz: undefined,
      useSerif: undefined,
      showByeonggi: undefined,
      disableAnnotation: undefined,
      adminMode: false,
      onceAdmin: false,
    };
  },
  mounted() {
    this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.loadSettings();
      }
    });
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
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
  },
  methods: {
    loadSettings() {
      this.showDefinition =
        this.$store.state.settings.l2Settings.showDefinition;
      this.showTranslation =
        this.$store.state.settings.l2Settings.showTranslation;
      this.showPinyin = this.$store.state.settings.l2Settings.showPinyin;
      this.useTraditional =
        this.$store.state.settings.l2Settings.useTraditional;
      this.showQuiz = this.$store.state.settings.l2Settings.showQuiz;
      this.useSerif = this.$store.state.settings.l2Settings.useSerif;
      this.showByeonggi = this.$store.state.settings.l2Settings.showByeonggi;
      this.disableAnnotation =
        this.$store.state.settings.l2Settings.disableAnnotation;
      this.adminMode = this.$store.state.settings.adminMode;
      if (this.adminMode) this.onceAdmin = true;
    },
  },
  watch: {
    adminMode() {
      this.$store.dispatch("settings/setAdminMode", this.adminMode);
    },
    showDefinition() {
      this.$store.dispatch("settings/setL2Settings", {
        showDefinition: this.showDefinition,
      });
    },
    showPinyin() {
      this.$store.dispatch("settings/setL2Settings", {
        showPinyin: this.showPinyin,
      });
    },
    useTraditional() {
      this.$store.dispatch("settings/setL2Settings", {
        useTraditional: this.useTraditional,
      });
    },
    showTranslation() {
      this.$store.dispatch("settings/setL2Settings", {
        showTranslation: this.showTranslation,
      });
    },
    showQuiz() {
      this.$store.dispatch("settings/setL2Settings", {
        showQuiz: this.showQuiz,
      });
    },
    useSerif() {
      this.$store.dispatch("settings/setL2Settings", {
        useSerif: this.useSerif,
      });
    },
    showByeonggi() {
      this.$store.dispatch("settings/setL2Settings", {
        showByeonggi: this.showByeonggi,
      });
    },
    disableAnnotation() {
      this.$store.dispatch("settings/setL2Settings", {
        disableAnnotation: this.disableAnnotation,
      });
    },
  },
};
</script>
<style>
.translated-line {
  color: #aaa;
  font-style: italic;
  font-size: 0.8em;
}

.translated-line {
  display: none;
}

.show-translation .translated-line {
  display: inherit;
}

.annotation-setting-toggle {
  margin: 0 0.2rem;
  cursor: pointer;
}

.annotation-setting-toggle-active {
  color: #28a745;
}

.annotation-settings-toolbar {
  display: inline-block;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 0.2rem;
  position: relative;
  bottom: -0.1rem;
}
</style>