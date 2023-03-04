
export default {
  translators: [
    {
      id: 'google',
      name: 'Google',
      langs: 'af am ar az be bg bn bs ca ceb co cs cy da de el en eo es et eu fa fi fr fy ga gd gl gu ha haw hi hmn hr ht hu hy id ig is it he ja jv ka kk km kn ko ku ky la lb lo lt lv mg mi mk ml mn mr ms mt my ne nl no ny or pa pl ps pt ro ru rw sd si sk sl sm sn so sq sr st su sv sw ta te tg th tk tl tr tt ug uk ur uz vi xh yi yo zh zu',
      home: 'https://translate.google.com/',
      map: `arb	ar
grc	el
he	iw
jv	jw
nsl	no
zh	zh-CN`,
      url(text, l1Code, l2Code) {
        return `https://translate.google.com/?sl=${l2Code}&tl=${l1Code}&text=${encodeURIComponent(text)}&op=translate`
      }
    },
    {
      id: "papago",
      name: "Papago",
      langs: 'de en es fr hi id it ja ko pt ru th vi zh',
      map: 'zh	zh-CN',
      home: 'https://papago.naver.com/',
      url(text, l1Code, l2Code) {
        return `https://papago.naver.com/?sk=auto&st=${encodeURIComponent(
          (text || '').slice(0, 920)
        )}`
      }
    },
    {
      id: 'bing',
      name: 'Bing',
      langs: 'af am ar as az bg bn bs ca cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu hy id is it iu ja kk km kmr kn ko ku lo lt lv lzh mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sq sr sv sw ta te th ti tlh to tr ty uk ur vi yua yue zh',
      map: `zh	zh-Hans
tlh	tlh-Latn
sr	sr-Cyrl`,
      home: 'https://www.bing.com/translator',
      url(text, l1Code, l2Code) {
        return `https://www.bing.com/translator/?from=${l2Code}&to=${l1Code}&text=${encodeURIComponent(text)}`
      }
    },
    {
      id: 'reverseo',
      name: "Reverso",
      langs: 'ar zh nl en fr de he it ja pl pt ro ru es tr',
      home: 'https://www.reverso.net/text_translation.aspx?lang=EN'
    },
    {
      id: 'deepl',
      name: "DeepL",
      langs: 'bg zh cs da nl en et fi fr de el hu it ja lv lt pl pt ro ru sk sl es sv',
      home: 'https://www.deepl.com/en/translator',
      url(text, l1Code, l2Code) {
        return `https://www.deepl.com/en/translator#${l2Code}/${l1Code}/${encodeURIComponent(text)}`
      }
    },
    {
      id: 'yandex',
      name: "Yandex",
      langs: 'af am ar az ba be bg bn bs ca ceb cs cv cy da de el en eo es et eu fa fi fr ga gd gl gu he hi hr ht hu hy id is it ja jv ka kk km kn ko ky la lb lo lt lv mg mhr mi mk ml mn mr mrj ms mt my ne nl no pa pap pl pt ro ru sah si sk sl sq sr su sv sw ta te tg th tl tr tt udm uk ur uz vi xh yi zh zu',
      home: 'https://translate.yandex.com',
      url(text, l1Code, l2Code) {
        return `https://translate.yandex.com/?lang=${l2Code}-${l1Code}&text=${encodeURIComponent(text)}`
      }
    },
    {
      id: 'baidu',
      name: "Baidu",
      langs: 'ach af ak am an ar arq as ast ay az ba bal be bem bg bho bi bli bn br bs ca ceb chr co cr cri cs cv cy da de dv el en eno eo es et eu fa ff fi fil fo fr frm fy ga gd gl gn gra gu gv ha hak haw he hi hil hmn hr hsb ht hu hup hy ia id ig ing io is it iu ja jv ka kab kah kg kl kli km kn ko kok kr ks ku kw ky la lag lb lg li ln lo log loj los lt lv lzh mai mau mfe mg mh mk ml mot mr ms mt nb ne nea nl nn no nqo nr ny oc oj om or os pa pam pap ped pl pot ps pt qu rm ro rom ru ruy rw sa sc sco sd se sec sha si sil sk sl sm sn so sol sq sr src st su sv sw syr ta te tet tg th ti tk tl tr ts tt tua tw uk ur ve vi wa wo xh yi yo yue zaz zh zu',
      map: `af	afr
ak	aka
am	amh
an	arg
ar	ara
as	asm
ay	aym
az	aze
ba	bak
be	bel
bg	bul
bi	bis
bn	ben
br	bre
bs	bos
ca	cat
cmn	zh
cnu	ber
co	cos
cr	cre
cv	chv
cy	wel
da	dan
dv	div
eo	epo
es	spa
et	est
eu	baq
fa	per
ff	ful
fi	fin
fo	fao
fr	fra
fur	fri
fy	fry
ga	gle
gd	gla
gho	ber
gl	glg
gn	grn
gu	guj
gv	glv
ha	hau
he	heb
hr	hrv
hsb	ups
hy	arm
ia	ina
ig	ibo
io	ido
is	ice
iu	iku
ja	jp
jv	jav
ka	geo
kab	ber
kg	kon
kl	kal
km	hkm
kn	kan
ko	kor
kr	kau
ks	kas
ku	kur
kw	cor
ky	kir
la	lat
lb	ltz
lg	lug
li	bur
li	lim
ln	lin
lo	lao
lt	lit
lv	lav
lzh	wyw
mfe	mao
mh	mah
mk	mac
ml	mal
mr	mar
ms	may
mt	mlt
nb	nob
ne	nep
nn	nno
no	nor
nr	nbl
ny	nya
oc	oci
oj	oji
om	orm
or	ori
os	oss
pa	pan
ps	pus
qu	que
rif	ber
rm	roh
rw	kin
sa	san
sc	srd
sd	snd
se	sme
si	sin
sjs	ber
sl	slo
sn	sna
so	som
sq	alb
sr	srp
st	sot
su	sun
sv	swe
sw	swa
ta	tam
te	tel
tg	tgk
ti	tir
tk	tuk
tl	tgl
tmh	ber
ts	tso
tt	tat
tw	twi
tzm	ber
uk	ukr
ur	urd
ve	ven
vi	vie
wa	wln
wo	wol
xh	xho
yi	yid
yo	yor
zu	zul`,
      home: 'https://fanyi.baidu.com/',
      url(text, l1Code, l2Code) {
        return `https://fanyi.baidu.com/#${l2Code}/${l1Code}/${encodeURIComponent(text)}`
      }
    },
  ],
  get(l1 = undefined, l2 = undefined) {
    for (let translator of this.translators) {
      if (typeof translator.langs === 'string') {
        translator.langs = translator.langs.split(' ')
        if (translator.map) {
          let map = {}
          let rows = translator.map.split("\n")
          for (let row of rows) {
            let [lang, locale] = row.split("\t")
            map[lang] = locale
          }
          translator.map = map
        }
        translator.code = (language) => {
          if (translator.map)
            return translator.map[language.code] || language.code
          else
            return language.code
        }
      }
      if (l1 && l2) {
        if (translator.id === 'panlex') {
          translator.l1Code = l1['iso639-3']
          translator.l2Code = l2['iso639-3']
        } else {
          translator.l1Code = l1.code
          translator.l2Code = translator.langs.find(code => l2.code === code)
          if (translator.map && translator.map[l2.code])
            translator.l2Code = translator.map[l2.code]
        }
      }
    }
    return this
  },
  getTranslationURL(text, l1, l2) {
    text = text || ''
    let url
    let baidu = this.translators.find(t => t.id === 'baidu')
    let papago = this.translators.find(t => t.id === 'papago')
    let yandex = this.translators.find(t => t.id === 'yandex')
    let bing = this.translators.find(t => t.id === 'bing')
    if ([l2.code, l1.code].includes("zh") || l2.han) {
      url = baidu.url(text, baidu.l1Code, baidu.l2Code)
    } else if ([l2.code, l1.code].includes("ru") ||
      [
        'az',
        'be',
        'cs',
        'et',
        'ka',
        'hy',
        'kjh',
        'kk',
        'ky',
        'lt',
        'lv',
        'mo',
        'sah',
        'tg',
        'tk',
        'tt',
        'uk',
        'uz',
      ].includes(l2.code)) {
      url = yandex.url(text, yandex.l1Code, yandex.l2Code)
    } else if (["ko", "ja"].includes(l2.code)) {
      url = papago.url(text, papago.l1Code, papago.l2Code);
    } else if (["vi", "tr"].includes(l2.code)) {
      url = bing.url(text, bing.l1Code, bing.l2Code)
    } else {
      for (let translator of this.translators) {
        if (translator.l2Code && typeof translator.url !== 'undefined') {
          url = translator.url(text, translator.l1Code, translator.l2Code)
          break
        }
      }
    }
    return url
  }
}