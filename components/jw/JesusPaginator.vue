<template>
  <div id="jesus-life-content-nav-top" class="chapter-navigation">
    <button
      class="jesus-life-back-to-navigation btn-plain"
      @click="showContents"
    >
      <i class="octicon octicon-chevron-left"></i>
      &nbsp;
      Back
    </button>
    <div>
      <button
        class="jesus-life-previous-event-btn btn-plain"
        @click="previousEvent"
      >
        <i class="octicon octicon-chevron-left"></i>
      </button>
      &nbsp;
      <button class="jesus-life-next-event-btn btn-plain" @click="nextEvent">
        <i class="octicon octicon-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import EventsIterator from '@/lib/EventsIterator'

export default {
  methods: {
    previousEvent() {
      var jesusLifeSections = this;
      var hash = helper.parseHash();
      var iterator = new EventsIterator(
        jesusLifeSections.sections,
        hash.sectionId,
        hash.eventId
      );
      var previous = iterator.previous();
      jesusLifeSections.jesusLifeEvent.loadEvent(previous.event);
      window.location.hash = $.param(previous.hash);
      window.scrollTo(0, 0);
    },
    nextEvent() {
      var jesusLifeSections = this;
      var hash = helper.parseHash();
      var iterator = new EventsIterator(
        jesusLifeSections.sections,
        hash.sectionId,
        hash.eventId
      );
      var next = iterator.next();
      jesusLifeSections.jesusLifeEvent.loadEvent(next.event);
      window.location.hash = $.param(next.hash);
      window.scrollTo(0, 0);
    },
    showContents() {
      this.navigator.navigateTo(".jesus-life-panel-navigation");
      window.scrollTo(0, 0);
    },
  },
};
</script>

<style>
.btn-plain {
    background: none;
    color: #3b99fc;
    font-size: 1em !important;
    padding: 0.25rem 1rem;
    border-radius: 0.3rem;
    background-color: #fafafa;
}

button.btn-plain:hover, button.btn-plain:focused, button.btn-plain:active {
    background-color: none !important;
    color: #87c1ff;
}

.btn-plain i {
    font-size: 1.2em;
}

.chapter-navigation {
    width: 100%;
    margin-bottom: 1rem;
}

.chapter-navigation div {
    float: right;
}

.chapter-navigation button {
    font-size: 0.8em;
    margin: 0.1rem;
    /* background-color: #fafafa; */
    /* padding: 0.25rem 1rem; */
}
</style>