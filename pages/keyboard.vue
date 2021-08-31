<router>
  {
    path: '/:l1/:l2/keyboard',
    meta: {
      title: 'Keyboard | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content: 'Type in the target language with this online keyboard.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main">
    <div class="container pt-5 pb-5">
      <div class="row">
        <div class="col-sm-12">
          <h3 class="mb-5">Klingon Keyboard</h3>
          <p>
            For beginner learners of
            <a href="https://en.wikipedia.org/wiki/Klingon_language">Klingon</a>
            , sometimes it's very difficult to type the
            <a href="https://en.wikipedia.org/wiki/Klingon_scripts">
              Klingon script
            </a>
            . For this reason, we created the
            <b>"Klingon Keyboard"</b>
            so you can type right here on this web page.
          </p>
          <div v-html="klingon" class="klingon mb-4 p-4 shadow rounded"></div>
          <textarea
            cols="30"
            rows="10"
            class="form-control mb-5"
            v-model="latin"
            placeholder="DaH mojaq-mey-vam DI-vuS-nIS-beʼ ʼeʼ vI-Har"
          ></textarea>
          <h5 class="mt-5">How to use</h5>
          <ol>
            <li>
              Just type in the above text input field, and Klingon letters will
              show up on top.
            </li>
            <li>
              If you see squares instead of Klingon letters, download the
              <a href="http://www.evertype.com/fonts/tlh/">pIqaD</a>
              font first.
            </li>
          </ol>
          <h5 class="mt-5">Some phrases to try out</h5>
          <p>Copy and paste these phrases and see the conversion.</p>
          <dl
            v-for="(phrase, index) in phrases"
            :key="`phrase-${index}`"
            class="pl-4"
          >
            <dt>
              {{ phrase.klingon }}
              <button class="btn btn-light p-1" @click="latin = phrase.klingon">
                Use
              </button>
            </dt>
            <dd>{{ phrase.english }}</dd>
          </dl>
          <ul class="list-unstyled"></ul>
          <p class="mt-4">
            The Klingon characters are displayed with private Unicode
            characters. To see them properly, download and install the
            <a href="http://www.evertype.com/fonts/tlh/">pIqaD</a>
            font.
          </p>
          <h5 class="mt-5 mb-5">Conversion Chart</h5>
          <table class="table">
            <thead>
              <tr>
                <th>Klingon</th>
                <th>latin</th>
                <th>IPA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(char, index) in conv" :key="`char-${index}`">
                <td class="klingon">{{ char.conscript }}</td>
                <td>{{ char.latin }}</td>
                <td>{{ char.ipa }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Klingon from "@/lib/klingon";
export default {
  data() {
    return {
      latin: "",
      phrases: [
        {
          klingon: "DaH mojaq-mey-vam DI-vuS-nIS-beʼ ʼeʼ vI-Har",
          english: "I believe that we do not need to limit these suffixes now.",
        },
        {
          klingon: "tlhIngan Hol Dajatlhʼaʼ?",
          english: "Do you speak Klingon?",
        },
        { klingon: "jIyajbeʼ.", english: "I don't understand." },
        {
          klingon: "Dochvetlh vISoplaHbeʼ.",
          english: "I can't eat that thing.",
        },
        { klingon: "bIlughbeʼ.", english: "You are wrong." },
        {
          klingon: "bortaS bIr jabluʼDIʼ reH QaQquʼ nayʼ.",
          english:
            "Revenge is a dish best served cold. (lit: When cold revenge is served, the dish is always very good)",
        },
        {
          klingon: "HeghluʼmeH QaQ jajvam.",
          english: "Today is a good day to die.",
        },
      ],
    };
  },
  computed: {
    klingon() {
      return Klingon.latinToConScript(this.latin);
    },
    conv() {
      return Klingon.conv;
    },
  },
};
</script>