<template>
  <div>
    <div v-for="rendering in renderings" class="renderings" :key="rendering">
      <div v-if="rendering.refs.length > 0">
        <h4
          colspan="4"
          v-if="rendering.text.length > 0"
          v-html="rendering.text"
        ></h4>
        <h4
          colspan="4"
          v-if="rendering.text.length === 0"
          v-html="rendering.renderingString + ':'"
        ></h4>
        <ul class="timeline-events">
          <li
            v-for="ref in rendering.refs"
            v-bind:data-symbol="ref.symbol"
            class="timeline-event"
            :key="ref"
          >
            <div class="grid">
              <div class="symbol" v-html="ref.symbol"></div>
              <div>
                <a
                  v-bind:href="ref.url"
                  v-html="ref.name"
                  v-if="ref.time"
                  v-bind:data-source="ref.source"
                ></a>
                <span v-html="ref.description" v-if="!ref.time"></span>
                <div v-html="ref.time"></div>
              </div>
              <div class="image">
                <img v-bind:src="ref.image" />
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div>
      <p id="p49" data-pid="49" class="sx"><span class="symbol"><span class="altsize">א</span></span>(ʼAleph)   Codex Sinaiticus, Gr., fourth cent. C.E., British Museum, H.S., G.S.</p>
      <p id="p50" data-pid="50" class="sx"><span class="symbol">A</span>Codex Alexandrinus, Gr., fifth cent. C.E., British Museum, H.S., G.S.</p>
      <p id="p51" data-pid="51" class="sx"><span class="symbol"><em>ad</em></span>Aid to Bible Understanding, <em>Watch Tower Bible and Tract Society, Brooklyn, 1971.</p>
      <p id="p52" data-pid="52" class="sx"><span class="symbol">Al</span>Aleppo Codex, Heb., c. 930 C.E., Israel, H.S.</p>
      <p id="p53" data-pid="53" class="sx"><span class="symbol">Aq</span>Aquila’s Gr. translation of H.S., second cent. C.E., Cambridge, England.</p>
      <p id="p54" data-pid="54" class="sx"><span class="symbol">Arm</span>Armenian Version, fourth to thirteenth cent. C.E.; H.S., G.S.</p>
      <p id="p55" data-pid="55" class="sx"><span class="symbol">B</span>Vatican ms 1209, Gr., fourth cent. C.E., Vatican City, Rome, H.S., G.S.</p>
      <p id="p56" data-pid="56" class="sx"><span class="symbol">B 19<sup>A</sup></span>See Leningrad.</p>
      <p id="p57" data-pid="57" class="sx"><span class="symbol">Bauer</span><em>A Greek-English Lexicon of the New Testament and Other Early Christian Literature, </em>by W. Bauer, second English ed., by F. W. Gingrich and F. W. Danker, Chicago and London (1979).</p>
      <p id="p58" data-pid="58" class="sx"><span class="symbol">BDB</span><em>Hebrew and English Lexicon of the Old Testament, </em>by Brown, Driver and Briggs, Oxford, 1978 reprint.</p>
      <p id="p59" data-pid="59" class="sx"><span class="symbol">BHK</span><em>Biblia Hebraica, </em>by Kittel, Kahle, Alt and Eissfeldt, Privilegierte Württembergische Bibelanstalt, Stuttgart, seventh to ninth ed., 1951-55, H.S.</p>
      <p id="p60" data-pid="60" class="sx"><span class="symbol">BHS</span><em>Biblia Hebraica Stuttgartensia, </em>by Elliger and Rudolph, Deutsche Bibelstiftung, Stuttgart, 1977, H.S.</p>
      <p id="p61" data-pid="61" class="sx"><span class="symbol">C</span>Codex Ephraemi rescriptus, Gr., fifth cent. C.E., Paris, H.S., G.S.</p>
      <p id="p62" data-pid="62" class="sx"><span class="symbol">Ca</span>Cairo Codex, Heb., 895 C.E., Cairo, Egypt, H.S.</p>
      <p id="p63" data-pid="63" class="sx"><span class="symbol">D</span>Bezae Codices, Gr. and Lat., fifth and sixth cent. C.E., Cambridge, England, G.S.</p>
      <p id="p64" data-pid="64" class="sx"><span class="symbol">Gins.</span><em>Massoretico-Critical Text of the Hebrew Bible, </em>by C. D. Ginsburg, London, 1926.</p>
      <p id="p65" data-pid="65" class="sx"><span class="symbol">Gins.<sup>Int</sup></span><em>Introduction to the Massoretico-Critical Edition of the Hebrew Bible, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1966 reprint.</p>
      <p id="p66" data-pid="66" class="sx"><span class="symbol">Gins.<sup>Mas</sup></span><em>The Massorah, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1975 reprint.</p>
      <p id="p67" data-pid="67" class="sx"><span class="symbol">GK</span><em>Gesenius’ Hebrew Grammar, </em>by E. Kautzsch and A. E. Cowley, Oxford, England (1910).</p>
      <p id="p68" data-pid="68" class="sx"><span class="symbol">Grn</span><em>The Interlinear Hebrew/English Bible, </em>Vol. I-III, by J. Green, Wilmington, U.S., 1976.</p>
      <p id="p69" data-pid="69" class="sx"><span class="symbol">Int</span><em>The Kingdom Interlinear Translation of the Greek Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1969, a word-for-word rendering from Greek into English.</p>
      <p id="p70" data-pid="70" class="sx"><span class="symbol">It</span>Old Latin Versions, Itala, second to fourth cent. C.E.; H.S., G.S.</p>
      <p id="p71" data-pid="71" class="sx"><span class="symbol">J<sup>1</sup></span>Matthew, Heb., edited by J. du Tillet, with a Lat. translation by J. Mercier, Paris, 1555.</p>
      <p id="p72" data-pid="72" class="sx"><span class="symbol">J<sup>2</sup></span>Matthew, Heb., incorporated as a separate chapter in <em>ʼEʹven boʹchan </em>[“Tried Stone”], by Shem-Tob ben Isaac Ibn Shaprut, 1385. Mss of 16th and 17th cent., Jewish Theological Seminary, New York.</p>
      <p id="p73" data-pid="73" class="sx"><span class="symbol">J<sup>3</sup></span>Matthew and Hebrews, Heb. and Lat., by Sebastian Münster, Basel, 1537 and 1557 respectively.</p>
      <p id="p74" data-pid="74" class="sx"><span class="symbol">J<sup>4</sup></span>Matthew, Heb., by J. Quinquarboreus, Paris, 1551.</p>
      <p id="p75" data-pid="75" class="sx"><span class="symbol">J<sup>5</sup></span>Liturgical Gospels, Heb., by F. Petri, Wittemberg, 1573.</p>
      <p id="p76" data-pid="76" class="sx"><span class="symbol">J<sup>6</sup></span>Liturgical Gospels, German, Lat., Gr. and Heb., by Johann Clajus, Leipzig, 1576.</p>
      <p id="p77" data-pid="77" class="sx"><span class="symbol">J<sup>7</sup></span>Christian Greek Scriptures in 12 languages, including Heb., by Elias Hutter, Nuremberg, 1599.</p>
      <p id="p78" data-pid="78" class="sx"><span class="symbol">J<sup>8</sup></span>Christian Greek Scriptures, Heb., by William Robertson, London, 1661.</p>
      <p id="p79" data-pid="79" class="sx"><span class="symbol">J<sup>9</sup></span>Gospels, Heb. and Lat., by Giovanni Battista Jona, Rome, 1668.</p>
      <p id="p80" data-pid="80" class="sx"><span class="symbol">J<sup>10</sup></span><em>The New Testament . . . in Hebrew and English, </em>by Richard Caddick, Vol. I-III, containing Matthew—1 Corinthians, London, 1798-1805.</p>
      <p id="p81" data-pid="81" class="sx"><span class="symbol">J<sup>11</sup></span>Christian Greek Scriptures, Heb., by Thomas Fry and others, London, 1817.</p>
      <p id="p82" data-pid="82" class="sx"><span class="symbol">J<sup>12</sup></span>Christian Greek Scriptures, Heb., by William Greenfield, London, 1831.</p>
      <p id="p83" data-pid="83" class="sx"><span class="symbol">J<sup>13</sup></span>Christian Greek Scriptures, Heb., by A. McCaul, M. S. Alexander, J. C. Reichardt and S. Hoga, London, 1838.</p>
      <p id="p84" data-pid="84" class="sx"><span class="symbol">J<sup>14</sup></span>Christian Greek Scriptures, Heb., by J. C. Reichardt, London, 1846.</p>
      <p id="p85" data-pid="85" class="sx"><span class="symbol">J<sup>15</sup></span>Luke, Acts, Romans and Hebrews, Heb., by J. H. R. Biesenthal, Berlin, 1855, 1867, 1853 and 1858 respectively.</p>
      <p id="p86" data-pid="86" class="sx"><span class="symbol">J<sup>16</sup></span>Christian Greek Scriptures, Heb., by J. C. Reichardt and J. H. R. Biesenthal, London, 1866.</p>
      <p id="p87" data-pid="87" class="sx"><span class="symbol">J<sup>17</sup></span>Christian Greek Scriptures, Heb., by Franz Delitzsch, London, 1981 ed.</p>
      <p id="p88" data-pid="88" class="sx"><span class="symbol">J<sup>18</sup></span>Christian Greek Scriptures, Heb., by Isaac Salkinson and C. D. Ginsburg, London.</p>
      <p id="p89" data-pid="89" class="sx"><span class="symbol">J<sup>19</sup></span>John, Heb., by Moshe I. Ben Maeir, Denver, Colorado, 1957.</p>
      <p id="p90" data-pid="90" class="sx"><span class="symbol">J<sup>20</sup></span><em>A Concordance to the Greek Testament, </em>by W. F. Moulton and A. S. Geden, fourth ed., Edinburgh, 1963.</p>
      <p id="p91" data-pid="91" class="sx"><span class="symbol">J<sup>21</sup></span><em>The Emphatic Diaglott </em>(Greek-English interlinear), by Benjamin Wilson, New York, 1864, reprint by Watch Tower Bible and Tract Society, Brooklyn, 1942.</p>
      <p id="p92" data-pid="92" class="sx"><span class="symbol">J<sup>22</sup></span>Christian Greek Scriptures, Heb., by United Bible Societies, Jerusalem, 1979.</p>
      <p id="p93" data-pid="93" class="sx"><span class="symbol">J<sup>23</sup></span>Christian Greek Scriptures, Heb., by J. Bauchet, Rome, 1975.</p>
      <p id="p94" data-pid="94" class="sx"><span class="symbol">J<sup>24</sup></span><em>A Literal Translation of the New Testament . . . From the Text of the Vatican Manuscript, </em>by Herman Heinfetter, London, 1863.</p>
      <p id="p95" data-pid="95" class="sx"><span class="symbol">J<sup>25</sup></span><em>St. Paul’s Epistle to the Romans, </em>by W. G. Rutherford, London, 1900.</p>
      <p id="p96" data-pid="96" class="sx"><span class="symbol">J<sup>26</sup></span>Psalms and <a href="/en/wol/bc/r1/lp-e/1001060001/8/0" data-bid="9-1" class="b">Matthew 1:1-3:6</a>, Heb., by Anton Margaritha, Leipzig, 1533.</p>
      <p id="p97" data-pid="97" class="sx"><span class="symbol">J<sup>27</sup></span><em>Die heilige Schrift des neuen Testaments, </em>by Dominik von Brentano, third ed., Vienna and Prague, 1796.</p>
      <p id="p98" data-pid="98" class="sx"><span class="symbol">JTS</span><em>Journal of Theological Studies, </em>Clarendon, Oxford.</p>
      <p id="p99" data-pid="99" class="sx"><span class="symbol">KB</span><em>Lexicon in Veteris Testamenti Libros, </em>by L. Koehler and W. Baumgartner, Leiden, Netherlands, 1953.</p>
      <p id="p100" data-pid="100" class="sx"><span class="symbol">KB<sup>3</sup></span><em>Hebräisches und Aramäisches Lexikon zum Alten Testament, </em>by W. Baumgartner, third ed., Leiden, Netherlands, 1967 and later ed.</p>
      <p id="p101" data-pid="101" class="sx"><span class="symbol">Leningrad</span>Codex Leningrad B 19<sup>A</sup>, Heb., 1008 C.E., H.S., Saltykov-Shchedrin State Public Library, Leningrad, U.S.S.R.</p>
      <p id="p102" data-pid="102" class="sx"><span class="symbol">LS</span><em>A Greek-English Lexicon, </em>by H. Liddell and R. Scott, Oxford, 1968.</p>
      <p id="p103" data-pid="103" class="sx"><span class="symbol">LXX</span><em>Septuagint, </em>Gr., third and second cent. B.C.E., H.S. (A. Rahlfs, Deutsche Bibelgesellschaft, Stuttgart, 1935).</p>
      <p id="p104" data-pid="104" class="sx"><span class="symbol">LXX<sup>א</sup></span>See <span class="altsize">א</span>.</p>
      <p id="p105" data-pid="105" class="sx"><span class="symbol">LXX<sup>A</sup></span>See A.</p>
      <p id="p106" data-pid="106" class="sx"><span class="symbol">LXX<sup>B</sup></span>See B.</p>
      <p id="p107" data-pid="107" class="sx"><span class="symbol">LXX<sup>Bagster</sup></span><em>Septuagint </em>(with an English translation by Sir Lancelot Brenton, S. Bagster &amp; Sons, London, 1851).</p>
      <p id="p108" data-pid="108" class="sx"><span class="symbol">LXX<sup>L</sup></span><em>Septuagint </em>(P. de Lagarde, Göttingen, Germany, 1883).</p>
      <p id="p109" data-pid="109" class="sx"><span class="symbol">LXX<sup>Thomson</sup></span><em>Septuagint, </em>translated by C. Thomson, Pells ed., London, 1904.</p>
      <p id="p110" data-pid="110" class="sx"><span class="symbol">M</span>Masoretic Hebrew text found in Codex Leningrad B 19<sup>A </sup>as presented in BHK and BHS.</p>
      <p id="p111" data-pid="111" class="sx"><span class="symbol">NW</span><em>New World Translation of the Holy Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1984 revision.</p>
      <p id="p112" data-pid="112" class="sx"><span class="symbol">P<sup>45</sup></span>Papyrus Chester Beatty 1, Gr., third cent. C.E., Dublin, G.S.</p>
      <p id="p113" data-pid="113" class="sx"><span class="symbol">P<sup>46</sup></span>Papyrus Chester Beatty 2, Gr., c. 200 C.E., Dublin, Ann Arbor, Michigan, U.S.A., G.S.</p>
      <p id="p114" data-pid="114" class="sx"><span class="symbol">P<sup>47</sup></span>Papyrus Chester Beatty 3, Gr., third cent. C.E., Dublin, G.S.</p>
      <p id="p115" data-pid="115" class="sx"><span class="symbol">P<sup>66</sup></span>Papyrus Bodmer 2, Gr., c. 200 C.E., Geneva, G.S.</p>
      <p id="p116" data-pid="116" class="sx"><span class="symbol">P<sup>74</sup></span>Papyrus Bodmer 17, Gr., seventh cent. C.E., Geneva, G.S.</p>
      <p id="p117" data-pid="117" class="sx"><span class="symbol">P<sup>75</sup></span>Papyrus Bodmer 14, 15, Gr., c. 200 C.E., Geneva, G.S.</p>
      <p id="p118" data-pid="118" class="sx"><span class="symbol">1QIs<sup>a</sup></span>The Dead Sea Scroll of Isaiah, Jerusalem, found in 1947 in Qumran Cave No. 1.</p>
      <p id="p119" data-pid="119" class="sx"><span class="symbol">Sam</span><em>Pentateuch </em>in Samaritan, fourth cent. B.C.E., Israel.</p>
      <p id="p120" data-pid="120" class="sx"><span class="symbol">si</span><em>“All Scripture Is Inspired of God and Beneficial,” </em>Watch Tower Bible and Tract Society, Brooklyn, 1963.</p>
      <p id="p121" data-pid="121" class="sx"><span class="symbol">Sn</span><em>Hebrew Old Testament, </em>by N. H. Snaith, Israel, 1970.</p>
      <p id="p122" data-pid="122" class="sx"><span class="symbol">Sy, Sy<sup>p</sup></span>Syriac <em>Peshitta, </em>Christian Aram., fifth cent. C.E., S. Lee, London, 1826, reprint by United Bible Societies, 1979.</p>
      <p id="p123" data-pid="123" class="sx"><span class="symbol">Sy<sup>c</sup></span>Curetonian Syriac, Old Syriac, fifth cent. C.E., Gospels, Cambridge, England.</p>
      <p id="p124" data-pid="124" class="sx"><span class="symbol">Sy<sup>h</sup></span>Philoxenian-Harclean Syriac Version, sixth and seventh cent. C.E.; G.S.</p>
      <p id="p125" data-pid="125" class="sx"><span class="symbol">Sy<sup>hi</sup></span>Jerusalem (Hierosolymitanum) Version, Old Syriac, sixth cent. C.E.; G.S.</p>
      <p id="p126" data-pid="126" class="sx"><span class="symbol">Sy<sup>s</sup></span>Sinaitic Syriac codex, fourth and fifth cent. C.E., Gospels.</p>
      <p id="p127" data-pid="127" class="sx"><span class="symbol">Sym</span>Greek translation of H.S., by Symmachus, c. 200 C.E.</p>
      <p id="p128" data-pid="128" class="sx"><span class="symbol">T</span>Targums, Aram. paraphrases of parts of H.S.</p>
      <p id="p129" data-pid="129" class="sx"><span class="symbol">T<sup>J</sup></span>Jerusalem Targum I (Pseudo-Jonathan) and Jerusalem Targum II (Fragmentary Targum).</p>
      <p id="p130" data-pid="130" class="sx"><span class="symbol">T<sup>O</sup></span>Targum of Onkelos (Babylonian Targum), Pentateuch.</p>
      <p id="p131" data-pid="131" class="sx"><span class="symbol">T<sup>P</sup></span>Palestinian Targum, Vatican City, Rome, Pentateuch.</p>
      <p id="p132" data-pid="132" class="sx"><span class="symbol">TDOT</span><em>Theological Dictionary of the Old Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1974 and later ed.</p>
      <p id="p133" data-pid="133" class="sx"><span class="symbol">TDNT</span><em>Theological Dictionary of the New Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1964 and later ed.</p>
      <p id="p134" data-pid="134" class="sx"><span class="symbol">Th</span>Greek translation of H.S., by Theodotion, second cent. C.E.</p>
      <p id="p135" data-pid="135" class="sx"><span class="symbol">TR</span><em>Textus Receptus </em>(Received Text) of G.S., by R. Stephanus, 1550.</p>
      <p id="p136" data-pid="136" class="sx"><span class="symbol">Vg</span>Latin <em>Vulgate, </em>by Jerome, c. 400 C.E. (<em>Iuxta Vulgatam Versionem, </em>Württembergische Bibelanstalt, Stuttgart, 1975).</p>
      <p id="p137" data-pid="137" class="sx"><span class="symbol">Vg<sup>c</sup></span>Latin <em>Vulgate, </em>Clementine recension (S. Bagster &amp; Sons, London, 1977).</p>
      <p id="p138" data-pid="138" class="sx"><span class="symbol">Vg<sup>s</sup></span>Latin <em>Vulgate, </em>Sixtine recension, 1590.</p>
      <p id="p139" data-pid="139" class="sx"><span class="symbol">Vg<sup>ww</sup></span><em>Novum Testamentum Latine secundum editionem Sancti Hieronymi ad Codicum Manuscriptorum Fidem, </em>by J. Wordsworth and H. J. White, Oxford, 1911.</p>
      <p id="p140" data-pid="140" class="sx"><span class="symbol">VT</span><em>Vetus Testamentum, </em>E. J. Brill, Leiden, Netherlands.</p>
      <p id="p141" data-pid="141" class="sx"><span class="symbol">W</span>Freer Gospels, fifth cent. C.E., Washington, D.C.</p>
      <p id="p142" data-pid="142" class="sx"><span class="symbol">WH</span><em>The New Testament in the Original Greek, </em>by Westcott and Hort, 1948 ed. (reprinted in Int).</p>
      <p id="p143" data-pid="143" class="sx"><span class="symbol">Zorell<sup>Gr</sup></span><em>Lexicon Graecum Novi Testamenti, </em>third ed., by F. Zorell, Paris, 1961.</p>
      <p id="p144" data-pid="144" class="sx"><span class="symbol">Zorell<sup>Heb</sup></span><em>Lexicon Hebraicum et Aramaicum Veteris Testamenti, </em>by F. Zorell, Rome, 1968.</p>
      <p id="p145" data-pid="145" class="sx"><span class="symbol"><sup>*</sup></span>Reading of the original (first) hand of a Greek manuscript.</p>
      <p id="p146" data-pid="146" class="sx"><span class="symbol"><sup>c</sup></span>Reading of any corrector of a Greek manuscript.</p>
    </div>
  </div>
