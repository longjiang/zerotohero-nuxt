export const TEST = false;

export const SALE = false;

export const NON_PRO_MAX_LINES = 15; // The 'you need pro' prompt obscures 7 lines, so only NON_PRO_MAX_LINES - 7 are actually visible to non-pro users

export const NON_PRO_MAX_SUBS_SEARCH_HITS = 5;

export const LANGS_WITH_CONTENT =
  "zh en it es fr ja de ko tr ru nl sv pl nan no id th ca pt vi he el uk cs ar sk ms fa tlh yue ase hi da lv lt kk tl hu bg gl eo sr ro hr ka cy et wo hy ta is gu mn bn br mr la mk az fi su lzh te pa sh ins cnr ur bo be ga my as kn eu hak mi uz mt lb ml ckb grc gd ami sq tt fo km lo sa qu yo nsl sm si so jv sl ba ku af am ceb fsl fy ky bs wuu oc sd kac sw yi zu non ne ti csb om srm sco gsw mxv hbo pes bho mg rm kvk scn crh hil nv cop got hsn ia krl ab ln ryu xh ug za aib gn hni ps sah sli tg ang cpx ha mnp ojp ain cjy kl lad acu arc dsb gv ii ksw ltc sux akk awa dz fur hne kab mai mhx nqo sc ybe acf aou ay bsk byq gan gkp goh ig ik kok kpe min mni och or pis pms ss vec vo xpe arz czo enm jam lkt osc sjn se tsd hsh svk eso".split(
    " "
  );

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