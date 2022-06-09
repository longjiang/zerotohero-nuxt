<template>
  <div class="bible-chapter-timeline-container">
    <div :id="`bible-chapter-map-${id}`" class="bible-chapter-timeline">
      <Timeline @onRendered="onTimelineRendered" />
    </div>
  </div>
</template>

<script>
export default {
  props: ["id", "chapter"],
  methods: {
    onTimelineRendered() {
      var chapter = this.chapter;
      var names = chapter.topics;
      var filteredNames = [];
      for (var name of names) {
        var bannedTerms = [
          "Ar",
          "Arar",
          "Sin",
          "Name",
          "Book",
          "On",
          "Age",
          "Sign",
          "Day",
          "Demon",
          "Brother",
          "I",
          "II",
          "III",
          "Field",
          "Rope",
          "Cord",
          "Rod",
          "Ab",
        ];
        if (name.length > 3 && bannedTerms.indexOf(name) === -1) {
          // Filter out common terms
          filteredNames.push(name);
        }
      }
      // geographic names and topics both provide clues
      var matchedEvents = timeline.searchEventsMultiple(filteredNames);
      if (matchedEvents.length > 0) {
        timeline.filter(matchedEvents);
        $(timeline.element)
          .find(".timeline-event-placeholder")
          .addClass("hidden");
        $(timeline.element)
          .find(".jw-study-aid-timeline-mode-switch-reading")
          .click();
      }
    },
  },
};
</script>

<style>
</style>