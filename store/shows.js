import { CATEGORIES } from "@/lib/youtube";
import { LANGS_WITH_CONTENT, uniqueByValue, unique } from "@/lib/utils";
import Vue from "vue";

export const state = () => {
  return {
    tvShows: {},
    talks: {},
    recommendedVideos: {},
    stats: {},
    showsLoaded: {},
    categories: {},
  };
};

export const categories = (l2, tvShows, talks) => {
  if (!l2 || !LANGS_WITH_CONTENT.includes(l2.code)) return {};
  tvShows = tvShows[l2.code] || [];
  talks = talks[l2.code] || [];
  let shows = [...tvShows, ...talks];
  shows = shows.filter((s) => !["News", "Music", "Movies"].includes(s.title));
  let categories = {};
  let ids = shows.map((show) => show.category).filter((c) => c);
  for (let id in CATEGORIES) {
    if (ids.includes(Number(id))) categories[id] = CATEGORIES[id];
  }
  return categories;
};

export const determineSortType = ({ type = "talk", show }) => {
  let sort = type === "talk" && !show.audiobook ? "-views" : "title";
  if (show.title === "News") sort = "-date";
  if (show.title === "Music") sort = "-views";
  if (show.title === "Movies") sort = "-views";
  return sort;
};

// services/dataService.js

export const fetchShows = async ($directus, type, l2, forceRefresh, limit) => {
  try {
    const response = await $directus.get(
      `items/${type}?filter[l2][eq]=${l2.id}${forceRefresh ? "" : "&filter[hidden][empty]=true"}&limit=${limit}&timestamp=${forceRefresh ? Date.now() : 0}`
    );
    
    if (response.data.data) {
      const shows = response.data.data;
      shows.forEach((show) => (show.tags = unique((show.tags || "").split(","))));
      shows.sort((x, y) => x.title?.localeCompare(y.title, l2.locales[0]) || 0);
      return shows;
    }
  } catch (err) {
    console.error(`Error fetching ${type}`, err);
  }
  return [];
};


export const mutations = {
  LOAD_SHOWS(state, { l2, tvShows, talks }) {
    tvShows.forEach((show) => {
      show.episodes = show.episodes || [];
      show.sort = determineSortType({ type: "tvShow", show });
      show.type = "tvShow";
    }); // So that they are reactive
    talks.forEach((show) => {
      show.episodes = show.episodes || [];
      show.sort = determineSortType({ type: "talk", show });
      show.type = "talk";
    }); // So that they are reactive
    state.tvShows[l2.code] = tvShows;
    state.talks[l2.code] = talks;
    state.showsLoaded[l2.code] = true;

    state.categories = categories(l2, state.tvShows, state.talks);
  },
  ADD_SHOW(state, { l2, type, show }) {
    state[type][l2.code].push(show);
  },
  REMOVE_SHOW(state, { l2, type, show }) {
    state[type][l2.code] = state[type][l2.code].filter((s) => s !== show);
  },
  UPDATE_SHOW(state, { l2, type, id, payload }) {
    let show = state[type][l2.code].find((s) => s.id === id);
    if (show) {
      for (let key in payload) {
        show[key] = payload[key];
      }
    }
  },
  REMOVE_EPISODE_FROM_SHOW(
    state,
    { l2, collection = "tvShows", showId, episode }
  ) {
    let show = state[collection][l2.code].find((s) => s.id === showId);
    if (show.episodes)
      show.episodes = show.episodes.filter(
        (e) => e.youtube_id !== episode.youtube_id
      );
  },
  // Modify any item in the store, be it a show, a video, or a line in the subs.
  MODIFY_ITEM(state, { item, key, value }) {
    Vue.set(item, key, value);
  },
  ADD_EPISODES_TO_SHOW(
    state,
    { l2, collection = "tvShows", showId, episodes, sort = "-date" }
  ) {
    let show = state[collection][l2.code].find((s) => s.id === showId);
    if (!show) {
      console.log(`Trying to add episodes to show '${showId}' but it doesn't exist in state.${collection}:`, state[collection][l2.code]);
      return
    }
    if (show.episodes && show.episodes.length > 0)
      episodes = episodes.concat(show.episodes);
    episodes = uniqueByValue(episodes, "youtube_id");
    if (sort === "-date") {
      episodes = episodes.sort((a, b) =>
        b.date ? b.date.localeCompare(a.date) : 0
      );
    } else if (sort === "title") {
      episodes = episodes.sort((a, b) =>
        a.title
          ? a.title.localeCompare(
              b.title,
              l2 && l2.locales && l2.locales[0] ? l2.locales[0] : "en",
              {
                numeric: true,
              }
            )
          : 0
      );
    }
    show.episodes = episodes;
  },
  SET_EPISODE_COUNT(state, { l2, collection, showId, episodeCount }) {
    let show = state[collection][l2.code].find((s) => s.id === Number(showId));
    show.episodeCount = episodeCount;
  },
};

export const getMinLexDivByLevel = (shows) => {
  let lexDivs = shows.map((s) => s.lex_div).filter((l) => l > 0);
  lexDivs = lexDivs.sort((a, b) => a - b);
  let minLexDivByLevel = {};
  minLexDivByLevel[7] = lexDivs[lexDivs.length - 1];
  minLexDivByLevel[6] = lexDivs[Math.ceil(lexDivs.length / 2)];
  minLexDivByLevel[5] = lexDivs[Math.ceil(lexDivs.length / 2 / 2)];
  minLexDivByLevel[4] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2)];
  minLexDivByLevel[3] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2)];
  minLexDivByLevel[2] = lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2 / 2)];
  minLexDivByLevel[1] =
    lexDivs[Math.ceil(lexDivs.length / 2 / 2 / 2 / 2 / 2 / 2)];
  return minLexDivByLevel;
};

