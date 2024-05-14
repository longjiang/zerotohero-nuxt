export const TEST = false;

export const SALE = true;

export const SALE_NAME = "SUMMER";

export const SALE_END_DATE = new Date(2024, 4, 21); // January 1, 2024. The month is 0-indexed.

export const SALE_DISCOUNT = 0.7;

export const DEFAULT_PAGE = "explore-media"; // The page that the user is redirected to after logging in. Options are "recommended-video", "explore-media"

export const NON_PRO_MAX_LINES = 15; // The 'you need pro' prompt obscures 7 lines, so only NON_PRO_MAX_LINES - 7 are actually visible to non-pro users

export const NON_PRO_MAX_SUBS_SEARCH_HITS = 5;

export const LANGS_WITH_CONTENT =
  "en zh ko it es fr de ja pt ru tr pl nl id da th sv uk no fi ca cs vi ar he nan yue hi el sk hu ro ase fa sr ms bg lt lv sl cmn tl ur ta az et kk hr eo gl ka cy mn is ky hy bn wo br hsh gu mr la cnr te be tlh km mk su ga pa my lzh sh sq ins och bo eu as kn ku grc mi hak mg uz arb bs ml mt lb ckb gsw gd sw kac ami si tt af fo lo sa qu svk yo nsl ceb am sm jv so ba fsl fy wuu oc sd yi zu ne non ti csb om prs srm sco mxv hbo pes bho ksw rm kvk scn crh eso hil nv ang cop got hsn ia krl nb tg xh ab ln nn ryu ug za aib gn hni ps sah sli cpx ha mnp ain cjy kl lad acu arc dsb gv ii kab ojp sux dz fur hne ig mai mhx sc acf akk ay gkp ik kok ltc min mni or pms ss vec vo xpe bsk czo enm gan goh jam osc pis sjn se tsd".split(
    " "
  );

export const LANGS_YOUTUBE_SUPPORTS = "aa ab af akk am ar arc as ase ay az ba be bg bh bi bn bo br brx bs ca cho chr co cop cr cs cy da de-AT de-CH de-DE de doi dz el en-CA en-GB en-IE en-IN en-US en eo es-419 es-ES es-MX es-US es et eu fa-AF fa-IR fa ff fi fil fj fo fr-BE fr-CA fr-CH fr-FR fr fy ga gd gl gn grc gu ha hak-TW hak haw hbo he hi-Latn hi ho hr ht hu hy ia id ie ig ik is it iu iw ja jv ka kk kl km kn ko kok ks ku ky la lad lb ln lo lt lus lv mai mas mg mi mk ml mn-Mong mn mni mo mr ms mt my na nan-TW nan nb ne nl-BE nl-NL nl nn no nv oc om or pa pap pl ps pt-BR pt-PT pt qu rm rn ro ru-Latn ru rw sa sat sc scn sd sdp sg sh si sk sl sm sn so sq sr-Cyrl sr-Latn sr ss st su sv sw ta te tg th ti tk tl tlh tn to tpi tr ts tt tw ug uk ur uz ve vi vo vro wo xh yi yo yue-HK yue zh-CN zh-Hans zh-Hant zh-HK zh-SG zh-TW zh zu".split(
  " "
)

export const LANGS_WITH_LIVE_TV = "amh ara aze bak ben bos bul cat ces cmn cnr dan deu ell eng est fas fra fry glg heb hin hrv hun hye iku ind isl ita jpn kan kat kaz kin kor kur lao lav lit ltz mal mkd mlt mri nan nep nld nor pan pol por pus ron rus sin slk slv som spa sqi srp swe tam tel tgl tha tur ukr urd vie yue zho".split(
  " "
)

export const LANGS_WITH_AZURE_TRANSLATE = 'af am ar as az ba bg bn bo bs ca cs cy da de dsb dv el en es et eu fa fi fil fj fo fr ga gl gom gu ha he hi hr hsb ht hu hy id ig ikt is it iu ja ka kk km kmr kn ko ku ky ln lo lt lug lv lzh mai mg mi mk ml mn mr ms mt mww my no nb ne nl nso nya or otq pa pl prs ps pt ro ru run rw sd si sk sl sm sn so sq sr st sv sw ta te th ti tk tlh tn to tr tt ty ug uk ur uz vi xh yo yua yue zh zu'.split(' ')

export const LANGS_WITH_LEX_DIV = [
  "ar",
  "ast",
  "bg",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "enm",
  "es",
  "fa",
  "fi",
  "fr",
  "ga",
  "gd",
  "gl",
  "gv",
  "hr",
  "hu",
  "hy",
  "id",
  "is",
  "it",
  "ja",
  "ka",
  "ko",
  "la",
  "lb",
  "lt",
  "lv",
  "mk",
  "ms",
  "my",
  "no", // Replaced "nb" and "nn"
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "se",
  "sh",
  "sk",
  "sl",
  "sq",
  "sv",
  "sw",
  "tl",
  "tr",
  "uk",
  "zh",
];

export const LANGS_WITH_WORD_FREQ = [
  "ar",
  "bg",
  "bn",
  "bs",
  "ca",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fa",
  "fi",
  "fi",
  "fr",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "is",
  "it",
  "ja",
  "ko",
  "ko",
  "lt",
  "lv",
  "mk",
  "ms",
  "no", // Replaced "nb"
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sr",
  "sv",
  "ta",
  "tr",
  "uk",
  "ur",
  "vi",
  "zh",
];

// Find the intersection of two arrays
export const LANGS_WITH_LEVELS = LANGS_WITH_LEX_DIV.filter(value => LANGS_WITH_WORD_FREQ.includes(value));