</template>

<script>
import Wikipedia from "@/lib/jw/Wikipedia";
import $ from "jquery";

export default {
  methods: {
    /**
     * Determines if an html string is a list of manuscript references, an example:
     * “Make me as one of your hired men,” אBDSyh; P75AWVgSyp,s omit.
     *
     * @param {*} html
     */
    isRef(html) {
      let hints = ["Vg", "א", "<sup>", "LXX"];
      let matched = false;
      for (let hint of hints) {
        if (html.indexOf(hint) !== -1) {
          matched = true;
        }
      }
      return matched;
    },

    /**
     * Create a table from a list of renderings with references
     * @param {*} renderings
     * @param {*} id
     */
    renderingTable(renderings, id) {
      let wrapper = $("#" + id)[0];
      if (renderings.length > 0) {
        // $(wrapper).load("renderings.html", function () {
        //   let table = new Vue({
        //     el: "#" + id,
        //     data: {
        //       renderings: [],
        //     },
        //     updated: function () {
        //       this.$nextTick(function () {
        //         for (let rendering of this.renderings) {
        //           for (let ref of rendering.refs) {
        //             if (!ref.image) {
        //               let wikipedia = new Wikipedia();
        //               wikipedia.getFirstImage(ref.wikipedia, function (image) {
        //                 ref.image = $(image).attr("src");
        //               });
        //             }
        //           }
        //         }
        //       });
        //     },
        //   });
        //   table.renderings = renderings;
        // });
      }
    },

    lookupSymbolTable(refstring, symbolTable) {
      let refs = [];
      for (let row of symbolTable) {
        let matches = refstring.match(row.symbol);
        if (matches !== null) {
          if (!row.wikipedia && !row.wol) {
            matches = row.symbol.match(/P<sup>(\d+)<\/sup>/);
            if (matches) {
              row.wikipedia = "Papyrus_" + matches[1];
              if (!row.image) {
                row.image = "";
              }
            } else {
              row.wikipedia = row.name.replace(/ /g, "_");
              if (!row.image) {
                row.image = "";
              }
            }
          }
          if (row.wol) {
            row.url = row.wol;
            row.source = "wol";
          } else {
            row.url = "https://en.wikipedia.org/wiki/" + row.wikipedia;
            row.source = "wikipedia";
          }
          refs.push(row);
        }
      }
      return refs;
    },

    /**
     * Takes an html string with manuscript reference note like this:
     * “Make me as one of your hired men,” אBDSyh; P75AWVgSy<sup>p,s</sup> omit.
     * And turn it into a machine-readable array of renderings and references:
     * renderings = [{
     *     text: "Make me as one of your hired men",
     *     refString: אBDSyh
     *   },{
     *     text: "",
     *     refString: P75AWVgSy<sup>p/sup>Sy<sup>s</sup>
     *   }
     * ]}
     * @param {*} html
     */
    parseManuscriptReferenceString(html) {
      html = html.replace("Or, ", "");
      html = html.replace(/<wbr>/g, "");
      html = html.replace(/\. See.*/, "");
      let renderingStrings = html.split("; ");
      let renderings = [];
      for (let renderingString of renderingStrings) {
        renderingString = renderingString.replace(/^<\/em>/, "");
        let matches = renderingString.match(/(.*) “(.*)”/);
        if (matches) {
          renderings.push({
            renderingString: renderingString,
            refString: this.splitSuperscripts(matches[1]), // VgSyh,p
            text: matches[2], // “Joseph.”
          });
        } else {
          let matches = renderingString.match(/“(.*),” (.*)/);
          if (matches) {
            renderings.push({
              renderingString: renderingString,
              refString: this.splitSuperscripts(matches[2]), // VgSyh,p
              text: matches[1], // “Joseph,”
            });
          } else {
            let matches = renderingString.match(/(.*)(omit)/);
            if (matches) {
              renderings.push({
                renderingString: renderingString,
                refString: this.splitSuperscripts(matches[1]), // VgSyh,p
                text: "(omit)", // omit
              });
            } else {
              let matches = renderingString.match(/(.*), (.*)/);
              if (matches && this.isRef(matches[1])) {
                renderings.push({
                  renderingString: renderingString,
                  refString: this.splitSuperscripts(matches[1]), // J<sup>17,18,22</sup>(Heb.)
                  text: matches[2], // <em>naph·shohʹ </em>(from <em>neʹphesh</em>).
                });
              } else {
                renderings.push({
                  renderingString: renderingString,
                  refString: this.splitSuperscripts(renderingString), // J<sup>17,18,22</sup>(Heb.)
                  text: "", // <em>naph·shohʹ </em>(from <em>neʹphesh</em>).
                });
              }
            }
          }
        }
      }
      return renderings;
    },

    // Not used, we have json file now
    // convertSymbolTable(callback) {
    //   let symbols = $("<div />")[0];
    //   $(symbols).load("textual-symbols.html", function () {
    //     let symbolTable = [];
    //     $(symbols)
    //       .find("p")
    //       .each(function () {
    //         let symbol = $(this).find(".symbol")[0];
    //         let description = $(this).clone()[0];
    //         $(description).find(".symbol").remove();
    //         let array = $(description).text().split(", ");
    //         symbolTable.push({
    //           symbol: $(symbol).html(),
    //           description: $(description).html(),
    //           name: array[0],
    //           language: array[1],
    //           time: array[2],
    //           location: array[3],
    //           hs: array[4],
    //           gs: array[5],
    //         });
    //       });
    //     callback(symbolTable);
    //   });
    // },

    /**
     * Split J<sup>12,13</sup> into J<sup>12</sup>,J<sup>13</sup>
     * @param {*} refString
     */
    splitSuperscripts(refString) {
      return refString.replace(
        /(J|LXX|Sy|T|Vg)<sup>(.*)<\/sup>/g,
        function (match, p1, p2) {
          let refName = p1;
          let sups = p2.split(",");
          let results = [];
          for (let sup of sups) {
            results.push(refName + "<sup>" + sup + "</sup>");
          }
          return results.join("");
        }
      );
    },
  },
};

