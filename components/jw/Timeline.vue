<template>
  <div>
    <nav class="jw-study-aid-timeline-mode-switch jw-nav-tabs">
      <a
        :class="[
          'jw-study-aid-timeline-mode-switch-scaled nav-tab',
          { active: mode === 'scaled' },
        ]"
        @click="scaledModeClick"
      >
        Scaled View
      </a>
      <a
        :class="[
          'jw-study-aid-timeline-mode-switch-scaled nav-tab',
          { active: mode === 'reading' },
        ]"
        @click="readingModeClick"
      >
        Reading View
      </a>
    </nav>
    <div class="jw-study-aid-search-controls">
      <input
        type="text"
        class="jw-study-aid-search-controls-field"
        value=""
        placeholder=""
        v-model="search"
      />
      <button class="jw-study-aid-search-controls-button">Filter</button>
    </div>
    <div id="vue">
      <ul :class="`timeline-events ${mode}`">
        <li
          v-for="(event, index) in filteredEvents"
          :key="`event-${index}`"
          :class="{ 'timeline-event': true }"
          :data-event-index="index"
          :data-year="event.time.year"
          :data-delta="getDelta(index)"
        >
          <span class="timeline-event-title">
            <span class="timeline-event-time">
              <a :href="'/history#year=' + event.time.year">
                {{ event.time.yearString }}
              </a>
            </span>
            <span class="timeline-event-description">{{ event.title }}</span>
          </span>
        </li>
        <!-- .timeline-event -->
      </ul>
    </div>
    <!-- #timeline-search -->
  </div>
</template>

<script>
import WatchtowerIndexEventSource from "@/lib/jw/WatchtowerIndexEventSource";
import Wol from "@/lib/jw/Wol";
import $ from "jquery";

