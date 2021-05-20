<router>
  {
    path: '/:l1/:l2/bookmarklet',
    meta: {
      title: 'Keyboard | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Read the target language with phonetic annotations using our bookmarklet.'
        }
      ]
    }
  }
</router>
<template>
  <div class="bookmarklet-view">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-md-8">
          <h1 class="mb-5">Hindi Romanization Bookmarklet</h1>
          <p>
            For beginner learners of Hindi, sometimes it's very difficult
            reading the
            <a href="https://en.wikipedia.org/wiki/Devanagari"
              >Devanagari script</a
            >, given its numerous subtly different sounds and letter-combining
            rules.
          </p>
          <p>
            For this reason, we created the
            <b>"Annotate Hindi" Bookmarklet</b>. (<a
              href="https://en.wikipedia.org/wiki/Bookmarklet"
              target="_blank"
              >What's a bookmarklet?
              <i class="fa fa-external-link-alt" /> </a
            >)
          </p>
          <div class="mt-2 mb-4 bg-light p-4 shadow rounded">
            <p>
              How to use:
            </p>
            <ol>
              <li>
                <b>drag</b> the button below to your Desktop browser's
                <b>bookmark bar:</b><br />
                <a :href="bookmarkletURL" class="btn btn-primary mt-2 mb-2"
                  >Annotate Hindi</a
                >
              </li>
              <li>
                Once installed, you can go to a Hindi webpage. For example,
                <a
                  href="https://www.bhaskar.com/international/news/pm-narendra-modi-bhutan-visit-news-and-updates-01620015.html"
                  target="_blank"
                  >this article from bhaskar.com
                  <i class="fa fa-external-link-alt"/></a
                >.
              </li>
              <li>
                After the page loads, click the "Annotate Hindi" bookmarklet in
                your bookmarks bar.
              </li>
              <li>
                The program puts romanized transliteration on top of each Hindi
                word.
              </li>
            </ol>
          </div>
          <p class="mt-4">
            The transliteration tries to follow the
            <a
              href="https://en.wikipedia.org/wiki/International_Alphabet_of_Sanskrit_Transliteration"
              >IAST standard</a
            >
            (International Alphabet of Sanskirt Transliteration)
            <em>except</em> we remove the final vowel “a” as the “a” is almost
            never pronounced.
          </p>
          <h5>Before:</h5>
          <img
            src="/img/hindi-annotation-bookmarklet-before.jpg"
            class="img-fluid shadow rounded mt-2 mb-4"
            alt="Screenshot before"
          />
          <h5>After:</h5>
          <img
            src="/img/hindi-annotation-bookmarklet-after.jpg"
            class="img-fluid shadow rounded mt-2 mb-2"
            alt="Screenshot after"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      bookmarkletURL: `javascript:(function()%7Blet %24 %3D jQuery%3Bvar HindiAnnotator %3D %7B%2F*** IAST standards for International Alphabet of Sanskrit Transliteration* https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FInternational_Alphabet_of_Sanskrit_Transliteration*%2Fiast%3A %5B%2F* Nuqtā *%2F%2F* https%3A%2F%2Fen.wiktionary.org%2Fwiki%2FWiktionary%3AHindi_transliteration%23Nuqt%25C4%2581 *%2F%5B%2Fक़%2Fg%2C 'qə'%5D%2C%5B%2Fख़%2Fg%2C 'xə'%5D%2C%5B%2Fग़%2Fg%2C 'ġə'%5D%2C%5B%2Fज़%2Fg%2C 'zə'%5D%2C%5B%2Fझ़%2Fg%2C 'žə'%5D%2C%5B%2Fफ़%2Fg%2C 'fə'%5D%2C%5B%2Fड़%2Fg%2C 'ṛə'%5D%2C%5B%2Fढ़%2Fg%2C 'ṛhə'%5D%2C%2F* Conjuncts *%2F%5B%2Fक्ष%2Fg%2C 'kṣə'%5D%2C%5B%2Fत्र%2Fg%2C 'trə'%5D%2C%5B%2Fज्ञ%2Fg%2C 'jñə'%5D%2C%5B%2Fष्र%2Fg%2C 'śrə'%5D%2C%2F* Non-Alphabetic Symbols%3A *%2F%5B%2Fय़%2Fg%2C 'ẏa'%5D%2C%2F* Consonants - velars *%2F%5B%2Fक%2Fg%2C 'kə'%5D%2C %2F* tenuis *%2F%5B%2Fख%2Fg%2C 'khə'%5D%2C%2F* aspirated *%2F%5B%2Fग%2Fg%2C 'gə'%5D%2C %2F* voiced *%2F%5B%2Fघ%2Fg%2C 'ghə'%5D%2C%2F* breathy-voiced *%2F%5B%2Fङ%2Fg%2C 'ṅə'%5D%2C %2F* nasal stops *%2F%5B%2Fह%2Fg%2C 'hə'%5D%2C %2F* approximants *%2F%2F* Consonants - palatals *%2F%5B%2Fच%2Fg%2C 'cə'%5D%2C %2F* tenuis *%2F%5B%2Fछ%2Fg%2C 'chə'%5D%2C%2F* aspirated *%2F%5B%2Fज%2Fg%2C 'jə'%5D%2C %2F* voiced *%2F%5B%2Fझ%2Fg%2C 'jhə'%5D%2C%2F* breathy-voiced *%2F%5B%2Fञ%2Fg%2C 'ñə'%5D%2C %2F* nasal stops *%2F%5B%2Fय%2Fg%2C 'yə'%5D%2C %2F* approximants *%2F%5B%2Fश%2Fg%2C 'śə'%5D%2C %2F* sibilants *%2F%2F* Consonants - retroflexes *%2F%5B%2Fट%2Fg%2C 'ṭə'%5D%2C %2F* tenuis *%2F%5B%2Fठ%2Fg%2C 'ṭhə'%5D%2C%2F* aspirated *%2F%5B%2Fड%2Fg%2C 'ḍə'%5D%2C %2F* voiced *%2F%5B%2Fढ%2Fg%2C 'ḍhə'%5D%2C%2F* breathy-voiced *%2F%5B%2Fण%2Fg%2C 'ṇə'%5D%2C %2F* nasal stops *%2F%5B%2Fर%2Fg%2C 'rə'%5D%2C %2F* approximants *%2F%5B%2Fष%2Fg%2C 'ṣə'%5D%2C %2F* sibilants *%2F%2F* Consonants - dentals *%2F%5B%2Fत%2Fg%2C 'tə'%5D%2C %2F* tenuis *%2F%5B%2Fथ%2Fg%2C 'thə'%5D%2C%2F* aspirated *%2F%5B%2Fद%2Fg%2C 'də'%5D%2C %2F* voiced *%2F%5B%2Fध%2Fg%2C 'dhə'%5D%2C%2F* breathy-voiced *%2F%5B%2Fन%2Fg%2C 'nə'%5D%2C %2F* nasal stops *%2F%5B%2Fल%2Fg%2C 'lə'%5D%2C %2F* approximants *%2F%5B%2Fस%2Fg%2C 'sə'%5D%2C %2F* sibilants *%2F%2F* Consonants - labials *%2F%5B%2Fप%2Fg%2C 'pə'%5D%2C %2F* tenuis *%2F%5B%2Fफ%2Fg%2C 'phə'%5D%2C%2F* aspirated *%2F%5B%2Fब%2Fg%2C 'bə'%5D%2C %2F* voiced *%2F%5B%2Fभ%2Fg%2C 'bhə'%5D%2C%2F* breathy-voiced *%2F%5B%2Fम%2Fg%2C 'mə'%5D%2C %2F* nasal stops *%2F%5B%2Fव%2Fg%2C 'və'%5D%2C %2F* approximants *%2F%2F* Vowels and codas - full *%2F%5B%2Fअ%2Fg%2C 'a'%5D%2C%5B%2Fआ%2Fg%2C 'ā'%5D%2C%5B%2Fइ%2Fg%2C 'i'%5D%2C%5B%2Fई%2Fg%2C 'ī'%5D%2C%5B%2Fउ%2Fg%2C 'u'%5D%2C%5B%2Fऊ%2Fg%2C 'ū'%5D%2C%5B%2Fऋ%2Fg%2C 'ṛ'%5D%2C%5B%2Fॠ%2Fg%2C 'ṝ'%5D%2C%5B%2Fऌ%2Fg%2C 'ḷ'%5D%2C%5B%2Fॡ%2Fg%2C 'ḹ'%5D%2C%5B%2Fए%2Fg%2C 'e'%5D%2C%5B%2Fऐ%2Fg%2C 'ai'%5D%2C%5B%2Fओ%2Fg%2C 'o'%5D%2C%5B%2Fऔ%2Fg%2C 'au'%5D%2C%5B%2Fऽ%2Fg%2C '%5C''%5D%2C%2F* Vowels and codas - combining *%2F%5B%2Fा%2Fg%2C 'ā'%5D%2C%5B%2Fि%2Fg%2C 'i'%5D%2C%5B%2Fी%2Fg%2C 'ī'%5D%2C%5B%2Fु%2Fg%2C 'u'%5D%2C%5B%2Fू%2Fg%2C 'ū'%5D%2C%5B%2Fृ%2Fg%2C 'ṛ'%5D%2C%5B%2Fॄ%2Fg%2C 'ṝ'%5D%2C%5B%2Fॢ%2Fg%2C 'ḷ'%5D%2C%5B%2Fॣ%2Fg%2C 'ḹ'%5D%2C%5B%2Fे%2Fg%2C 'e'%5D%2C%5B%2Fै%2Fg%2C 'ai'%5D%2C%5B%2Fो%2Fg%2C 'o'%5D%2C%5B%2Fौ%2Fg%2C 'au'%5D%2C%5B%2Fं%2Fg%2C 'ṃ'%5D%2C%5B%2Fः%2Fg%2C 'ḥ'%5D%2C%5B%2Fँ%2Fg%2C '̃'%5D%2C%2F* Remove virama (used to connect ध and य to form ध्य ) *%2F%5B%2F्%2Fg%2C ''%5D%5D%2Ctransliterate(devanagari) %7Blet roman %3D devanagari%3Bfor (let pattern of this.iast) %7Broman %3D roman.replace(pattern%5B0%5D%2C pattern%5B1%5D)%3B%7Droman %3D roman.replace(%2Fə(%5Baāiīuūṛṝḷḹeo%5D)%2Fg%2C '%241')%3Broman %3D roman.replace(%2Fə%2Fg%2C 'a')%3Broman %3D roman.replace(%2F(%5Cw%2B)a%5Cb%2Fg%2C '%241')%3Breturn roman%3B%7D%2CisDevanagari(text) %7Bfor (let pattern of this.iast) %7Bif (text.match(pattern%5B0%5D)) return true%3B%7Dreturn false%3B%7D%2CwordBlockTemplate(textOrBlock) %7Bif (typeof textOrBlock %3D%3D%3D 'object') %7Breturn %60<span class%3D"word-block"><div class%3D"word-block-roman">%24%7BtextOrBlock.roman%7D<%2Fdiv><div class%3D"word-block-devanagri">%24%7BtextOrBlock.devanagri%7D<%2Fdiv><%2Fspan>%60%3B%7D else if (typeof textOrBlock %3D%3D%3D 'string') %7Blet text %3D textOrBlock%3Breturn %60<span class%3D"word-block-text">%24%7Btext%7D<%2Fspan>%60%3B%7D%7D%2CannotateText(text%2C callback) %7Bconst words %3D text.split(' ')%3Blet data %3D %5B%5D%3Bfor (let word of words) %7Bif (this.isDevanagari(word)) %7Bdata.push(%7Bdevanagri%3A word%2Croman%3A this.transliterate(word)%7D)%3B%7D else %7Bdata.push(word)%3B%7D%7Dcallback(data)%3B%7D%2Cannotate(textNode) %7Bif (textNode.nodeValue.replace(%2F%5Cs%2Fg%2C '').length > 0) %7B%2F* Not just spaces! *%2Fthis.annotateText(textNode.nodeValue%2C data %3D> %7Bfor (let textOrBlock of data) %7Blet wordBlockHTML %3D this.wordBlockTemplate(textOrBlock)%3Blet block %3D %24(wordBlockHTML)%5B0%5D%3B%24(textNode).before(block)%3B%7D%24(textNode).remove()%3B%7D)%3B%7D%7D%2CannotateIteratively(node) %7Bif (node) %7Bif (node.nodeType %3D%3D%3D 3) %7B%2F* textNode *%2Fif (this.isDevanagari(node.nodeValue)) %7Bthis.annotate(node)%3B%7D%7D else %7Blet nodes %3D %5B%5D%3Bfor (let n of node.childNodes) %7Bnodes.push(n)%3B%7Dfor (let n of nodes) %7Bthis.annotateIteratively(n)%3B%2F* recursive! *%2F%7D%7D%7D%7D%2CinjectStyles(css) %7B%24('<div %2F>'%2C %7Bhtml%3A '<style>' %2B css %2B '<%2Fstyle>'%7D).appendTo('body')%3B%7D%2CapplyStyles() %7Bthis.injectStyles(%60.word-block %7Bdisplay%3A inline-block%3Btext-align%3A center%3Bmargin%3A 0 0.2em%3B%7D.word-block-roman %7Bopacity%3A 0.5%3Bfont-size%3A 0.8em%3B%7D%60)%3B%7D%7D%3Bfunction myJQueryCode() %7Blet %24 %3D jQuery%3BHindiAnnotator.annotateIteratively(%24('body')%5B0%5D)%3BHindiAnnotator.applyStyles()%3B%7Dif (typeof jQuery %3D%3D 'undefined') %7Bvar headTag %3D document.getElementsByTagName('head')%5B0%5D%3Bvar jqTag %3D document.createElement('script')%3BjqTag.type %3D 'text%2Fjavascript'%3BjqTag.src %3D 'https%3A%2F%2Fcode.jquery.com%2Fjquery-3.4.1.min.js'%3BjqTag.onload %3D myJQueryCode%3BheadTag.appendChild(jqTag)%3B%7D else %7BmyJQueryCode()%3B%7D%7D)()`
    }
  }
}
</script>
