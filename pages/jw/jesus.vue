<router>
  {
    path: '/:l1/:l2/jesus/:sectionId?/:eventId?',
    props: true
  }
</router>

<template>
<div class="container mx-auto mt-10">
    <div class="jesus-life-panels">
    <div class="jesus-life-panel-navigation" v-if="!sectionId || !eventId">
      <h1 class="text-3xl font-bold mb-10">Jesus’ Life on Earth</h1>
      <JesusLifeChart :key="`JesusLifeChart-${sectionsKey}`" v-if="sections" :sections="sections" />
    </div>
    <div class="jesus-life-panel-content" :key="`JesusLifeEvent-${sectionsKey}`" v-else>
      <!-- <JesusPaginator />-->
      <JesusLifeContentHeader />
      <JesusLifeEvent  v-if="sections && sections[sectionId].events" :event="sections[sectionId].events[eventId]" />
      <!-- <JesusPaginator />  -->
    </div>
  </div>
</div>
</template>

<script>
import Helper from "@/lib/Helper";
import Config from "@/lib/Config";
import EventsIterator from '@/lib/EventsIterator'
import $ from 'jquery'
import langData from "@/lib/languages/en-US";

export default {
  data() {
    return {
      sections: langData.jesus_life_sections,
      sectionsKey: 0
    };
  },
  props: ['sectionId', 'eventId'],

  computed: {
    $l1() {
      if (typeof this.$store.state.settings.l1 !== "undefined")
        return this.$store.state.settings.l1;
    },
    $l2() {
      if (typeof this.$store.state.settings.l2 !== "undefined")
        return this.$store.state.settings.l2;
    },
  },
  mounted() {
    this.loadSections();
  },
  methods: {
    async loadSections() {
      for (var i in this.sections) {
        await this.loadSection(i);
      }
      this.sectionsKey++
    },
    showEvent(sectionIndex, eventIndex) {
      window.location.hash = $.param({
        sectionId: sectionIndex,
        eventId: eventIndex,
      });
      this.sections[sectionIndex].events[eventIndex];
      jesusLifeSections.jesusLifeEvent.loadEvent(event);
      jesusLifeSections.navigator.navigateTo(".jesus-life-panel-content");
    },
    lookupBookName(bookNumber) {
      return langData.books[bookNumber - 1].name;
    },
    parseTojQueryWithouthLoadingAssets(html) {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(html, "text/html");
      var $html = $(htmlDoc);
      return $html;
    },
    // Add the table of events as in https://wol.jw.org/en/wol/d/r1/lp-e/1001070207
    async loadSection(i) {
      // Load the section page containing the table of events
      var jesusLifeSections = this;
      let html = await Helper.proxy(
        Config.wolBaseUrl + this.sections[i].url.replace(/^\//, "")
      );

      // Extract the table
      var $html = this.parseTojQueryWithouthLoadingAssets(html);
      var $table = $html.find("#article table");
      // Remove the scripture columns (last 4 columns)
      var events = [];
      $table.find("tbody > tr").each(function (index, tr) {
        var $tr = $(tr);
        var event = {};
        event.iterator = new EventsIterator(
          jesusLifeSections.sections,
          i,
          index
        );
        event.time = $tr.find("td:nth-last-child(7)").text();
        if (event.time == "") {
          var $trPrev = $tr.prev();
          while (event.time == "") {
            event.time = $trPrev.find("td:nth-last-child(7)").text();
            $trPrev = $trPrev.prev();
          }
        }
        event.place = $tr.find("td:nth-last-child(6)").text();
        if (event.place == "") {
          var $trPrev = $tr.prev();
          while (event.place == "") {
            event.place = $trPrev.find("td:nth-last-child(6)").text();
            $trPrev = $trPrev.prev();
          }
        }
        event.places = event.place.split("; ").map(function (place) {
          return {
            name: place,
            mapUrl:
              "http://bibleatlas.org/area/" +
              place.toLowerCase().trim().replace(/\s/g, "_") +
              ".jpg",
          };
        });
        event.title = $tr.find("td:nth-last-child(5)").text();
        event.references = [];
        var applyLastSeemChapter = function (refText) {
          var chapterNum = refText.replace(/^(\d+(:|：)).*/, "$1");
          if (chapterNum !== refText) {
            jesusLifeSections.lastSeenChapter = chapterNum;
            return refText.replace(/(,|，)$/, ""); // remove final comma
          } else {
            return jesusLifeSections.lastSeenChapter + refText;
          }
        };
        $tr.find("td:nth-last-child(4) a").each(function () {
          event.references.push({
            url: $(this).attr("href"),
            // applyLastSeemChapter() -> so that '1:1-2,5-7" would be split into John 1:1-2, 1:5-7"
            chapterAndVerseNumber: applyLastSeemChapter($(this).text()),
            bookName: jesusLifeSections.lookupBookName(40), // Matthew
          });
        });
        $tr.find("td:nth-last-child(3) a").each(function () {
          event.references.push({
            url: $(this).attr("href"),
            chapterAndVerseNumber: applyLastSeemChapter($(this).text()),
            bookName: jesusLifeSections.lookupBookName(41), // Mark
          });
        });
        $tr.find("td:nth-last-child(2) a").each(function () {
          event.references.push({
            url: $(this).attr("href"),
            chapterAndVerseNumber: applyLastSeemChapter($(this).text()),
            bookName: jesusLifeSections.lookupBookName(42), // Luke
          });
        });
        $tr.find("td:nth-last-child(1) a").each(function () {
          event.references.push({
            url: $(this).attr("href"),
            chapterAndVerseNumber: applyLastSeemChapter($(this).text()),
            bookName: jesusLifeSections.lookupBookName(43), // John
          });
        });
        events.push(event);
      });
      jesusLifeSections.sections[i].events = events;
    },},
};
</script>

<style>

</style>