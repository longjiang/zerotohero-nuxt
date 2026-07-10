// mixins/showEpisodesMixin.js
import { uniqueByValue, toCamelCase } from "../utils";

export default {
  methods: {
    loadShowAndEpisodes() {
      if (this.showsLoaded?.[this.$l2.code]) {
        if (!this.show) this.setShow();
      }
      this.unsubscribe = this.$store.subscribe((mutation, state) => {
        if (mutation.type === "shows/LOAD_SHOWS") {
          if (!this.show) this.setShow();
        }
      });
    },
    getShowTypeAndShow(video) {
      let foundShowType, foundShow;
      for (let showType of ["tv_show", "talk"]) {
        if (video[showType]) {
          foundShowType = showType;
          const camelCaseShowType = toCamelCase(showType);
          foundShow = this.$store.getters[`shows/${camelCaseShowType}`]({
            id: video[showType],
            l2: this.$l2,
          });
          if (foundShow) break;
        }
      }
      return { showType: foundShowType, show: foundShow };
    },
    setShow() {
      let { showType, show } = this.getShowTypeAndShow(this.video);
      if (show) {
        this.show = show;
        this.showType = showType;
        this.setEpisodesAndEpisodeCount();
      }
    },
    async setEpisodesAndEpisodeCount() {
      let limit = 100;
      let episodeCount = await this.getEpisodeCount();
      if (episodeCount)
        this.$store.dispatch("shows/setEpisodeCount", {
          l2: this.$l2,
          collection: this.collection,
          showId: this.show.id,
          episodeCount,
        });
      if (episodeCount > limit && this.$refs.youtube) this.largeEpisodeCount = episodeCount;
      this.episodes = await this.getEpisodes(episodeCount, limit);
    },
    async getEpisodes(episodeCount, limit) {
      let filters = {};
      if (episodeCount > limit) {
        if (this.episodeSort === "title") filters["filter[title][gt]"] = this.video.title;
        if (this.episodeSort === "-date") filters["filter[date][lt]"] = this.video.date;
        if (this.episodeSort === "-views") filters["filter[views][lt]"] = this.video.views;
        if (this.episodeSort === "difficulty") filters["filter[difficulty][gt]"] = this.video.difficulty;
      }
      let videos = await this.$store.dispatch("shows/getEpisodesFromServer", {
        l2: this.$l2,
        collection: this.collection,
        showId: this.show.id,
        filters,
        forceRefresh: this.$adminMode,
        limit,
        sort: this.episodeSort,
      });
      videos = [this.video, ...videos];
      videos = uniqueByValue(videos, "youtube_id");
      if (this.episodeSort === "title") {
        videos = videos.sort((a, b) =>
          a.title ? a.title.localeCompare(b.title, this.$l2.locales[0], { numeric: true }) : 0
        );
      } else if (this.episodeSort === "-date") {
        videos = videos.sort((a, b) => (b.date ? b.date.localeCompare(a.date) : 0));
      } else if (this.episodeSort === "-views") {
        videos = videos.sort((a, b) => b.views - a.views);
      }
      return videos;
    },
    async getEpisodeCount() {
      if (this.show.episodeCount) return this.show.episodeCount;
      let episodeCount = 0;
      if (this.stats && this.stats[this.$l2.code]) {
        episodeCount = this.stats[this.$l2.code][this.show.title.toLowerCase()] || 0;
      }
      if (episodeCount < 1) {
        try {
          episodeCount = await this.$directus.countShowEpisodes(
            this.showType,
            this.show.id,
            this.$l2.id,
            this.$adminMode
          );
        } catch (err) {
          console.error(err);
        }
      }
      return episodeCount;
    },
  },
};