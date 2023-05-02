<template>
  <div class="instagram-content-wrapper">
    <div class="instagram-content-aspect">
      <div class="instagram-content">
        <div class="instagram-border"></div>
        <div
          v-if="entry.hsk && entry.hsk !== 'outside'"
          :style="
            `background-image: url(${imageUrl}${entry.hskId}-${
              entry.simplified
            }.jpg)`
          "
          class="instagram-image"
        />
        <div
          v-if="
            (!entry.hsk || entry.hsk === 'outside') && entry.images && entry.images.length > 0
          "
          :style="`background-image: url(${imageProxy}?${entry.images[0].src})`"
          class="instagram-image"
        />
        <img src="/img/instagram-badge.png" class="instagram-badge" />
        <div class="instagram-logo-wrapper">
          <LanguageLogo class="instagram-logo" :l1="$l1" :l2="$l2" />
        </div>
        <EntryHeader :entry="entry" />
        <DefinitionsList
          v-if="entry.definitions"
          :definitions="entry.definitions"
        ></DefinitionsList>
        <div
          class="example-wrapper pt-4 pb-4"
          v-if="entry.example && entry.example.length > 0"
        >
          <div class="example-sentence mt-4">
            <p
              class="example-sentence-word"
              v-html="
                highlight(entry.example, entry.simplified, entry.hsk)
              "
            ></p>
            <hr />
            <p class="example-sentence-english">
              {{ entry.exampleTranslation }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { imageUrl, imageProxy, highlight } from '@/lib/utils'

export default {
  props: {
    entry: {
      type: Object
    }
  },
  data() {
    return {
      imageUrl,
      imageProxy
    }
  },
  methods: {
    highlight(...args) {
      return highlight(...args)
    },
  }
}
</script>

<style>

.instagram-content-wrapper {
  width: 720px;
}

.instagram-content-aspect,
.instagram-canvas-aspect {
  width: 100%;
  padding-top: 100%;
  position: relative;
}

.instagram-content .label {
  font-size: 1.5em;
}

.instagram-content {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.instagram-content {
  background: black;
  color: white;
}

.instagram-content .paginate-button {
  display: none;
}

.instagram-content .focus-exclude {
  display: none;
}

.instagram-image {
  position: absolute;
  opacity: 0.4;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.instagram-badge {
  position: absolute;
  width: 50%;
  left: 25%;
}

.instagram-logo-wrapper {
  position: absolute;
  top: 7%;
  width: 100%;
}

.instagram-logo {
  margin: 0 auto;
  transform: scale(1.5);
}

.instagram-content .word [data-level] {
  color: white !important;
  font-size: 2em;
}

.instagram-content .pinyin {
  font-size: 2em;
}

.instagram-content .definitions {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instagram-content .definitions li {
  display: inline;
}

.instagram-content .definitions li:not(:last-child)::after {
  content: ', ';
}

.instagram-content .definitions .english {
  font-size: 2em;
  font-weight: 200;
}

.instagram-content .entry-head-wrapper {
  position: absolute;
  width: 90%;
  top: 30%;
  left: 5%;
  transform: scale(1.5);
}

.instagram-content .definitions-list {
  position: absolute;
  width: 90%;
  top: 55%;
  left: 5%;
  transform: scale(1.5);
}

.instagram-content .instagram-border {
  position: absolute;
  border: 2px solid white;
  width: 96%;
  height: 96%;
  left: 2%;
  top: 2%;
}

.instagram-content .example-wrapper {
  position: absolute;
  width: 90%;
  left: 5%;
  top: 65%;
  text-align: center;
}

.instagram-content .example-sentence-word {
  font-size: 2em;
  font-weight: 200;
}

.instagram-content .example-sentence hr {
  border: 1px solid rgba(255, 255, 255, 0.5);
  width: 40%;
}

.instagram-content .example-sentence-english {
  font-size: 1.5em;
  font-weight: 200;
}

.instagram-content .example-sentence-word span[data-level] {
  font-weight: bold;
  color: white !important;
}
</style>
