<template>
  <div id="jesus-life-content-body" v-if="references">
    <div
      class="jesus-life-event-scripture-group"
      v-for="(reference, index) in references.filter(
        (r) => r.url !== undefined
      )"
      :key="`jesus-life-event-scripture-group-${index}`"
    >
      <h3 class="jesus-life-event-scripture-segment-caption">
        <a :href="reference.url">
          {{ reference.bookName }} {{ reference.chapterAndVerseNumber }}
        </a>
      </h3>
      <BibleMultiChapter :places="places" :htmlPath="reference.url" />
    </div>
  </div>
</template>

<script>
import Helper from '@/lib/helper'

export default {
  data() {
    return {
      references: null,
      json: undefined,
      places: [],
    };
  },
  props: ['event'],
  mounted() {
    this.loadEvent(this.event)
    // this.loadChapterSegment(index, reference.url);
  },
  methods: {
    loadEvent(event) {
      // Split the title into title and subtitles,
      // Show them in a list
      // Get the event title
      this.event.progress =
        (event.iterator.index() / event.iterator.length()) * 100;
      this.event.names = [];
      var eventsNames = event.title.split("; ");
      for (var eventName of eventsNames) {
        eventName = Helper.ucFirst(eventName);
        this.event.names.push(eventName);
      }
      this.references = event.references;
      this.places = event.places.map((place) => place.name);
    },

    segmentId: function (index) {
      return "jesus-life-event-scripture-segment-" + index;
    },
  },
};
</script>

<style>
.jesus-life-event-scripture-segment-caption {
  text-align: center;
  margin: 2rem 0;
  font-size: 1.7em;
}
.jesus-life-content-body {
  margin-bottom: 2rem;
}

.jesus-life-content-body .mediaTitle.wide {
  display: none;
}

.jesus-life-content-body .media-item .relatedScriptures {
  display: none;
}

.jesus-life-content-progress {
  width: 100%;
}
</style>