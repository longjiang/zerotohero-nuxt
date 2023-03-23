<template>
  <div :class="`annotation-settings annotation-settings-${variant}`">
    <div v-if="variant === 'toolbar'">
      <button
        :class="{
          'btn btn-unstyled d-block p-0 annotation-setting-toggle': true,
          'annotation-setting-toggle-active text-success': quizMode,
        }"
        @click="quizMode = !quizMode"
        title="Toggle Quiz Mode"
      >
        <span class="annotation-setting-icon">
          <i class="far fa-rocket-launch"></i>
        </span>
        <span v-if="quizMode">{{ $t("Quiz Mode On") }}</span>
        <span v-if="!quizMode">{{ $t("Quiz Mode Off") }}</span>
      </button>
      <button
        @click="autoPronounce = !autoPronounce"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          autoPronounce ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fa fa-volume-up" v-if="autoPronounce"></i>
          <i class="fas fa-volume-mute" v-else></i>
        </span>
        <span v-if="autoPronounce">{{ $t("Auto pronounce words") }}</span>
        <span v-else>{{ $t("Do not auto pronounce words") }}</span>
      </button>
      <button
        @click="showPinyin = !showPinyin"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showPinyin ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
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
          <span v-else>[pʰ]</span>
        </span>
        {{ $t(showPinyin ? "Phonetics on" : "Phonetics off") }}
      </button>
      <button
        v-if="$l2.han"
        @click="useTraditional = !useTraditional"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          useTraditional ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <span v-if="useTraditional">繁</span>
          <span v-if="!useTraditional">简</span>
        </span>
        {{
          $t(
            useTraditional ? "Traditional characters" : "Simplified characters"
          )
        }}
      </button>
      <button
        @click="showTranslation = !showTranslation"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showTranslation ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fas fa-language"></i>
        </span>
        {{ $t(showTranslation ? "Translation on" : "Translation off") }}
      </button>
      <button
        @click="showQuickGloss = !showQuickGloss"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showQuickGloss ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fas fa-text-size"></i>
        </span>
        {{ $t(showQuickGloss ? "Quick Gloss on" : "Quick Gloss off") }}
      </button>
      <button
        v-if="$l2.code === 'ko'"
        @click="showByeonggi = !showByeonggi"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showByeonggi ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          자
          <small style="font-size: 0.5em">字</small>
        </span>
        {{ $t(showByeonggi ? "Hanja On" : "Hanja Off") }}
      </button>
      <button
        v-if="$l2.code === 'vi'"
        @click="showByeonggi = !showByeonggi"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          showByeonggi ? 'text-success' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          Tự
          <small style="font-size: 0.5em">字</small>
        </span>
        {{ $t(showByeonggi ? "Han Tự On" : "Han Tự Off") }}
      </button>

      <button
        class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = Math.max(zoomLevel - 1, 0)"
      >
        <span class="annotation-setting-icon">ᴛ</span>
        {{ $t("Smaller text") }}
      </button>
      <button
        class="btn btn-unstyled d-block p-0 annotation-setting-toggle"
        @click="zoomLevel = Math.min(zoomLevel + 1, 4)"
      >
        <span class="annotation-setting-icon">T</span>
        {{ $t("Bigger text") }}
      </button>
      <button
        v-if="userIsAdmin"
        @click="adminMode = !adminMode"
        :class="`btn btn-unstyled d-block p-0 annotation-setting-toggle ${
          adminMode ? 'annotation-setting-toggle-active' : ''
        }`"
      >
        <span class="annotation-setting-icon">
          <i class="fa fa-wrench"></i>
        </span>
        <span>{{ $t("Admin Mode") }}</span>
      </button>
      <hr />
      <div :class="`annotation-setting-toggle`">
        <router-link :to="{ name: 'settings' }" class="text-success">
          <i class="fa-solid fa-gears annotation-setting-icon"></i>
          {{ $t("More Settings") }}
          <i class="fa-solid fa-chevron-right"></i>
        </router-link>
      </div>
    </div>
    <div v-if="variant === 'page'">
      <div class="mt-3">
        <b-form-checkbox
          v-if="['ko', 'vi'].includes($l2.code)"
          class="mb-2"
          v-model="showByeonggi"
        >
          <span v-if="$l2.code === 'ko'">
            {{ $t("Show hanja next to hanguel (byeonggi)") }} (
            <a
              href="https://ko.wikipedia.org/wiki/%ED%95%9C%EA%B8%80%EC%A0%84%EC%9A%A9%EA%B3%BC_%EA%B5%AD%ED%95%9C%EB%AC%B8%ED%98%BC%EC%9A%A9#%ED%95%9C%EC%9E%90_%EB%B3%91%EA%B8%B0"
              target="_blank"
            >
              {{ $t("What is byeonggi (병기, 倂記)?") }}
            </a>
          </span>
          <span v-if="$l2.code === 'vi'">
            Show Hán tự next to Sino-Vietnamese words
            <a
              href="https://en.wikipedia.org/wiki/History_of_writing_in_Vietnam#Ch%E1%BB%AF_H%C3%A1n"
              target="_blank"
            ></a>
            {{ $t("What is Hán tự?") }}
          </span>
        </b-form-checkbox>
        <template v-if="$hasFeature('transliteration')">
          <b-form-checkbox v-model="showPinyin" class="mb-2">
            <span v-if="['zh', 'lzh'].includes($l2.code)">
              {{ $t("Display pinyin above words") }}
            </span>
            <span v-else-if="$l2.code === 'ja'">
              {{ $t("Display furigana above words") }}
            </span>
            <span v-else>{{ $t("Display romanization above words") }}</span>
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
            {{ $t("Show definition above words") }}
          </b-form-checkbox>
        </template>
        <b-form-checkbox class="mb-2" v-model="showTranslation">
          {{ $t("Show translation") }}
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="showQuickGloss">
          {{ $t("Show Quick Gloss") }}
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="showQuiz">
          {{ $t("Show pop quiz") }}
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="autoPronounce">
          {{ $t("Pronounce word when opening popup") }}
        </b-form-checkbox>
        <b-form-checkbox class="mb-2" v-model="disableAnnotation">
          {{ $t("Disable popup dictionary") }}
        </b-form-checkbox>
        <b-button-group v-if="$l2.han" class="d-block mb-2">
          <b-button
            :variant="!useTraditional ? 'secondary' : 'outline-secondary'"
            @click="useTraditional = false"
          >
            {{ $t("Use Simplified") }}
          </b-button>
          <b-button
            :variant="useTraditional ? 'secondary' : 'outline-secondary'"
            @click="useTraditional = true"
          >
            {{ $t("Use Traditional") }}
          </b-button>
        </b-button-group>
        <b-button-group class="d-block">
          <b-button
            :variant="!useSerif ? 'secondary' : 'outline-secondary'"
            @click="useSerif = false"
          >
            {{ $t("Use Sans-Serif") }}
          </b-button>
          <b-button
            :variant="useSerif ? 'secondary' : 'outline-secondary'"
            style="font-family: serif"
            @click="useSerif = true"
          >
            {{ $t("Use Serif") }}
          </b-button>
        </b-button-group>
      </div>
      <div class="jumbotron mt-4 p-4">
        <Annotate
          tag="div"
          class="mt-4 mb-4 text-left"
          :showTranslate="true"
          :buttons="true"
          :sticky="true"
        >
          <div>
            <div v-if="['en', 'ko', 'zh', 'yue', 'ja'].includes($l2.code)">
              <div v-if="$l2.code === 'en'">
                <p>
                  We hold these truths to be self-evident, that all men are
                  created equal, that they are endowed by their creator with
                  certain unalienable rights, that among these are life, liberty
                  and the pursuit of happiness. That to secure these rights,
                  Governments are instituted among men, deriving their just
                  powers from the consent of the governed. That whenever any
                  form of government becomes destructive of these ends, it is
                  the right of the people to alter or to abolish it, and to
                  institute new Government, laying its foundation on such
                  principles and organizing its powers in such form, as to them
                  shall seem most likely to effect their safety and happiness.
                </p>
              </div>
              <div v-if="$l2.code === 'ko'">
                <p>
                  국가원로자문회의의 의장은 직전대통령이 된다. 대법원과
                  각급법원의 조직은 법률로 정한다, 법률과 적법한 절차에 의하지
                  아니하고는 처벌·보안처분 또는 강제노역을 받지 아니한다. 국회는
                  의장 1인과 부의장 2인을 선출한다.
                </p>
                <p>
                  이 경우 그 명령에 의하여 개정 또는 폐지되었던 법률은 그 명령이
                  승인을 얻지 못한 때부터 당연히 효력을 회복한다. 국회는
                  국무총리 또는 국무위원의 해임을 대통령에게 건의할 수 있다.
                  국교는 인정되지 아니하며, 이에 필요한 서류의 제출 또는 증인의
                  출석과 증언이나 의견의 진술을 요구할 수 있다.
                </p>
                <p>
                  법령의 범위안에서 자치에 관한 규정을 제정할 수 있다, 대통령은
                  국가의 독립·영토의 보전·국가의 계속성과 헌법을 수호할 책무를
                  진다. 대통령이 임시회의 집회를 요구할 때에는 기간과 집회요구의
                  이유를 명시하여야 한다, 국가는 청원에 대하여 심사할 의무를
                  진다.
                </p>
              </div>
              <div v-if="$l2.code === 'zh'">
                <h4>神奇的丝瓜</h4>
                <p>《标准教程 HSK 6》第18课课文</p>
                <p>
                  春天，孩子们在楼旁空地上开出一个小小的花园，随即种上了一棵树、几株花和几粒丝瓜种子。土壤不是很肥沃，但有水的滋润，阳光的照耀，没几天，丝瓜就从土里冒了出来，接着我惊讶地发现，它好像每时每刻都在长大。看着丝瓜，我心中难免不解:古人是怎么想的，愣是编出个拔苗助长的故事来？要是我，宁愿用别的比喻。
                </p>
              </div>
              <div v-if="$l2.code === 'yue'">
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
              <div v-if="$l2.code === 'ja'">
                <h4>下がる気温「うちで寝たい」「トイレが」 避難所ルポ</h4>
                <p>
                  各地に大雨被害をもたらした台風１９号で、１６日朝までの朝日新聞の集計によると１２都県で計７５人が死亡し、１３人が行方不明になっている。東日本の広い範囲で河川が氾濫（はんらん）し、福島や長野、宮城など１３都県で計約４５００人が避難生活を余儀なくされた。この日の朝は被災地の多くで気温が１０度を下回り、各地で今季最低を記録。先行きの見えない暮らしが続くなか、避難するお年寄りらは疲れをにじませている。
                </p>
              </div>
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
const defaultSettings = {
  zoomLevel: 0,
  autoPronounce: true,
  adminMode: false,
  onceAdmin: false,
  showDefinition: undefined,
  showTranslation: undefined,
  showQuickGloss: undefined,
  showPinyin: undefined,
  useTraditional: undefined,
  showQuiz: undefined,
  useSerif: undefined,
  showByeonggi: undefined,
  disableAnnotation: undefined,
  quizMode: false,
};
export default {
  props: {
    variant: {
      default: "page", // or 'toolbar'
    },
  },
  data() {
    return defaultSettings;
  },
  mounted() {
    this.loadSettings();
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (mutation.type === "settings/LOAD_SETTINGS") {
        this.loadSettings();
      }
    });
    this.setupWatchers();
  },
  computed: {
    ...mapState("settings", ["l2Settings", "l1", "l2"]),
    userIsAdmin() {
      return this.$auth.user && this.$auth.user.role == 1;
    },
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
    l2SettingsOfL2() {
      if (this.l2Settings) return this.l2Settings[this.$l2.code];
    },
  },
  methods: {
    loadSettings() {
      if (!this.$l2.code) return;
      if (!this.l2SettingsOfL2) return;
      for (let property in defaultSettings) {
        if (this[property] !== this.l2SettingsOfL2[property])
          this[property] = this.l2SettingsOfL2[property];
      }
      if (this.adminMode) this.onceAdmin = true;
    },
    setupWatchers() {
      for (let property in defaultSettings) {
        this.$watch(property, (newValue, oldValue) => {
          let payload = {};
          payload[property] = newValue;
          this.$store.dispatch("settings/setL2Settings", payload);
        });
      }
    },
  },
  watch: {
    // set up in setupWatchers()
    adminMode() {
      this.$store.dispatch("settings/setGeneralSettings", {
        adminMode: this.adminMode,
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

.annotation-setting-icon {
  width: 2rem;
  text-align: center;
  display: inline-block;
}
</style>