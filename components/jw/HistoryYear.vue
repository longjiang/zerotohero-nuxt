<template>
  <div id="jw-study-aid-timeline-year" >
    <div>
      <router-link :to="{name: 'jw-timeline', hash: `#year=${yyyy}`}">Back to Timeline Overview</router-link>
    </div>
    <h3 class="timeline-event-title">{{ title }}</h3>
    <ul class="timeline-events" v-if="events && events.length > 0">
      <li
        class="timeline-event"
        v-for="(event, index) in events"
        :data-event-index="index"
        :data-source="event.source"
        :key="`timeline-event-${index}`"
      >
        <div class="timeline-event-description">
          <span class="timeline-event-year">{{ event.time.yearString }}</span>
          <span class="timeline-event-title" v-html="event.title"></span>
        </div>
        <!-- <figure v-if="event.article">
          <img class="timeline-event-thumb" v-bind:src="event.article.thumbUrl" />
          <figcaption>{{ event.article.title }} (Pageviews: {{ event.article.pageViews }})</figcaption>
        </figure> -->
      </li>
    </ul>
  </div>
</template>

<script>
import WatchtowerIndexEventSource from "@/lib/jw/WatchtowerIndexEventSource";
import Helper from "@/lib/Helper";
import $ from "jquery";

export default {
  data() {
    return {
      eventSources: [
        new WatchtowerIndexEventSource(),
        // new WikipediaEventSource()
      ],
      events: [],
      loading: false,
      numUpdates: 0,
    };
  },
  props: {
    yyyy: {
      default: 1,
    },
  },
  computed: {
    title() {
      return Helper.getYearTitle(this.yyyy); // like 2000 B.C.E.
    },
  },
  async mounted() {
    this.loading = true;
    this.events = await this.getEventsFromSourcesByYear(this.eventSources, this.yyyy);
    this.loading = false;
  },
  updated() {
    this.wikipediaArticleSnippets = 0;
    $(
      "#jw-study-aid-timeline-year .event-item-publications, #jw-study-aid-timeline-year .event-item-scriptures"
    ).remove();
    $("#jw-study-aid-timeline-year .timeline-event").each((node) => {
      var index = $(node).attr("data-event-index");
      var event = this.events[index];
      if ($(node).attr("data-source") === "watchtower") {
        Timeline.processPublicationRef(this, event);
      } else if ($(node).attr("data-source") === "wikipedia") {
        if (this.wikipediaArticleSnippets < 1000) {
          this.processWikipediaArticle(this, event);
        }
        this.wikipediaArticleSnippets++;
      }
    });
  },
  methods: {
    async getEventsFromSourcesByYear(eventSources, yyyy) {
      let events = []
      for (let source of eventSources) {
        events = events.concat(await source.getEventsByYear(yyyy));
      }
      return events
    },

    processWikipediaArticle(eventItem, event) {
      if (event.article) {
        var history = this;
        var wikipedia = new Wikipedia();

        var $ul = $('<ul class="event-item-publications" />');
        $(eventItem).append($ul);

        wikipedia.getHtmlContentByTitle(event.article.slug, function (html) {
          var $html = $("<div />").html(html);
          var $redirect = $html.find(".redirectText a");
          if ($redirect.length > 0) {
            var slug = $redirect.attr("href").replace("/wiki/", "");
            wikipedia.getHtmlContentByTitle(slug, function (html) {
              var articleSnippet = history.createWikipediaSnippet(html, event);
              $ul.append(articleSnippet.element);
            });
          } else {
            var articleSnippet = history.createWikipediaSnippet(html, event);
            $ul.append(articleSnippet.element);
          }
        });
      }
    },

    createWikipediaSnippet(html, event) {
      let articleSnippet = new ArticleSnippet();
      var $html = $("<div />").html(html);
      var summary = $html.find("p").first().get();
      // $summary = $html.find('h2').prevUntil(':not(p)').get().reverse()
      // var summaryFollow = $(summary).nextUntil(':not(p)').get()
      var image;
      $html.find("img").each(function () {
        if ($(this).attr("alt") === "") {
          return true; // skip to the next one
        }
        if (Number($(this).attr("width")) < 100) {
          return true;
        }
        image = this;
        return false; // break
      });
      articleSnippet.load_html("");
      if (image) {
        $(articleSnippet.content_element).append(image);
      }
      $(articleSnippet.content_element).append(summary);
      var title = event.article.slug.replace(/_/g, " ");
      var url = event.article.url;
      articleSnippet.add_reference_link(title, url);
      articleSnippet.set_thumbnail(
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/220px-Wikipedia-logo-v2.svg.png"
      );
      // articleSnippet.add_audio_player(langData.jwLangSymbol)
      return articleSnippet;
    },
  },
};
</script>

<style>
</style>