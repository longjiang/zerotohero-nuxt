// mixins/historyMixin.js
import DateHelper from "../date-helper";

export default {
  methods: {
    onUpdateLayout(layout) {
      this.$emit("updateLayout", layout);
    },
    onCurrentTime(currentTime) {
      if (this.currentTime !== currentTime) {
        this.currentTime = currentTime;
        if (this.currentTime > 0 && !this.savedToHistory) {
          this.saveHistory();
          this.savedToHistory = true;
        }
        this.updateCurrentTimeQueryString();
        this.$emit("currentTime", this.currentTime);
      }
    },
    updateCurrentTimeQueryString() {
      if (this.size === "mini") return;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const params = new URLSearchParams(url.search);
        const queryStringTime = params.get("t") ? Number(params.get("t")) : 0;
        if (this.currentTimeEvery10Seconds !== queryStringTime) {
          params.set("t", this.currentTimeEvery10Seconds);
          const newUrl = `${url.origin}${url.pathname}?${params.toString()}`;
          window.history.replaceState("", "", newUrl);
          if (this.currentTimeEvery10Seconds % 60 === 0) {
            this.saveHistory();
          }
        }
      }
    },
    async saveHistory() {
      if (this.size === "mini") return;
      if (this.video?.youtube_id) {
        let data = {
          date: DateHelper.unparseDate(new Date()),
          l2: Number(this.$l2.id),
          video_id: Number(this.video.id),
          last_position: this.currentTimeEvery10Seconds,
          video: this.video,
        };
        await this.$store.dispatch("watchHistory/addOrUpdate", data);
      }
    },
  },
};