export const TEXTUAL_SYMBOLS = [
  {
    symbol: '<span class="altsize">א</span>',
    description:
      "Codex Sinaiticus, Gr., fourth cent. C.E., British Museum, H.S., G.S.",
    name: "Codex Sinaiticus",
    language: "Gr.",
    time: "fourth cent. C.E.",
    location: "British Museum",
    hs: "H.S.",
    gs: "G.S.",
  },
  {
    symbol: "A",
    description:
      "Codex Alexandrinus, Gr., fifth cent. C.E., British Museum, H.S., G.S.",
    name: "Codex Alexandrinus",
    language: "Gr.",
    time: "fifth cent. C.E.",
    location: "British Museum",
    hs: "H.S.",
    gs: "G.S.",
  },
  {
    symbol: "<em>ad</em>",
    description:
      "Aid to Bible Understanding, Watch Tower Bible and Tract Society, Brooklyn, 1971.",
    name: "Aid to Bible Understanding",
  },
  {
    symbol: "Al",
    description: "Aleppo Codex, Heb., c. 930 C.E., Israel, H.S.",
    name: "Aleppo Codex",
    language: "Heb.",
    time: "c. 930 C.E.",
    location: "Israel",
    hs: "H.S.",
    image: "https://wol.jw.org/en/wol/mp/r1/lp-e/nwtsty/2017/88",
  },
  {
    symbol: "Aq",
    description:
      "Aquila’s Gr. translation of H.S., second cent. C.E., Cambridge, England.",
    name: "Aquila’s Gr. translation of H.S.",
    time: "second cent. C.E.",
    location: "Cambridge, England",
  },
  {
    symbol: "Arm",
    description:
      "Armenian Version, fourth to thirteenth cent. C.E.; H.S., G.S.",
    name: "Armenian Version",
    time: "fourth to thirteenth cent. C.E.",
    hs: "H.S.",
    gs: "G.S.",
    wikipedia: "Bible_translations_into_Armenian",
  },
  {
    symbol: "B",
    description:
      "Vatican ms 1209, Gr., fourth cent. C.E., Vatican City, Rome, H.S., G.S.",
    name: "Codex Vaticanus (Vatican ms 1209)",
    language: "Gr.",
    time: "fourth cent. C.E.",
    location: "Vatican City, Rome",
    hs: "H.S.",
    gs: "G.S.",
    wikipedia: "Codex_Vaticanus",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e9/Codex_Vaticanus_B%2C_2Thess._3%2C11-18%2C_Hebr._1%2C1-2%2C2.jpg",
  },
  {
    symbol: "B 19<sup>A</sup>",
    description: "See Leningrad.",
    name: "See Leningrad.",
  },
  {
    symbol: "Bauer",
    description:
      "<em>A Greek-English Lexicon of the New Testament and Other Early Christian Literature, </em>by W. Bauer, second English ed., by F. W. Gingrich and F. W. Danker, Chicago and London (1979).",
    name: "A Greek-English Lexicon of the New Testament and Other Early Christian Literature",
  },
  {
    symbol: "BDB",
    description:
      "<em>Hebrew and English Lexicon of the Old Testament, </em>by Brown, Driver and Briggs, Oxford, 1978 reprint.",
    name: "Hebrew and English Lexicon of the Old Testament",
  },
  {
    symbol: "BHK",
    description:
      "<em>Biblia Hebraica, </em>by Kittel, Kahle, Alt and Eissfeldt, Privilegierte Württembergische Bibelanstalt, Stuttgart, seventh to ninth ed., 1951-55, H.S.",
    name: "Biblia Hebraica (Kittel)",
    wikipedia: "Biblia_Hebraica_(Kittel)",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/12/BHK-Kittel.jpg",
  },
  {
    symbol: "BHS",
    description:
      "<em>Biblia Hebraica Stuttgartensia, </em>by Elliger and Rudolph, Deutsche Bibelstiftung, Stuttgart, 1977, H.S.",
    name: "Biblia Hebraica Stuttgartensia",
    wikipedia: "https://en.wikipedia.org/wiki/Biblia_Hebraica_Stuttgartensia",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/BHS-cover.jpg/240px-BHS-cover.jpg",
  },
  {
    symbol: "C",
    description:
      "Codex Ephraemi Rescriptus, Gr., fifth cent. C.E., Paris, H.S., G.S.",
    name: "Codex Ephraemi Rescriptus",
    language: "Gr.",
    time: "fifth cent. C.E.",
    location: "Paris",
    hs: "H.S.",
    gs: "G.S.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Codex_ephremi.jpg",
  },
  {
    symbol: "Ca",
    description: "Cairo Codex, Heb., 895 C.E., Cairo, Egypt, H.S.",
    name: "Cairo Codex",
    language: "Heb.",
    time: "895 C.E.",
    location: "Cairo, Egypt",
    hs: "H.S.",
    wikipedia: "Codex_Cairensis",
  },
  {
    symbol: "D",
    description:
      "Bezae Codices, Gr. and Lat., fifth and sixth cent. C.E., Cambridge, England, G.S.",
    name: "Bezae Codices",
    language: "Gr. and Lat.",
    time: "fifth and sixth cent. C.E.",
    location: "Cambridge, England",
    gs: "G.S.",
    wikipedia: "Codex_Bezae",
  },
  {
    symbol: "Gins.",
    description:
      "<em>Massoretico-Critical Text of the Hebrew Bible, </em>by C. D. Ginsburg, London, 1926.",
    name: "Massoretico-Critical Text of the Hebrew Bible",
  },
  {
    symbol: "Gins.<sup>Int</sup>",
    description:
      "<em>Introduction to the Massoretico-Critical Edition of the Hebrew Bible, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1966 reprint.",
    name: "Introduction to the Massoretico-Critical Edition of the Hebrew Bible",
  },
  {
    symbol: "Gins.<sup>Mas</sup>",
    description:
      "<em>The Massorah, </em>by C. D. Ginsburg, Ktav Publishing House, New York, 1975 reprint.",
    name: "The Massorah",
  },
  {
    symbol: "GK",
    description:
      "<em>Gesenius’ Hebrew Grammar, </em>by E. Kautzsch and A. E. Cowley, Oxford, England (1910).",
    name: "Gesenius’ Hebrew Grammar",
  },
  {
    symbol: "Grn",
    description:
      "<em>The Interlinear Hebrew/English Bible, </em>Vol. I-III, by J. Green, Wilmington, U.S., 1976.",
    name: "The Interlinear Hebrew/English Bible",
    language: "Vol. I-III",
  },
  {
    symbol: "Int",
    description:
      "<em>The Kingdom Interlinear Translation of the Greek Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1969, a word-for-word rendering from Greek into English.",
    name: "The Kingdom Interlinear Translation of the Greek Scriptures",
  },
  {
    symbol: "It",
    description:
      "Old Latin Versions, Itala, second to fourth cent. C.E.; H.S., G.S.",
    name: "Old Latin Versions",
    time: "fourth to thirteenth century C.E.",
    wikipedia: "Vetus_Latina",
  },
  {
    symbol: "J<sup>1</sup>",
    description:
      "Matthew, Heb., edited by J. du Tillet, with a Lat. translation by J. Mercier, Paris, 1555.",
    name: "Matthew",
  },
  {
    symbol: "J<sup>2</sup>",
    description:
      "Matthew, Heb., incorporated as a separate chapter in <em>ʼEʹven boʹchan </em>[“Tried Stone”], by Shem-Tob ben Isaac Ibn Shaprut, 1385. Mss of 16th and 17th cent., Jewish Theological Seminary, New York.",
    name: "Matthew",
    language: "Heb.",
  },
  {
    symbol: "J<sup>3</sup>",
    description:
      "Matthew and Hebrews, Heb. and Lat., by Sebastian Münster, Basel, 1537 and 1557 respectively.",
    name: "Matthew and Hebrews",
    language: "Heb. and Lat.",
  },
  {
    symbol: "J<sup>4</sup>",
    description: "Matthew, Heb., by J. Quinquarboreus, Paris, 1551.",
    name: "Matthew",
    language: "Heb.",
  },
  {
    symbol: "J<sup>5</sup>",
    description: "Liturgical Gospels, Heb., by F. Petri, Wittemberg, 1573.",
    name: "Liturgical Gospels",
    language: "Heb.",
  },
  {
    symbol: "J<sup>6</sup>",
    description:
      "Liturgical Gospels, German, Lat., Gr. and Heb., by Johann Clajus, Leipzig, 1576.",
    name: "Liturgical Gospels",
    language: "German, Lat., Gr. and Heb.",
  },
  {
    symbol: "J<sup>7</sup>",
    description:
      "Christian Greek Scriptures in 12 languages, including Heb., by Elias Hutter, Nuremberg, 1599.",
    name: "Christian Greek Scriptures in 12 languages, including Heb.",
  },
  {
    symbol: "J<sup>8</sup>",
    description:
      "Christian Greek Scriptures, Heb., by William Robertson, London, 1661.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>9</sup>",
    description:
      "Gospels, Heb. and Lat., by Giovanni Battista Jona, Rome, 1668.",
    name: "Gospels",
    language: "Heb. and Lat.",
  },
  {
    symbol: "J<sup>10</sup>",
    description:
      "<em>The New Testament . . . in Hebrew and English, </em>by Richard Caddick, Vol. I-III, containing Matthew—1 Corinthians, London, 1798-1805.",
    name: "The New Testament . . . in Hebrew and English",
  },
  {
    symbol: "J<sup>11</sup>",
    description:
      "Christian Greek Scriptures, Heb., by Thomas Fry and others, London, 1817.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>12</sup>",
    description:
      "Christian Greek Scriptures, Heb., by William Greenfield, London, 1831.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>13</sup>",
    description:
      "Christian Greek Scriptures, Heb., by A. McCaul, M. S. Alexander, J. C. Reichardt and S. Hoga, London, 1838.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>14</sup>",
    description:
      "Christian Greek Scriptures, Heb., by J. C. Reichardt, London, 1846.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>15</sup>",
    description:
      "Luke, Acts, Romans and Hebrews, Heb., by J. H. R. Biesenthal, Berlin, 1855, 1867, 1853 and 1858 respectively.",
    name: "Luke, Acts, Romans and Hebrews",
    language: "Heb.",
  },
  {
    symbol: "J<sup>16</sup>",
    description:
      "Christian Greek Scriptures, Heb., by J. C. Reichardt and J. H. R. Biesenthal, London, 1866.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>17</sup>",
    description:
      "Christian Greek Scriptures, Heb., by Franz Delitzsch, London, 1981 ed.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>18</sup>",
    description:
      "Christian Greek Scriptures, Heb., by Isaac Salkinson and C. D. Ginsburg, London.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>19</sup>",
    description: "John, Heb., by Moshe I. Ben Maeir, Denver, Colorado, 1957.",
    name: "John",
    language: "Heb.",
  },
  {
    symbol: "J<sup>20</sup>",
    description:
      "<em>A Concordance to the Greek Testament, </em>by W. F. Moulton and A. S. Geden, fourth ed., Edinburgh, 1963.",
    name: "A Concordance to the Greek Testament",
  },
  {
    symbol: "J<sup>21</sup>",
    description:
      "<em>The Emphatic Diaglott </em>(Greek-English interlinear), by Benjamin Wilson, New York, 1864, reprint by Watch Tower Bible and Tract Society, Brooklyn, 1942.",
    name: "The Emphatic Diaglott (Greek-English interlinear)",
  },
  {
    symbol: "J<sup>22</sup>",
    description:
      "Christian Greek Scriptures, Heb., by United Bible Societies, Jerusalem, 1979.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>23</sup>",
    description: "Christian Greek Scriptures, Heb., by J. Bauchet, Rome, 1975.",
    name: "Christian Greek Scriptures",
    language: "Heb.",
  },
  {
    symbol: "J<sup>24</sup>",
    description:
      "<em>A Literal Translation of the New Testament . . . From the Text of the Vatican Manuscript, </em>by Herman Heinfetter, London, 1863.",
    name: "A Literal Translation of the New Testament . . . From the Text of the Vatican Manuscript",
  },
  {
    symbol: "J<sup>25</sup>",
    description:
      "<em>St. Paul’s Epistle to the Romans, </em>by W. G. Rutherford, London, 1900.",
    name: "St. Paul’s Epistle to the Romans",
  },
  {
    symbol: "J<sup>26</sup>",
    description:
      'Psalms and <a href="/en/wol/bc/r1/lp-e/1001060001/8/0" data-bid="9-1" class="b">Matthew 1:1-3:6</a>, Heb., by Anton Margaritha, Leipzig, 1533.',
    name: "Psalms and Matthew 1:1-3:6",
    language: "Heb.",
  },
  {
    symbol: "J<sup>27</sup>",
    description:
      "<em>Die heilige Schrift des neuen Testaments, </em>by Dominik von Brentano, third ed., Vienna and Prague, 1796.",
    name: "Die heilige Schrift des neuen Testaments",
  },
  {
    symbol: "JTS",
    description: "<em>Journal of Theological Studies, </em>Clarendon, Oxford.",
    name: "Journal of Theological Studies",
  },
  {
    symbol: "KB",
    description:
      "<em>Lexicon in Veteris Testamenti Libros, </em>by L. Koehler and W. Baumgartner, Leiden, Netherlands, 1953.",
    name: "Lexicon in Veteris Testamenti Libros",
  },
  {
    symbol: "KB<sup>3</sup>",
    description:
      "<em>Hebräisches und Aramäisches Lexikon zum Alten Testament, </em>by W. Baumgartner, third ed., Leiden, Netherlands, 1967 and later ed.",
    name: "Hebräisches und Aramäisches Lexikon zum Alten Testament",
  },
  {
    symbol: "Leningrad",
    description:
      "Codex Leningrad B 19<sup>A</sup>, Heb., 1008 C.E., H.S., Saltykov-Shchedrin State Public Library, Leningrad, U.S.S.R.",
    name: "Codex Leningrad B 19A",
    language: "Heb.",
  },
  {
    symbol: "LS",
    description:
      "<em>A Greek-English Lexicon, </em>by H. Liddell and R. Scott, Oxford, 1968.",
    name: "A Greek-English Lexicon",
  },
  {
    symbol: "LXX",
    description:
      "<em>Septuagint, </em>Gr., third and second cent. B.C.E., H.S. (A. Rahlfs, Deutsche Bibelgesellschaft, Stuttgart, 1935).",
    name: "Septuagint",
    time: "third and second cent. B.C.E.",
    hs: "H.S.",
    language: "Gr.",
    wol: "https://wol.jw.org/en/wol/d/r1/lp-e/2002686",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/96/Papyrus_967.jpg",
  },
  {
    symbol: "LXX<sup>א</sup>",
    description: 'See <span class="altsize">א</span>.',
    name: "See א.",
  },
  {
    symbol: "LXX<sup>A</sup>",
    description: "See A.",
    name: "See A.",
  },
  {
    symbol: "LXX<sup>B</sup>",
    description: "See B.",
    name: "See B.",
  },
  {
    symbol: "LXX<sup>Bagster</sup>",
    description:
      "<em>Septuagint </em>(with an English translation by Sir Lancelot Brenton, S. Bagster &amp; Sons, London, 1851).",
    name: "Septuagint (with an English translation by Sir Lancelot Brenton",
  },
  {
    symbol: "LXX<sup>L</sup>",
    description:
      "<em>Septuagint </em>(P. de Lagarde, Göttingen, Germany, 1883).",
    name: "Septuagint (P. de Lagarde",
  },
  {
    symbol: "LXX<sup>Thomson</sup>",
    description:
      "<em>Septuagint, </em>translated by C. Thomson, Pells ed., London, 1904.",
    name: "Septuagint",
  },
  {
    symbol: "M",
    description:
      "Masoretic Hebrew text found in Codex Leningrad B 19<sup>A </sup>as presented in BHK and BHS.",
    name: "Masoretic text (Codex Leningrad B 19A)",
    time: "1008/1009 C.E.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/LeningradCodex_text.jpg",
    wikipedia: "Leningrad_Codex",
  },
  {
    symbol: "NW",
    description:
      "<em>New World Translation of the Holy Scriptures, </em>Watch Tower Bible and Tract Society, Brooklyn, 1984 revision.",
    name: "New World Translation of the Holy Scriptures",
  },
  {
    symbol: "P<sup>45</sup>",
    description:
      "Papyrus Chester Beatty 1, Gr., third cent. C.E., Dublin, G.S.",
    name: "Papyrus Chester Beatty 1",
    language: "Gr.",
    time: "third cent. C.E.",
    location: "Dublin",
    hs: "H.S.",
  },
  {
    symbol: "P<sup>46</sup>",
    description:
      "Papyrus Chester Beatty 2, Gr., c. 200 C.E., Dublin, Ann Arbor, Michigan, U.S.A., G.S.",
    name: "Papyrus Chester Beatty 2",
    language: "Gr.",
    time: "c. 200 C.E.",
    location: "Dublin, Ann Arbor, Michigan, U.S.A.",
    gs: "G.S.",
    image: "https://wol.jw.org/en/wol/mp/r1/lp-e/wp16/2016/269",
  },
  {
    symbol: "P<sup>47</sup>",
    description:
      "Papyrus Chester Beatty 3, Gr., third cent. C.E., Dublin, G.S.",
    name: "Papyrus Chester Beatty 3",
    language: "Gr.",
    time: "third cent. C.E.",
    location: "Dublin",
    gs: "G.S.",
  },
  {
    symbol: "P<sup>66</sup>",
    description: "Papyrus Bodmer 2, Gr., c. 200 C.E., Geneva, G.S.",
    name: "Papyrus Bodmer 2",
    language: "Gr.",
    time: "c. 200 C.E.",
    location: "Geneva",
    gs: "G.S.",
  },
  {
    symbol: "P<sup>74</sup>",
    description: "Papyrus Bodmer 17, Gr., seventh cent. C.E., Geneva, G.S.",
    name: "Papyrus Bodmer 17",
    language: "Gr.",
    time: "seventh cent. C.E.",
    location: "Geneva",
    gs: "G.S.",
  },
  {
    symbol: "P<sup>75</sup>",
    description: "Papyrus Bodmer 14, 15, Gr., c. 200 C.E., Geneva, G.S.",
    name: "Papyrus Bodmer 14, 15",
    language: "Gr.",
    time: "c. 200 C.E.",
    location: "Geneva",
    gs: "G.S.",
  },
  {
    symbol: "1QIs<sup>a</sup>",
    description:
      "The Dead Sea Scroll of Isaiah, Jerusalem, found in 1947 in Qumran Cave No. 1.",
    name: "The Dead Sea Scroll of Isaiah",
    image: "https://wol.jw.org/en/wol/mp/r1/lp-e/nwtsty/2017/86",
  },
  {
    symbol: "Sam",
    description:
      "<em>Pentateuch </em>in Samaritan, fourth cent. B.C.E., Israel.",
    name: "Pentateuch in Samaritan",
    language: "Samaritan",
    time: "fourth cent. B.C.E.",
  },
  {
    symbol: "<em>si</em>",
    description:
      "<em>“All Scripture Is Inspired of God and Beneficial,” </em>Watch Tower Bible and Tract Society, Brooklyn, 1963.",
    name: "“All Scripture Is Inspired of God and Beneficial,” Watch Tower Bible and Tract Society",
  },
  {
    symbol: "Sn",
    description:
      "<em>Hebrew Old Testament, </em>by N. H. Snaith, Israel, 1970.",
    name: "Hebrew Old Testament",
  },
  {
    symbol: "Sy",
    description:
      "Syriac <em>Peshitta, </em>Christian Aram., fifth cent. C.E., S. Lee, London, 1826, reprint by United Bible Societies, 1979.",
    name: "Syriac Peshitta",
    language: "Christian Aram.",
    time: "fifth cent. C.E.",
    wikipedia: "Peshitta",
    wol: "https://wol.jw.org/en/wol/d/r1/lp-e/2014645",
    image: "https://wol.jw.org/en/wol/mp/r1/lp-e/w14/2014/1302",
  },
  {
    symbol: "Sy<sup>p</sup>",
    description:
      "Syriac <em>Peshitta, </em>Christian Aram., fifth cent. C.E., S. Lee, London, 1826, reprint by United Bible Societies, 1979.",
    name: "Syriac Peshitta",
    language: "Christian Aram.",
    time: "fifth cent. C.E.",
    wikipedia: "Peshitta",
    wol: "https://wol.jw.org/en/wol/d/r1/lp-e/2014645",
    image: "https://wol.jw.org/en/wol/mp/r1/lp-e/w14/2014/1302",
  },
  {
    symbol: "Sy<sup>c</sup>",
    description:
      "Curetonian Syriac, Old Syriac, fifth cent. C.E., Gospels, Cambridge, England.",
    name: "Curetonian Syriac",
    language: "Old Syriac",
    time: "fifth cent. C.E.",
    location: "Cambridge, England",
    wikipedia: "Curetonian_Gospels",
  },
  {
    symbol: "Sy<sup>h</sup>",
    description:
      "Philoxenian-Harclean Syriac Version, sixth and seventh cent. C.E.; G.S.",
    name: "Philoxenian-Harclean Syriac Version",
    time: "sixth and seventh cent. C.E.",
    gs: "G.S.",
    wikipedia: "Philoxenian_version",
  },
  {
    symbol: "Sy<sup>hi</sup>",
    description:
      "Jerusalem (Hierosolymitanum) Version, Old Syriac, sixth cent. C.E.; G.S.",
    name: "Jerusalem (Hierosolymitanum) Version",
    language: "Old Syriac",
    time: "sixth cent. C.E.",
    gs: "G.S.",
    wikipedia: "Peshitta",
  },
  {
    symbol: "Sy<sup>s</sup>",
    description: "Sinaitic Syriac codex, fourth and fifth cent. C.E., Gospels.",
    name: "Sinaitic Syriac codex",
    language: "Syriac",
    time: "fourth and fifth cent. C.E.",
    gs: "G.S.",
    wikipedia: "Syriac_Sinaiticus",
  },
  {
    symbol: "Sym",
    description: "Greek translation of H.S., by Symmachus, c. 200 C.E.",
    name: "Greek translation of H.S.",
    time: "c. 200 C.E.",
    hs: "H.S.",
  },
  {
    symbol: "T",
    description: "Targums, Aram. paraphrases of parts of H.S.",
    name: "Targums, Aram. paraphrases of parts of H.S.",
    language: "Aram.",
    hs: "H.S.",
    time: "fifth century C.E",
    wikipedia: "Targum",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Targum.jpg/275px-Targum.jpg",
  },
  {
    symbol: "T<sup>J</sup>",
    description:
      "Jerusalem Targum I (Pseudo-Jonathan) and Jerusalem Targum II (Fragmentary Targum).",
    name: "Jerusalem Targum I (Pseudo-Jonathan) and Jerusalem Targum II (Fragmentary Targum).",
  },
  {
    symbol: "T<sup>O</sup>",
    description: "Targum of Onkelos (Babylonian Targum), Pentateuch.",
    name: "Targum of Onkelos (Babylonian Targum)",
  },
  {
    symbol: "T<sup>P</sup>",
    description: "Palestinian Targum, Vatican City, Rome, Pentateuch.",
    name: "Palestinian Targum",
    location: "Vatican City, Rome",
  },
  {
    symbol: "TDOT",
    description:
      "<em>Theological Dictionary of the Old Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1974 and later ed.",
    name: "Theological Dictionary of the Old Testament (English ed.)",
  },
  {
    symbol: "TDNT",
    description:
      "<em>Theological Dictionary of the New Testament </em>(English ed.), Eerdmans Publishing Company, Grand Rapids, U.S.A., 1964 and later ed.",
    name: "Theological Dictionary of the New Testament (English ed.)",
  },
  {
    symbol: "Th",
    description: "Greek translation of H.S., by Theodotion, second cent. C.E.",
    name: "Greek translation of H.S.",
    time: "second cent. C.E.",
  },
  {
    symbol: "TR",
    description:
      "<em>Textus Receptus </em>(Received Text) of G.S., by R. Stephanus, 1550.",
    name: "Textus Receptus (Received Text) of G.S.",
  },
  {
    symbol: "Vg",
    description:
      "Latin <em>Vulgate, </em>by Jerome, c. 400 C.E. (<em>Iuxta Vulgatam Versionem, </em>Württembergische Bibelanstalt, Stuttgart, 1975).",
    name: "Latin Vulgate",
    language: "by Jerome",
    time: "c. 400 C.E.",
    wikipedia: "Vulgate",
    wol: "https://wol.jw.org/en/wol/d/r1/lp-e/2009251",
    image:
      "https://www.newberry.org/sites/default/files/styles/lightbox-overlay/public/acquisitions/Case-MS-216-%28Vault%29%2C-Bible.-Latin.-Vulgate%2C-13th-cen%2C-%232.JPG?itok=5yZZsi9e",
  },
  {
    symbol: "Vg<sup>c</sup>",
    description:
      "Latin <em>Vulgate, </em>Clementine recension (S. Bagster &amp; Sons, London, 1977).",
    name: "Latin Vulgate",
  },
  {
    symbol: "Vg<sup>s</sup>",
    description: "Latin <em>Vulgate, </em>Sixtine recension, 1590.",
    name: "Latin Vulgate, Sixtine recension",
    time: "1590.",
  },
  {
    symbol: "Vg<sup>ww</sup>",
    description:
      "<em>Novum Testamentum Latine secundum editionem Sancti Hieronymi ad Codicum Manuscriptorum Fidem, </em>by J. Wordsworth and H. J. White, Oxford, 1911.",
    name: "Novum Testamentum Latine secundum editionem Sancti Hieronymi ad Codicum Manuscriptorum Fidem",
  },
  {
    symbol: "VT",
    description:
      "<em>Vetus Testamentum, </em>E. J. Brill, Leiden, Netherlands.",
    name: "Vetus Testamentum",
  },
  {
    symbol: "W",
    description: "Freer Gospels, fifth cent. C.E., Washington, D.C.",
    name: "Freer Gospels",
    time: "fifth cent. C.E.",
    location: "Washington D.C.",
    wikipedia: "Codex_Washingtonianus",
  },
  {
    symbol: "WH",
    description:
      "<em>The New Testament in the Original Greek, </em>by Westcott and Hort, 1948 ed. (reprinted in Int).",
    name: "The New Testament in the Original Greek by Westcott and Hort",
    time: "1948",
    wikipedia: "Westcott-Hort",
  },
  {
    symbol: "Zorell<sup>Gr</sup>",
    description:
      "<em>Lexicon Graecum Novi Testamenti, </em>third ed., by F. Zorell, Paris, 1961.",
    name: "Lexicon Graecum Novi Testamenti",
  },
  {
    symbol: "Zorell<sup>Heb</sup>",
    description:
      "<em>Lexicon Hebraicum et Aramaicum Veteris Testamenti, </em>by F. Zorell, Rome, 1968.",
    name: "Lexicon Hebraicum et Aramaicum Veteris Testamenti",
  },
  {
    symbol: "<sup>*</sup>",
    description: "Reading of the original (first) hand of a Greek manuscript.",
    name: "Reading of the original (first) hand of a Greek manuscript.",
  },
  {
    symbol: "<sup>c</sup>",
    description: "Reading of any corrector of a Greek manuscript.",
    name: "Reading of any corrector of a Greek manuscript.",
  },
];
</script>

<style>
</style>