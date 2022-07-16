import Config from "@/lib/config";
import Helper from "@/lib/helper";
import DateHelper from "@/lib/date-helper";
import axios from "axios";
import parser from "fast-xml-parser";
import $ from "jquery";
import { parse } from "node-html-parser";

export const CATEGORIES = {
  1: 'Film & Animation',
  2: 'Autos & Vehicles',
  10: 'Music',
  15: 'Pets & Animals',
  17: 'Sports',
  18: 'Short Movies',
  19: 'Travel & Events',
  20: 'Gaming',
  21: 'Videoblogging',
  22: 'People & Blogs',
  23: 'Comedy',
  24: 'Entertainment',
  25: 'News & Politics',
  26: 'How-to & Style',
  27: 'Education',
  28: 'Science & Technology',
  29: 'Non-profits & Activism',
  30: 'Movies',
  31: 'Anime/Animation',
  32: 'Action/Adventure',
  33: 'Classics',
  34: 'Comedy',
  35: 'Documentary',
  36: 'Drama',
  37: 'Family',
  38: 'Foreign',
  39: 'Horror',
  40: 'Sci-Fi/Fantasy',
  41: 'Thriller',
  42: 'Shorts',
  43: 'Shows',
  44: 'Trailers',
}

export default {
  thumbnail(id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  },
  async getTranscript(
    youtube_id,
    locale,
    name,
    forceRefresh = false,
    generated
  ) {
    let nameQuery = name ? `&name=${encodeURIComponent(name)}` : "";
    let generatedQuery = generated ? `&generated=true` : ""; // Whether or not to use auto-generated captions
    let html = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&lang=${locale}${nameQuery}&fmt=srv3${generatedQuery}`,
      { cacheLife: forceRefresh ? 0 : -1 }
    );
    let lines = [];
    let root = parse(html);
    for (let p of root.querySelectorAll("p")) {
      if (typeof p === "undefined") continue;
      let line = {
        line: p.innerText,
        starttime: parseInt(p.getAttribute("t")) / 1000,
        duration: parseInt(p.getAttribute("d")) / 1000
      };
      lines.push(line);
    }
    lines = lines.filter(line => {
      return line.line.trim() !== "" && !Number.isNaN(line.starttime);
    });
    lines = lines.sort((a, b) => a.starttime - b.starttime);
    return lines;
  },

  async getTranslatedTranscript(
    youtube_id,
    locale,
    name,
    tlang,
    forceRefresh = false
  ) {
    let nameQuery = name ? `&name=${encodeURIComponent(name)}` : "";
    let html = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&lang=${locale}${nameQuery}&tlang=${tlang}&fmt=srv3`,
      { cacheLife: forceRefresh ? 0 : -1 }
    );
    let lines = [];
    let root = parse(html);
    for (let p of root.querySelectorAll("p")) {
      if (typeof p === "undefined") continue;
      let line = {
        line: p.innerText,
        starttime: parseInt(p.getAttribute("t")) / 1000
      };
      lines.push(line);
    }
    lines = lines.filter(line => {
      return line.line.trim() !== "" && !Number.isNaN(line.starttime);
    });
    lines = lines.sort((a, b) => a.starttime - b.starttime);
    return lines;
  },

  /* Not ideal because it relies on jQuery, will be replaced by getSubsList eventually */
  async getYouTubeSubsListAndAddLocale(video, $l1, $l2) {
    let l2Locales = Helper.unique([
      $l2.code,
      ...$l2.locales,
      ...$l2.hostCountryLocales
    ]);
    let l1Locales = Helper.unique([$l1.code, ...$l1.locales]);
    let $html = await Helper.scrape(
      `https://python.zerotohero.ca/timedtext?v=${video.youtube_id}&type=list`
    );
    if (typeof $html === "undefined") return video;
    for (let track of $html.find("track")) {
      let locale = $(track).attr("lang_code");
      let name = $(track).attr("name");
      if (l2Locales.includes(locale)) {
        video.hasSubs = true;
        video.checkingSubs = false;
        video.l2Locale = locale;
        if (name) video.l2Name = name;
        break;
      }
    }
    for (let track of $html.find("track")) {
      let locale = $(track).attr("lang_code");
      if (l1Locales.includes(locale)) {
        video.l1Locale = locale;
        break;
      }
    }
    return video;
  },
  async getSubsList(youtube_id) {
    let xml = await Helper.proxy(
      `https://python.zerotohero.ca/timedtext?v=${youtube_id}&type=list`
    );
    let root = parser.parse(xml, {
      ignoreAttributes: false
    });
    if (
      typeof root.transcript_list !== "undefined" &&
      typeof root.transcript_list.track !== "undefined"
    ) {
      let tracks =
        root.transcript_list.track.length > 0
          ? root.transcript_list.track
          : [root.transcript_list.track];
      return tracks.map(t => {
        return {
          id: t["@_id"],
          locale: t["@_lang_code"],
          name: t["@_name"]
        };
      });
    }
  },
  searchYouTubeByProxy(searchTerm, callback) {
    $.ajax(
      Config.lrcServer +
      "proxy.php?" +
      "https://www.youtube.com/results?search_query=" +
      searchTerm.replace(/ /g, "+")
    ).done(function (response) {
      var videoIds = [];
      // We use 'ownerDocument' so we don't load the images and scripts!
      // https://stackoverflow.com/questions/15113910/jquery-parse-html-without-loading-images
      var ownerDocument = document.implementation.createHTMLDocument("virtual");
      let $html = $(response, ownerDocument);
      $html.find(".item-section li .yt-uix-tile-link").each(function () {
        if (
          !$(this)
            .attr("href")
            .includes("/channel/") &&
          !$(this)
            .attr("href")
            .includes("/user/")
        ) {
          videoIds.push(
            $(this)
              .attr("href")
              .replace("/watch?v=", "")
              .replace(/&list=.*/, "")
          );
        }
      });
      callback(videoIds);
    });
  },
  search(text, callback, options) {
    options = Object.assign({ l2: "en", subs: false, cacheLife: -1 }, options);
    let subsQueryVar = options.subs ? "&sp=EgIoAQ%253D%253D" : "";
    Helper.scrape(
      `https://www.youtube.com/results?search_query=${text.replace(
        / /g,
        "+"
      )}+lang%3A${options.l2}${subsQueryVar}`,
      options.cacheLife
    ).then($html => {
      if (typeof $html === "undefined") return [];
      let videos = [];
      if ($html.find(".yt-lockup-content").length > 0) {
        for (let item of $html.find(".yt-lockup-content")) {
          if (
            !$(item)
              .find(".yt-uix-sessionlink")
              .attr("href")
              .includes("/channel/") &&
            !$(item)
              .find(".yt-uix-sessionlink")
              .attr("href")
              .includes("/user/")
          ) {
            let badge = $(item).find(".yt-badge")[0];
            let id = $(item)
              .find(".yt-uix-sessionlink")
              .attr("href")
              .replace("/watch?v=", "");
            let youtube = {
              id: id,
              cc: false,
              title: $(item)
                .find(".yt-uix-sessionlink")
                .attr("title"),
              thumbnail: this.thumbnail(id),
              url: "https://www.youtube.com/watch?v=" + id
            };
            if (badge && ["CC", "Untertitel"].includes(badge.innerText)) {
              youtube.cc = true;
            }
            videos.push(youtube);
          }
        }
      }
      callback(videos);
    });
  },
  async searchByGoogle(options) {
    options = Object.assign(
      {
        lang: "en",
        captions: true,
        start: 0,
        forceRefresh: false,
        long: false
      },
      options
    );
    let long = options.long ? ",dur:l" : "";
    let term = options.term ? options.term.replace(/ /g, "+") : "";
    let cc = options.captions ? ",cc:1" : "";
    let url = `https://www.google.com/search?q=${term}&start=${options.start}&lr=lang_${options.lang}&safe=active&tbs=srcf:H4sIAAAAAAAAANOuzC8tKU1K1UvOz1VLS0xOTcrPz4ZwMnNyy1OT9Apy1ErKM0tKUovAwpl5QFZmIki4ID-nOLEkL7W8GMQDAIqXaqNKAAAA${cc}${long}&tbm=vid`;
    url = url + "&gl=us"; // Make sure the results are returned in English (sometimes the scraping server is in other countries and the date is represented in a foreign language)
    let $html = await Helper.scrape(url, options.forceRefresh ? 0 : -1);
    if (typeof $html === "undefined") return [];
    let videos = [];
    let main = $html.toArray().find(element => element.id === "main");
    for (let a of $(main).find(
      'a[href^="/url?q=https://www.youtube.com/watch"]'
    )) {
      let url = $(a)
        .attr("href")
        .replace(/\/url\?q=([^&]+).*/, "$1");
      let title = $(a)
        .find("div:first-child")
        .text()
        .replace(" - YouTube", "");
      let id = url.replace("https://www.youtube.com/watch%3Fv%3D", "");

      if (url && title && title !== "") {
        let date;
        let span = $(a)
          .parent()
          .parent()
          .find("span")
          .get(0);
        let dir = span.getAttribute("dir");
        if (dir && dir === "rtl")
          span = $(a)
            .parent()
            .parent()
            .find("span")
            .get(1);
        if (span && span.innerText) {
          let dateStr = span.innerText.trim();
          if (dateStr) {
            date = DateHelper.parseDate(dateStr);
          }
        }
        videos.push({
          youtube_id: id,
          cc: options.captions ? true : undefined,
          title: title,
          date,
          thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`
        });
      }
    }
    return videos;
  },
  async videoByApi(id, cacheLife = -1) {
    let response = await axios.get(
      `${Config.youtubeVideo}?id=${id}&cache_life=${cacheLife}`
    );
    response = response.data;
    if (response.data.items && response.data.items.length > 0) {
      let video = response.data.items.map(item => {
        let date = DateHelper.parseDate(item.snippet.publishedAt);
        return {
          youtube_id: id,
          title: item.snippet.title,
          channel: {
            title: item.snippet.channelTitle,
            id: item.snippet.channelId
          },
          date,
          data: item
        };
      })[0];
      return video;
    }
  },
  mapChannelPlaylistsData(item) {
    return {
      id: item.id,
      title: item.snippet ? item.snippet.title : false,
      thumbnail:
        item.snippet &&
          item.snippet.thumbnails &&
          item.snippet.thumbnails.standard
          ? item.snippet.thumbnails.standard.url
          : false,
      count: item.contentDetails ? item.contentDetails.itemCount : false,
      description: item.snippet.description,
      date: item.snippet.publishedAt,
      data: item
    };
  },
  async channelPlayListsByAPI(
    channelID,
    cacheLife = -1,
    nextPageToken = false
  ) {
    let nextPageTokenVar = nextPageToken ? `&page_token=${nextPageToken}` : "";
    let response = await $.getJSON(
      `${Config.youtubeChannelPlaylists}?channel=${channelID}${nextPageTokenVar}&cache_life=${cacheLife}`
    );
    let playlists = [];
    if (response.data && response.data.items) {
      playlists = response.data.items.map(this.mapChannelPlaylistsData);
    }
    nextPageToken = response.data.nextPageToken;
    if (nextPageToken) {
      playlists = playlists.concat(
        await this.channelPlayListsByAPI(channelID, cacheLife, nextPageToken)
      );
    }
    return playlists;
  },
  escapeZeroEx(id) {
    return id.replace(/0x/g, "ZEROEX");
  },
  async playlistByApi(id, pageToken = false, cacheLife = -1) {
    let res = await this.playlistPageByApi(id, pageToken, cacheLife);
    if (res) {
      let { playlistItems, nextPageToken, totalResults } = res;
      if (nextPageToken) {
        let data = await this.playlistByApi(id, nextPageToken);
        if (data) {
          playlistItems = playlistItems.concat(data.playlistItems);
          return { playlistItems, totalResults };
        }
      }
      return { playlistItems, totalResults };
    }
  },
  async playlistPageByApi(id, pageToken = false, cacheLife = -1) {
    let pageTokenQS = pageToken ? `&page_token=${pageToken}` : "";
    let url = `${Config.youtubePlaylist}?playlist_id=${this.escapeZeroEx(
      id
    )}${pageTokenQS}&cache_life=${cacheLife}`;
    let response = await $.getJSON(url);
    let playlistItems = [];
    if (response.data) {
      if (response.data.items) {
        playlistItems = response.data.items.map(item => {
          return {
            youtube_id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            channel_id: item.snippet.channelId,
            date: DateHelper.parseDate(item.contentDetails.videoPublishedAt),
            data: item
          };
        });
      }
      let nextPageToken = response.data.nextPageToken;
      let totalResults = response.data.pageInfo.totalResults;
      return {
        playlistItems,
        nextPageToken,
        totalResults
      };
    }
  },
  playlist(playlistID, callback, cacheLife = -1) {
    Helper.scrape(
      `https://www.youtube.com/playlist?list=${playlistID}`,
      cacheLife
    ).then($html => {
      if (typeof $html === "undefined") return;
      let playlist = {
        id: playlistID,
        title: $html
          .find(".pl-header-title")
          .text()
          .trim(),
        videos: []
      };
      for (let item of $html.find(".pl-video.yt-uix-tile")) {
        let id = $(item).attr("data-video-id");
        let video = {
          title: $(item).attr("data-title"),
          id: id,
          thumbnail: this.thumbnail(id)
        };
        playlist.videos.push(video);
      }
      callback(playlist);
    });
  },
  channel(channelID, callback, cacheLife = -1) {
    // channelURL: https://www.youtube.com/user/TEDxTaipei https://www.youtube.com/channel/UCKFB_rVEFEF3l-onQGvGx1A
    Helper.scrape(
      `https://www.youtube.com/channel/${channelID}/videos`,
      cacheLife
    ).then($html => {
      if (typeof $html === "undefined") return;
      let channel = {
        id: channelID,
        title: $html.find(".branded-page-header-title-link").attr("title"),
        videos: [],
        avatar: $html
          .find(".channel-header-profile-image")
          .eq(0)
          .attr("src")
      };
      for (let item of $html.find(".yt-lockup-content")) {
        let badge = $(item).find(".yt-badge")[0];
        let id = $(item)
          .find(".yt-uix-sessionlink")
          .attr("href")
          .replace("/watch?v=", "");
        let youtube = {
          id: id,
          cc: false,
          title: $(item)
            .find(".yt-uix-sessionlink")
            .attr("title"),
          thumbnail: this.thumbnail(id),
          url: "https://www.youtube.com/watch?v=" + id
        };
        if (badge && badge.innerText === "CC") {
          youtube.cc = true;
        }
        channel.videos.push(youtube);
      }
      callback(channel);
    });
  },
  channelPlaylists(channelID, callback, cacheLife = -1) {
    // channelURL: https://www.youtube.com/user/TEDxTaipei https://www.youtube.com/channel/UCKFB_rVEFEF3l-onQGvGx1A
    Helper.scrape(
      `https://www.youtube.com/channel/${channelID}/playlists`,
      cacheLife
    ).then($html => {
      if (typeof $html === "undefined") return;
      let playlists = [];
      for (let item of $html.find(".yt-shelf-grid-item")) {
        if (
          item &&
          $(item)
            .find(".yt-uix-tile-link")
            .attr("href")
        ) {
          let playlist = {
            id: $(item)
              .find(".yt-uix-tile-link")
              .attr("href")
              .replace(/.*list=(.*)/, "$1"),
            title: $(item)
              .find(".yt-uix-tile-link")
              .text()
              .trim(),
            thumbnail:
              $(item)
                .find("[data-ytimg]")
                .attr("data-thumb") ||
              $(item)
                .find("[data-ytimg]")
                .attr("src"),
            count: $(item)
              .find(".formatted-video-count-label b")
              .text()
          };
          playlists.push(playlist);
        }
      }
      callback(playlists);
    });
  },
};