export default {
  data() {
    return {
      events: [],
      eventSources: [
        // new WikipediaEventSource(),
        new WatchtowerIndexEventSource(),
      ],
      filteredEvents: [],
      seenScanUrls: [],
      search: "",
      minDelta: undefined,
      mode: "scaled",
    };
  },
  watch: {
    search() {
      this.filteredEvents = this.searchEvents(this.search);
    },
  },

  async mounted() {
    let events = [];
    for (var eventSource of this.eventSources) {
      events = events.concat(await eventSource.getEvents());
    }
    this.events = events;
    this.filteredEvents = events;
    this.$emit("sourceInit");
  },
  methods: {
    filtered(event) {
      return this.filteredEvents.find(
        (filteredEvent) => filteredEvent === event
      );
    },

    readingModeClick() {
      this.renderLinear();
    },

    scaledModeClick() {
      this.renderScaled();
    },

    getDelta(index) {
      if (this.events.length > index + 1) {
        var delta =
          this.events[index + 1].time.year - this.events[index].time.year;
        if (this.minDelta === undefined || delta < this.minDelta) {
          this.minDelta = delta;
        }
        return delta;
      } else {
        return 1;
      }
    },

    searchEvents(string) {
      if (!string || string.trim() === "") {
        return this.events;
      } else {
        var matchedEvents = [];
        for (var eventSource of this.eventSources) {
          matchedEvents = matchedEvents.concat(eventSource.search(string));
        }
        return matchedEvents;
      }
    },

    searchEventsMultiple(strings) {
      var matchedEvents = [];
      for (var eventSource of this.eventSources) {
        matchedEvents = $.merge(
          matchedEvents,
          eventSource.searchMultiple(strings)
        );
      }
      return matchedEvents;
    },

    getGroups() {
      var groups = [];
      var group = [];
      var lastSeenYear;
      $(this.element)
        .find(".timeline-event")
        .each(function () {
          var thisYear = Number($(this).attr("data-year"));
          // put years into groups
          if (thisYear === lastSeenYear) {
            // add to group
            group.push(this);
          } else {
            // start new group
            lastSeenYear = thisYear;
            groups.push(group);
            group = [this];
          }
        });
      return groups;
    },

    renderLinear() {
      $(this.element).find(".timeline-events").css("height", "initial");
      $(this.element)
        .find(".timeline-event")
        .appendTo($(this.element).find(".timeline-events"));
      $(this.element).find(".timeline-event-group").remove();
      $(this.element).find(".timeline-event-group-expand").remove();
    },

    renderScaled() {
      var timeline = this;
      var groups = this.getGroups();
      // Clear and replace with structured
      $(timeline.element)
        .find(".timeline-event, .timeline-event-group")
        .remove();
      // Creating group divs
      for (let i in groups) {
        var group = groups[i];
        var $groupDiv = $('<ul class="timeline-event-group collapsed" />');
        if (groups[Number(i) + 1] !== undefined) {
          var thisYear = $(groups[i][0]).attr("data-year");
          var nextYear = $(groups[Number(i) + 1][0]).attr("data-year");
          var delta = nextYear - thisYear;
          $groupDiv.attr("data-delta", delta);
        }
        for (var event of group) {
          $groupDiv.append(event);
        }
        $(timeline.element).find(".timeline-events").append($groupDiv);
      }
      // Set height and add expand button
      $(timeline.element)
        .find(".timeline-event-group")
        .each(function () {
          var $firstEvent = $(this).find(".timeline-event").first();
          var year = Number($firstEvent.attr("data-year"));
          var $followingEvents = $(this).find(
            ".timeline-event:not(:first-child)"
          );
          var delta = Number($(this).attr("data-delta"));
          // $(this).css('min-height', delta * scale + 'rem')
          for (var i = 0; i < delta - 1; i++) {
            // Add placeholder events
            i = Number(i);
            $(this).append(
              '<li class="timeline-event-placeholder"><span class="timeline-event-time"><a href="/history/#year=' +
                (year + i + 1) +
                '">' +
                Year.getYearTitle(year + i + 1) +
                "</a></span></li>"
            );
          }
          if ($followingEvents.length > 1) {
            $(this).append(
              '<a class="timeline-event-group-expand"><i title="expand" class="octicon octicon-plus"></i></a>'
            );
          }
        });

      $(timeline.element)
        .find(".timeline-event-group-expand")
        .click(function () {
          var $group = $(this).parents(".timeline-event-group");
          $group.toggleClass("collapsed");
          $group.find(".timeline-event").each(function () {
            var eventItem = this;
            timeline.findEventAndProcessPubs(eventItem);
          });
        });

      $(timeline.element)
        .find(".timeline-event-description")
        .click(function () {
          var $group = $(this).parents(".timeline-event-group");
          $group.toggleClass("collapsed");
          var eventItem = $(this).parents(".timeline-event")[0];
          timeline.findEventAndProcessPubs(eventItem);
        });

      this.$emit("onRendered");
    },

    findEventAndProcessPubs(eventItem) {
      var index = $(eventItem).attr("data-event-index");
      var event = this.searchVue.events[index];
      if ($(eventItem).find(".event-item-publications").length === 0) {
        this.constructor.processPublicationRef(eventItem, event);
      }
    },

    findClosestYearWithEvent(yyyy) {
      var difference;
      var matchedEvent;
      for (var event of this.searchVue.events) {
        if (difference === undefined) {
          difference = Math.abs(yyyy - event.time.year);
          matchedEvent = event;
        } else {
          var newDifference = Math.abs(yyyy - event.time.year);
          if (newDifference < difference) {
            difference = newDifference;
            matchedEvent = event;
          }
        }
      }
      return matchedEvent.time.year;
    },

    processPublicationRef(eventItem, event) {
      var wol = new Wol();

      var $ul = $('<ul class="event-item-publications" />');
      $(eventItem).append($ul);

      for (var ref of event.pubRefs) {
        let articleSnippet = new ArticleSnippet();
        let articleUrl = ref.url;

        wol.getArticleJsonThen(
          wol.htmlUrlToJsonUrl(articleUrl),
          function (json) {
            articleSnippet.load_json(json);
            // Add an image on top of the snippet if there is none
            if ($(json.items[0].content).find("img").length === 0) {
              // wol.getArticleHtmlThen(articleUrl, function (html) {
              //   var $images = $(html).find('img')
              //   if ($images.length > 0) {
              //     articleSnippet.addImageOnTop($images[0])
              //   }
              // })
            }
            articleSnippet.add_reference_link(
              json.items[0].preReference,
              articleUrl
            );
            // articleSnippet.add_audio_player(langData.jwLangSymbol)
            $($ul).append(articleSnippet.element);
            articleSnippet.activateSwipeToRemove();
          }
        );
        // break; // Only 1 for now
      }

      let lastSeenRef;
      for (let niPubRef of event.niPubRefs) {
        let ref = BibleChapter.parsePubRef(niPubRef.title, lastSeenRef);
        lastSeenRef = ref;
        BibleChapter.createNiArticleSnipppet(ref, function (niArticleSnippet) {
          $($ul).append(niArticleSnippet.element);
          niArticleSnippet.activateSwipeToRemove();
        });
      }

      var $scriptureUl = $('<ul class="event-item-scriptures" />');
      $(eventItem).append($scriptureUl);

      for (var scriptureRef of event.scriptureRefs) {
        var scriptureSnippet = new ArticleSnippet();
        var scriptureUrl = scriptureRef.url;

        wol.getArticleJsonThen(
          wol.htmlUrlToJsonUrl(scriptureUrl),
          function (json) {
            // Loop through returned items
            scriptureSnippet.load_json(json);
            scriptureSnippet.processFootnotes();
            $($scriptureUl).append(scriptureSnippet.element);
          }
        );
        // break; // Only 1 for now
      }
    },
  },
};
</script>

<style>

.jw-nav-tabs {
    display: flex;
    width: 100%;
    margin-bottom: 1rem;
    border-radius: 4px;
    border: 1px solid black
}

.jw-nav-tabs .nav-tab {
    display: block;
    border-right: 1px solid black;
    padding: 0.5rem 1.5rem;
    box-shadow: none;
    text-align: center;
    flex: 1;
    cursor: pointer;
}

.jw-nav-tabs .nav-tab:hover {
    box-shadow: none;
}

.jw-nav-tabs .nav-tab:last-child {
    border-right: none;
}

.jw-nav-tabs .nav-tab.active {
    background: black;
    color: white;
}

.timeline-event-time {
  font-weight: bold;
}

.timeline-event-description {
  cursor: pointer;
}

.timeline-event-time a {
  box-shadow: none !important;
  color: #56301e;
}

.timeline-event-time a:hover {
  box-shadow: none !important;
}
</style>