// mixins/playlistMixin.js
export default {
  methods: {
    async handlePlaylistFromQueryString() {
      if (this.$route.query.p) {
        let playlist;
        if (!isNaN(this.$route.query.p)) {
          const playlistId = Number(this.$route.query.p);
          playlist = await this.$store.dispatch("playlists/fetchPlaylist", {
            l2: this.$l2,
            id: playlistId,
          });
        } else if (this.$route.query.p === "recommended") {
          this.loadRecommendedVideosAsPlaylist();
        } else if (this.$route.query.p === "recommended_music") {
          this.loadRecommendedMusicVideosAsPlaylist();
        } else {
          let ids = this.$route.query.p.split(",").map((id) => Number(id));
          let videos = await this.$directus.getVideos({
            l2Id: this.$l2.id,
            query: `filter[id][in]=${ids.join(",")}`,
          });
          videos = videos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
          playlist = { l2: this.$l2.id, id: this.$route.query.p, title: "Playlist", videos };
        }
        if (playlist) this.playlist = playlist;
      }
    },
    loadRecommendedVideosAsPlaylist() {
      if (!this.recommendedVideosLoadedForL2) return;
      let playlist = {
        l2: this.$l2.id,
        id: "recommended",
        title: "Recommended Videos",
        videos: this.recommendedVideos[this.$l2.code],
      };
      this.playlist = playlist;
      if (this.itemIndex > this.items.length - 3) {
        this.$store.dispatch("shows/loadRecommendedVideos", {
          userId: this.$auth.user?.id,
          l2: this.$l2,
        });
      }
    },
    loadRecommendedMusicVideosAsPlaylist() {
      let playlist = {
        l2: this.$l2.id,
        id: "recommended_music",
        title: "Recommended Music Videos",
        videos: this.recommendedMusicVideos[this.$l2.code],
      };
      this.playlist = playlist;
    },
    onEnded(ended) {
      if (ended !== this.ended) {
        this.ended = ended;
        this.$emit("ended", this.ended);
        if (this.ended && this.episodes?.length) {
          if (this.itemIndex !== this.episodes.length - 1) {
            this.$bvModal.show("countdown-modal");
            this.nextVideoCountDownSeconds = 8;
            let interval = setInterval(() => {
              if (!this.ended) clearInterval(interval);
              this.nextVideoCountDownSeconds--;
              if (this.nextVideoCountDownSeconds === 0) {
                clearInterval(interval);
                this.$bvModal.hide("countdown-modal");
                this.goToNextItem();
              }
            }, 1000);
          }
        }
      }
    },
    stopNextEpisodeCountdown() {
      this.$bvModal.hide("countdown-modal");
      this.nextVideoCountDownSeconds = 8;
      this.ended = false;
    },
    goToPreviousItem() {
      if (this.previousItem)
        this.$router.push({
          name: "l1-l2-video-view-type",
          params: { type: "youtube", l1: this.$l1.code, l2: this.$l2.code },
          query: {
            v: this.previousItem.youtube_id,
            id: this.previousItem.id,
            lesson: this.previousItem.lesson,
            p: this.playlist?.id,
            sort: this.episodeSort,
          },
        });
    },
    goToNextItem() {
      if (this.nextItem)
        this.$router.push({
          name: "l1-l2-video-view-type",
          params: { type: "youtube", l1: this.$l1.code, l2: this.$l2.code },
          query: {
            v: this.nextItem.youtube_id,
            id: this.nextItem.id,
            lesson: this.nextItem.lesson,
            p: this.playlist?.id,
            sort: this.episodeSort,
          },
        });
    },
  },
};