export const levelByLexDiv = (lexDiv, minLexDivByLevel) => {
  if (!lexDiv) return;
  for (let i = 1; i <= 7; i++) {
    if (lexDiv < minLexDivByLevel[i]) return i;
  }
};

export const actions = {
  async load(context, { l2, forceRefresh, limit = 1000 }) {
    const [tvShows, talks] = await Promise.all([
      fetchShows(this.$directus, "tv_shows", l2, forceRefresh, limit),
      fetchShows(this.$directus, "talks", l2, forceRefresh, limit)
    ]);
    
    const processShows = (shows, minLexDivByLevel) => 
      shows.map(show => ({ ...show, level: levelByLexDiv(show.lex_div, minLexDivByLevel) }));
    
    const minLexDivByLevel = getMinLexDivByLevel([...tvShows, ...talks]);
    
    const processedTalks = processShows(talks, minLexDivByLevel);
    const processedTvShows = processShows(tvShows, minLexDivByLevel);
    
    context.commit("LOAD_SHOWS", { l2, tvShows: processedTvShows, talks: processedTalks });
  },
  async add(context, { l2, type, show }) {
    let response = await this.$directus.post(
      `items/${type === "tvShows" ? "tv_shows" : "talks"}`,
      show
    );
    if (response && response.data) {
      context.commit("ADD_SHOW", { l2, type, show: response.data.data });
      let show = Object.assign(response.data.data, {
        l2,
        type: type === "tvShows" ? "tv_show" : "talk",
      });
      return show;
    } else {
      return false;
    }
  },
  async remove(context, { l2, type, show }) {
    let response = await this.$directus.delete(
      `items/${type === "tvShows" ? "tv_shows" : "talks"}/${show.id}`
    );
    if (response?.status === 204) {
      context.commit("REMOVE_SHOW", { l2, type, show });
    }
    return true;
  },
  async update(context, { l2, type, id, payload }) {
    let response = await this.$directus.patch(
      `items/${type === "tvShows" ? "tv_shows" : "talks"}/${id}`,
      payload
    );
    if (response) {
      context.commit("UPDATE_SHOW", { l2, type, id, payload });
    }
    return true;
  },
  async addEpisodesToShow(
    { commit },
    { l2, collection = "tvShows", showId, episodes, sort = "-date" }
  ) {
    commit("ADD_EPISODES_TO_SHOW", { l2, collection, showId, episodes, sort });
  },
  async removeEpisodeFromShow(
    { commit },
    { l2, collection = "tvShows", showId, episode }
  ) {
    commit("REMOVE_EPISODE_FROM_SHOW", { l2, collection, showId, episode });
  },
  async setEpisodeCount(
    { commit },
    { l2, collection = "tvShows", showId, episodeCount }
  ) {
    commit("SET_EPISODE_COUNT", { l2, collection, showId, episodeCount });
  },
  async getEpisodesFromServer(
    { dispatch },
    {
      l2,
      collection = "tvShows",
      showId,
      forceRefresh = false,
      keyword,
      limit = 96,
      offset = 0,
      sort = "-views",
    } = {}
  ) {
    let keywordFilter = keyword ? `&filter[title][contains]=${keyword}` : "";
    let fields = "id,title,l2,youtube_id,date,tv_show,talk,channel_id";

    if (LANGS_WITH_CONTENT.includes(l2.code))
      fields +=
        ",views,tags,category,locale,duration,made_for_kids,views,likes,comments";

    let response = await this.$directus.get(
      `${this.$directus.youtubeVideosTableName(l2.id)}?filter[l2][eq]=${
        l2.id
      }&filter[${collection}][eq]=${showId}${keywordFilter}&fields=${fields}&sort=${sort}&limit=${limit}&offset=${offset}&timestamp=${
        forceRefresh ? Date.now() : 0
      }`
    );
    if (!response || !response.data) return [];
    let videos = response.data.data || [];
    videos = uniqueByValue(videos, "youtube_id");

    if (sort === "title") {
      videos =
        videos.sort((x, y) =>
          (x.title || "").localeCompare(y.title, l2.locales[0], {
            numeric: true,
          })
        ) || [];
    } else if (sort === "-date") {
      videos =
        videos.sort((y, x) =>
          x.date
            ? x.date.localeCompare(y.date, l2.locales[0], { numeric: true })
            : -1
        ) || [];
    }

    dispatch("addEpisodesToShow", {
      l2,
      collection: collection === "tv_show" ? "tvShows" : "talks",
      showId,
      episodes: videos,
      sort,
    });

    return videos;
  },
};

export const getters = {
  tvShow:
    (state) =>
    ({ l2, id }) => {
      if (state.showsLoaded[l2.code]) {
        let show = state.tvShows[l2.code].find((s) => s.id === Number(id));
        return show;
      }
    },
  talk:
    (state) =>
    ({ l2, id }) => {
      if (state.showsLoaded[l2.code])
        return state.talks[l2.code].find((s) => s.id === Number(id));
    },
  movies:
    (state) =>
    ({ l2 }) => {
      if (state.showsLoaded[l2.code])
        return state.tvShows[l2.code].find((s) => s.title === "Movies");
    },
  music:
    (state) =>
    ({ l2 }) => {
      if (state.showsLoaded[l2.code])
        return state.tvShows[l2.code].find((s) => s.title === "Music");
    },
  news:
    (state) =>
    ({ l2 }) => {
      if (state.showsLoaded[l2.code])
        return state.talks[l2.code].find((s) => s.title === "News");
    },
  audiobooks:
    (state) =>
    ({ l2 }) => {
      if (state.showsLoaded[l2.code])
        return state.talks[l2.code].filter((s) => s.audiobook);
    },
};
