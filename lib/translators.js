
export default {
  translators: [
    {
      id: 'google',
      name: 'Google Translate',
      langs: 'cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sr sv sw ta te th ti tlh to tr ty uk ur vi yua zh',
      url(text, l1Code, l2Code) {
        return `https://translate.google.com/#view=home&op=translate&sl=${l2Code === "zh" ? "zh-CN" : matchedGoogleCode
          }&tl=${l1Code}&text=${encodeURIComponent(text)}`
      }
    },
    {
      id: 'bing',
      name: 'Bing Translate',
      langs: 'cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sr sv sw ta te th ti tlh to tr ty uk ur vi yua zh',
      map: `zh	zh-Hans
tlh	tlh-Latn
sr	sr-Cyrl`
    },
    {
      id: 'collins',
      name: "Collins",
      langs: 'af am ar as az bg bn bs ca cs cy da de el en es et fa fi fil fj fr ga gu he hi hr ht hu hy id is it iu ja kk km kmr kn ko ku lo lt lv mg mi ml mr ms mt mww my nb ne nl or otq pa pl prs ps pt ro ru sk sl sm sq sr sv sw ta te th ti tlh to tr ty uk ur vi yua yue zh',
      map: `zh	zh-Hans
pt	pt-PT
tlh	tlh-Latn
sr	sr-Cyrl`
    },
    {
      id: 'deepl',
      name: "DeepL",
      langs: 'bg zh cs da nl en et fi fr de el hu it ja lv lt pl pt ro ru sk sl es sv'
    },
    {
      id: 'baidu',
      name: "Baidu Translate",
      langs: 'ach afr aka alb amh ara arg arm arq asm ast aym aze bak bal baq bel bem ben ber bho bis bli bos bre bul bur cat ceb chr cht chv cor cos cre cri cs dan de div el en eno epo est fao fil fin fra fri frm frn fry ful geo gla gle glg glv gra grn guj hak hau haw heb hi hil hkm hmn hrv ht hu hup ibo ice id ido iku ina ing it jav jp kab kah kal kan kas kau kin kir kli kok kon kor kur lag lao lat lav lim lin lit log loj los ltz lug mac mah mai mal mao mar mau may mg mlt mot nbl nea nep nl nno nob nor nqo nya oci oji ori orm oss pam pan pap ped per pl pot pt pus que ro roh rom ru ruy san sco sec sha sil sin sk slo sm sme sna snd sol som sot spa src srd srp sun swa swe syr tam tat tel tet tgk tgl th tir tr tso tua tuk twi ukr ups urd ven vie wel wln wol wyw xho yid yor yue zaz zh zul',
      map: `af	afr
ak	aka
sq	alb
am	amh
ar	ara
an	arg
hy	arm
as	asm
ay	aym
az	aze
ba	bak
eu	baq
be	bel
bn	ben
kab	ber
sjs	ber
gho	ber
tmh	ber
cnu	ber
tzm	ber
rif	ber
bi	bis
bs	bos
br	bre
bg	bul
li	bur
ca	cat
cv	chv
kw	cor
co	cos
cr	cre
da	dan
dv	div
eo	epo
et	est
fo	fao
fi	fin
fr	fra
af	fri
fy	fry
ff	ful
ka	geo
gd	gla
ga	gle
gl	glg
gv	glv
gn	grn
gu	guj
ha	hau
he	heb
km	hkm
hr	hrv
ig	ibo
is	ice
io	ido
iu	iku
ia	ina
jv	jav
ja	jp
kl	kal
kn	kan
ks	kas
kr	kau
rw	kin
ky	kir
kg	kon
ko	kor
ku	kur
lo	lao
la	lat
lv	lav
li	lim
ln	lin
lt	lit
lb	ltz
lg	lug
mk	mac
mh	mah
ml	mal
mfe	mao
mr	mar
ms	may
mt	mlt
nr	nbl
ne	nep
nn	nno
nb	nob
no	nor
ny	nya
oc	oci
oj	oji
or	ori
om	orm
os	oss
pa	pan
fa	per
ps	pus
qu	que
rm	roh
sa	san
si	sin
sl	slo
se	sme
sn	sna
sd	snd
so	som
st	sot
es	spa
sc	srd
sr	srp
su	sun
sw	swa
sv	swe
ta	tam
tt	tat
te	tel
tg	tgk
tl	tgl
ti	tir
ts	tso
tk	tuk
tw	twi
uk	ukr
hsb	ups
ur	urd
ve	ven
vi	vie
cy	wel
wa	wln
wo	wol
lzh	wyw
xh	xho
yi	yid
yo	yor
zu	zul`,
      url(text, l1Code, l2Code) {
        return `https://fanyi.baidu.com/#${l2Code}/${l1Code}/${encodeURIComponent(text)}`
      }
    },
    {
      id: "papago",
      name: "Papago",
      langs: 'de en es fr hi id it ja ko pt ru th vi zh',
      map: 'zh	zh-CN',
      url(text, l1Code, l2Code) {
        return `https://papago.naver.com/?sk=auto&st=${encodeURIComponent(
          text
        )}`
      }
    },
    {
      id: 'panlex',
      name: "Panlex",
      langs: 'all-languages',
      url(text, l1Code, l2Code) {
        return `https://translate.panlex.org/?langDe=${l2Code
          }-000&langAl=${l1Code}-000&txt=${encodeURIComponent(
            text
          )}`
      }
    }
  ],
  get(l1, l2) {
    for (let translator of this.translators) {
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
    return this
  },
  url(text, l1, l2) {
    let url
    let baidu = this.translators.find(t => t.id === 'baidu')
    let papago = this.translators.find(t => t.id === 'papago')
    if ([l2.code, l1.code].includes("zh") || l2.han) {
      url = baidu.url(text, baidu.l1Code, l2)
    } else if (["ko", "ja"].includes(l2.code)) {
      url = papago.url(text, papago.l1Code, papago.l2Code);
    } else {
      for (let translator of this.translators) {
        if (translator.l2Code) {
          url = translator.url(text, translator.l1Code, translator.l2Code)
          break
        }
      }
    }
    return url
  }
}