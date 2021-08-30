
export default {
  translators: [
    {
      name: 'Google Translate',
      langs: 'cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sr sv sw ta te th ti tlh to tr ty uk ur vi yua zh',
      url(text, l1, l2) {
        return `https://translate.google.com/#view=home&op=translate&sl=${l2.code === "zh" ? "zh-CN" : matchedGoogleCode
          }&tl=${l1.code}&text=${encodeURIComponent(text)}`
      }
    },
    {
      name: 'Bing Translate',
      langs: 'cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sr sv sw ta te th ti tlh to tr ty uk ur vi yua zh',
      map: `zh	zh-Hans
tlh	tlh-Latn
sr	sr-Cyrl`
    },
    {
      name: "Collins",
      langs: 'af am ar as az bg bn bs ca cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu hy id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sq sr sv sw ta te th ti tlh to tr ty uk ur vi yua yue zh',
      map: `zh	zh-Hans
pt	pt-PT
tlh	tlh-Latn
sr	sr-Cyrl`
    },
    {
      name: "DeepL",
      langs: 'bg zh cs da nl en et fi fr de el hu it ja lv lt pl pt ro ru sk sl es sv'
    },
    {
      name: "Baidu Translate",
      langs: 'zh en jp th spa ara fra kor ru de pt it el nl pl fin cs bul dan est hu rom slo swe vie yue cht wyw afr alb amh arm asm ast aze baq bel ben bos bur cat ceb hrv epo fao fil glg geo guj hau heb hi ice ibo id gle kan kli kur lao lat lav lit ltz mac mg may mal mlt mar nep nno per srd srp sin sk som swa tgl tgk tam tat tel tr tuk ukr urd oci kir pus hkm ht nob pan arq bis frn hak hup ing lag mau mot pot ruy sec sil tua ach aka arg aym bal bak bem ber bho bli bre chr nya chv cor cos cre cri div eno frm fri ful gla lug gra grn haw hil ido ina iku jav kab kal kau kas kah kin kon kok lim lin loj log los mai glv mao mah nbl nea nqo sme nor oji ori orm oss pam pap ped que roh ro sm san sco sha sna snd sol sot syr tet tir tso twi ups ven wln wel fry wol xho yid yor zaz zul sun hmn src',
      map: 'lzh	wyw',
      url(text, l1, l2) {
        return `https://fanyi.baidu.com/#${l2.code}/${l1.code}/${encodeURIComponent(text)}`
      }
    },
    {
      name: "Papgo",
      url(text, l1, l2) {
        return `https://papago.naver.com/?sk=auto&st=${encodeURIComponent(
          text
        )}`
      }
    },
    {
      name: "Panlex",
      langs: 'all-languages',
      url(text, l1, l2) {
        return `https://translate.panlex.org/?langDe=${l2["iso639-3"]
          }-000&langAl=${l1["iso639-3"]}-000&txt=${encodeURIComponent(
            text
          )}`
      }
    }
  ],
  get(l1, l2) {
    return this
  },
  url(text, l1, l2) {

    let url
    if ([l2.code, l1.code].includes("zh") || l2.han) {
      url = `https://fanyi.baidu.com/#${l2.code}/${l1.code}/${encodeURIComponent(text)}`;
      if (l2.code === "lzh")
        url = `https://fanyi.baidu.com/#wyw/en/${text}`;
    } else if (["ko", "ja"].includes(l2.code)) {
      url = `https://papago.naver.com/?sk=auto&st=${encodeURIComponent(
        text
      )}`;
    } else {
      let matchedGoogleCode = googleTranslateLangs.find(code => [l2['iso639-1'], l2['iso639-3']].includes(code))
      let matchedBaiduCode = baiduTranslateLangs.find(code => [l2['iso639-1'], l2['iso639-3']].includes(code))
      if (matchedGoogleCode) {
        url = `https://translate.google.com/#view=home&op=translate&sl=${l2.code === "zh" ? "zh-CN" : matchedGoogleCode
          }&tl=${l1.code}&text=${encodeURIComponent(text)}`;
      } else if (matchedBaiduCode) {
        url = `https://fanyi.baidu.com/#${matchedBaiduCode}/${l1.code}/${encodeURIComponent(text)}`;
      } else {
        url = `https://translate.panlex.org/?langDe=${l2["iso639-3"]
          }-000&langAl=${l1["iso639-3"]}-000&txt=${encodeURIComponent(
            text
          )}`;
      }
    }
    return url
  }
}