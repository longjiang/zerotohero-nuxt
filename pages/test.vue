<router>
  {
    path: '/:l1/:l2/test'
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h4>Unicode</h4>
          <Annotate>
            <div>
              မြန်မာနိုင်ငံ (အင်္ဂလိပ်: Myanmar၊ ယခင်အင်္ဂလိပ်အမည်: "Burma"
              (ဘားမား)၊ တရားဝင်အားဖြင့် ပြည်ထောင်စု သမ္မတ မြန်မာနိုင်ငံတော်
              (Republic and the Union of Myanmar)) သည် အရှေ့တောင်အာရှတွင်
              ဧရိယာအားဖြင့် ဒုတိယ အကျယ်ဝန်းဆုံး နိုင်ငံဖြစ်သည်။[၈] ၁၉၄၈ ခုနှစ်
              ဇန်နဝါရီ ၄ ရက်နေ့တွင် ဂရိတ်ဗြိတိန်နိုင်ငံထံမှ (အင်္ဂလိပ်လို
              "Burma" အဖြစ်နှင့်) ပြည်ထောင်စု မြန်မာနိုင်ငံတော် အဖြစ်
              လွတ်လပ်ရေးကို ရရှိခဲ့သည်။ နောက်ပိုင်းတွင် ပြည်ထောင်စု ဆိုရှယ်လစ်
              သမ္မတမြန်မာနိုင်ငံတော်အဖြစ် ၁၉၇၄ ခုနှစ် ဇန်နဝါရီ ၄ ရက်တွင်
              လည်းကောင်း၊ ပြည်ထောင်စု မြန်မာနိုင်ငံတော် အဖြစ် ၁၉၈၈ခုနှစ်
              စက်တင်ဘာ ၂၃ ရက်တွင်လည်းကောင်း၊ ပြည်ထောင်စု မြန်မာနိုင်ငံတော်အဖြစ်
              ၁၉၈၉ ခုနှစ် ဇွန် ၁၈ ရက်တွင် လည်းကောင်း အမည်များပြောင်းလဲခဲ့သည်။
              အာဏာရစစ်အစိုးရအား အသိအမှတ် မပြုသော အဖွဲ့အစည်းများက ဘားမား (Burma)
              ဟုသာ အသိအမှတ်ပြု သုံးစွဲခဲ့သည်[ကိုးကားချက်လိုသည်]။ ၂၀၀၈
              ဖွဲ့စည်းပုံအခြေခံဥပဒေအရ ၂၀၁၀ ခုနှစ် ဧပြီလ ၁ ရက် နေ့မှစ၍
              ပြည်ထောင်စု သမ္မတ မြန်မာနိုင်ငံတော် အဖြစ် ပြောင်းလဲခေါ်ဆိုခဲ့သည်။
              နိုင်ငံတော်အလံကိုလည်း ယခင် နိုင်ငံတော် အေးချမ်းသာယာရေးနှင့်
              ဖွံ့ဖြိုးရေးကောင်စီအစိုးရလက်ထက် ၂၀⁠၀၈ ခုနှစ်တွင် ပြဋ္ဌာန်းခဲ့သော
              ဖွဲ့စည်းပုံအခြေခံဥပဒေ ၂၀၀၈ တွင် သတ်မှတ်ထားသည့် နိုင်ငံတော် အလံ
              ဖြင့် အစားထိုး၍ ပြောင်းလဲ အသုံးပြုခဲ့သည်။ [၉]
            </div>
          </Annotate>
          <h4>Zawgyi</h4>

          <Annotate>
            <div>
              ေနာက္ထပ္ ေနာက္ထပ္ ေနာက္ထပ္ ဒဏ္ရာေတြေပၚ အရည္မေပ်ာ္ခ်င္ေတာ့ဘူး
            </div>
          </Annotate>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  // layout: "test-layout",
  computed: {
    $l1() {
      return this.$store.state.settings.l1;
    },
    $l2() {
      return this.$store.state.settings.l2;
    },
    $dictionaryName() {
      return this.$store.state.settings.dictionaryName;
    },
  },
  data() {
    return {
      showTestEntry: false,
      entry: undefined,
      href: undefined,
    };
  },
  methods: {
    async dictionarySize() {
      let dictionary = await this.$getDictionary();
      let size = await (await dictionary).getSize();
      console.log(`The dictionary has ${size} entries.`);
    },
    async testFrenchTokenization() {
      // let dictionary = await this.$getDictionary();
      // let word = await (await dictionary).lookup("suivre");
      // console.log(await (await dictionary).wordForms(word));
    },
    async testFrench() {
      let dictionary = await this.$getDictionary();
      let word = await (await dictionary).lookup("suivre");
      console.log(await (await dictionary).wordForms(word));
    },
    async testDictionary() {
      let dictionary = await this.$getDictionary();
      this.entry = await (await dictionary).lookup("你好");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
    async testRandom() {
      let dictionary = await this.$getDictionary();
      console.log(await (await dictionary).random(), "dictionary.random()");
    },
  },
};
</script>

<style>
</style>