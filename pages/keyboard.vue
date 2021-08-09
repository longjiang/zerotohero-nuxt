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
  <div class="bookmarklet-view main">
    <div class="container mt-5 mb-5">
      <div class="row">
        <div class="col-sm-12">
          <h1 class="mb-5">Klingon Keyboard</h1>
          <p>
            For beginner learners of
            <a href="https://en.wikipedia.org/wiki/Klingon_language">Klingon</a>, sometimes it's very difficult to type the
            <a
              href="https://en.wikipedia.org/wiki/Klingon_scripts"
            >Klingon script</a>. For this reason, we created the
            <b>"Klingon Keyboard"</b> so you can type right here on this web
            page.
          </p>
          <div v-html="klingon" class="klingon mb-4 p-4 shadow rounded"></div>
          <textarea
            cols="30"
            rows="10"
            class="form-control mb-5"
            v-model="roman"
            placeholder="DaH mojaq-mey-vam DI-vuS-nIS-beʼ ʼeʼ vI-Har"
          ></textarea>
          <h5 class="mt-5">How to use</h5>
          <ol>
            <li>
              Just type in the above text input field, and Klingon letters
              will show up on top.
            </li>
            <li>
              If you see squares instead of Klingon letters, download the
              <a
                href="http://www.evertype.com/fonts/tlh/"
              >pIqaD</a> font
              first.
            </li>
          </ol>
          <h5 class="mt-5">Some phrases to try out</h5>
          <p>Copy and paste these phrases and see the conversion.</p>
          <dl v-for="phrase in phrases" class="pl-4">
            <dt>
              {{ phrase.klingon }}
              <button
                class="btn btn-light p-1"
                @click="roman = phrase.klingon"
              >Use</button>
            </dt>
            <dd>{{ phrase.english }}</dd>
          </dl>
          <ul class="list-unstyled"></ul>
          <p class="mt-4">
            The Klingon characters are displayed with private Unicode
            characters. To see them properly, download and install the
            <a
              href="http://www.evertype.com/fonts/tlh/"
            >pIqaD</a> font.
          </p>
          <h5 class="mt-5 mb-5">Conversion Chart</h5>
          <table class="table">
            <thead>
              <tr>
                <th>Klingon</th>
                <th>Roman</th>
                <th>IPA</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="char in conv">
                <td class="klingon">{{ char.klingon }}</td>
                <td>{{ char.roman }}</td>
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
export default {
  data() {
    return {
      roman: '',
      conv: [
        {
          roman: 'a',
          klingon: '',
          ipa: 'ɑ'
        },
        {
          roman: 'b',
          klingon: '',
          ipa: 'b'
        },
        {
          roman: 'ch',
          klingon: '',
          ipa: 't͡ʃ'
        },
        {
          roman: 'D',
          klingon: '',
          ipa: 'ɖ'
        },
        {
          roman: 'e',
          klingon: '',
          ipa: 'ɛ'
        },
        {
          roman: 'gh',
          klingon: '',
          ipa: 'ɣ'
        },
        {
          roman: 'H',
          klingon: '',
          ipa: 'x'
        },
        {
          roman: 'I',
          klingon: '',
          ipa: 'ɪ'
        },
        {
          roman: 'j',
          klingon: '',
          ipa: 'd͡ʒ'
        },
        {
          roman: 'l',
          klingon: '',
          ipa: 'l'
        },
        {
          roman: 'm',
          klingon: '',
          ipa: 'm'
        },
        {
          roman: 'n',
          klingon: '',
          ipa: 'n'
        },
        {
          roman: 'ng',
          klingon: '',
          ipa: 'ŋ'
        },
        {
          roman: 'o',
          klingon: '',
          ipa: 'o'
        },
        {
          roman: 'p',
          klingon: '',
          ipa: 'pʰ'
        },
        {
          roman: 'q',
          klingon: '',
          ipa: 'qʰ'
        },
        {
          roman: 'Q',
          klingon: '',
          ipa: 'q͡χ'
        },
        {
          roman: 'r',
          klingon: '',
          ipa: 'r'
        },
        {
          roman: 'S',
          klingon: '',
          ipa: 'ʂ'
        },
        {
          roman: 't',
          klingon: '',
          ipa: 'tʰ'
        },
        {
          roman: 'tlh',
          klingon: '',
          ipa: 't͡ɬ'
        },
        {
          roman: 'u',
          klingon: '',
          ipa: 'u'
        },
        {
          roman: 'v',
          klingon: '',
          ipa: 'v'
        },
        {
          roman: 'w',
          klingon: '',
          ipa: 'w'
        },
        {
          roman: 'y',
          klingon: '',
          ipa: 'j'
        },
        {
          roman: 'ʼ',
          klingon: '',
          ipa: 'ʔ'
        },
        {
          roman: 0,
          klingon: '',
          ipa: ''
        },
        {
          roman: 1,
          klingon: '',
          ipa: ''
        },
        {
          roman: 2,
          klingon: '',
          ipa: ''
        },
        {
          roman: 3,
          klingon: '',
          ipa: ''
        },
        {
          roman: 4,
          klingon: '',
          ipa: ''
        },
        {
          roman: 5,
          klingon: '',
          ipa: ''
        },
        {
          roman: 6,
          klingon: '',
          ipa: ''
        },
        {
          roman: 7,
          klingon: '',
          ipa: ''
        },
        {
          roman: 8,
          klingon: '',
          ipa: ''
        },
        {
          roman: 9,
          klingon: '',
          ipa: ''
        }
      ],
      phrases: [
        {
          klingon: 'DaH mojaq-mey-vam DI-vuS-nIS-beʼ ʼeʼ vI-Har',
          english: 'I believe that we do not need to limit these suffixes now.'
        },
        {
          klingon: 'tlhIngan Hol Dajatlhʼaʼ?',
          english: 'Do you speak Klingon?'
        },
        { klingon: 'jIyajbeʼ.', english: "I don't understand." },
        {
          klingon: 'Dochvetlh vISoplaHbeʼ.',
          english: "I can't eat that thing."
        },
        { klingon: 'bIlughbeʼ.', english: 'You are wrong.' },
        {
          klingon: 'bortaS bIr jabluʼDIʼ reH QaQquʼ nayʼ.',
          english:
            'Revenge is a dish best served cold. (lit: When cold revenge is served, the dish is always very good)'
        },
        {
          klingon: 'HeghluʼmeH QaQ jajvam.',
          english: 'Today is a good day to die.'
        }
      ]
    }
  },
  created() {
    this.conv = this.conv.sort((a, b) => b.roman.length - a.roman.length)
  },
  computed: {
    klingon() {
      let klingon = this.roman
      for (let char of this.conv) {
        klingon = klingon.replace(new RegExp(char.roman, 'g'), char.klingon)
      }
      klingon = klingon.replace(/[,;:]/g, '')
      klingon = klingon.replace(/[!?.]/g, '')
      klingon = klingon.replace(/[‘’'“”"]/g, '')
      klingon = klingon.replace(/[-]/g, '')
      return klingon
    }
  }
}
</script>