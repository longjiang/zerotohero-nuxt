import { parseSync } from "subtitle"; // Incompatible with Vite
import Papa from "papaparse";
import he from "he"; // html entities
import {
  mutuallyExclusive,
  uniqueByValue,
  characterClass,
} from "../lib/utils";

export default ({ app }, inject) => {
  inject("subs", {
    parseNotes(csv) {
      let parsed = Papa.parse(csv, { header: true }).data;
      for (let line of parsed) {
        line.id = Number(line.id);
      }
      return parsed;
    },
    parseSavedSubs(jsonOrCSV) {
      // Make sure jsonOrCSV is not null, undefined and is a string
      if (jsonOrCSV && typeof jsonOrCSV === "string") {
        let isJSON = jsonOrCSV.charAt(0) === "[";
        let parsed = isJSON
          ? JSON.parse(jsonOrCSV)
          : Papa.parse(jsonOrCSV, { header: true }).data;
        parsed = parsed.filter((line) => line.starttime);
        for (let line of parsed) {
          line.starttime = Number(line.starttime);
          if (line.duration) line.duration = Number(line.duration);
        }
        parsed = this.normalizeSubs(parsed);
        return parsed;
      } else {
        return [];
      }
    },
    normalizeSubs(lines) {
      lines = lines.sort((a, b) => a.starttime - b.starttime);
      lines = uniqueByValue(lines, "starttime")

      // Filterout zero-width space characters
      lines = lines.map((line) => {
        line.line = line.line.replace(/\u200B/g, "");
        return line;
      });

      // If multiple consecutive lines have the same `line` property, merge them
      let prevLine;
      for (let line of lines) {
        if (prevLine && prevLine.line === line.line) {
          prevLine.duration += line.duration;
          line.starttime = undefined;
        } else {
          prevLine = line;
        }
      }
      lines = lines.filter((line) => line.starttime);
      return lines;
    },
    // This function is needed for the "Open MP4" feature
    // parseSync from the 'subtitle' package is incompatible with Vite,
    // but we're not planning to migrate to Vite, so we leave it as is
    parseSrt(srt) {
      let parsed = parseSync(srt).map((cue) => {
        return {
          starttime: cue.data.start / 1000,
          duration: (cue.data.end - cue.data.start) / 1000,
          line: cue.data.text,
        };
      });

      let subs_l2 = [];
      let prevLine;
      for (let line of parsed) {
        // In the rare case when two consecutive lines have the same starttime,
        // merge them and join them by "\n"
        if (prevLine && prevLine.starttime === line.starttime) {
          prevLine.duration += line.duration;
          prevLine.line = prevLine.line + "\n" + line.line;
        } else {
          subs_l2.push(line);
          prevLine = line;
        }
      }
      subs_l2 = this.normalizeSubs(subs_l2);
      return subs_l2;
    },
    unparseSubs(subs, l2 = "en") {
      let lines = subs
        .filter((l) => l)
        .map((l, index) => {
          let line = l.line;
          if (["he", "hbo"].includes(l2)) line = this.stripHebrewVowels(line);
          if (l2 === "got") line = he.encode(line);
          const starttime = l.starttime;
          let duration;
          if (l.duration) {
            duration = l.duration;
          } else if (index < subs.length - 1 && subs[index + 1]) {
            // Calculate duration based on starttime of next line
            duration = subs[index + 1].starttime - l.starttime;
          } else {
            // Set duration to undefined or a default value for the last line
            duration = undefined; // or set a default value here
          }

          const obj = { starttime, duration, line };
          return obj;
        });

      let csv = Papa.unparse(lines);
      return csv;
    },
    unparseNotes(notes) {
      notes = notes.filter((note) => note);
      let csv = Papa.unparse(notes);
      return csv;
    },
    async searchWithLike({
      terms,
      l2Obj,
      adminMode,
      excludeTerms = [],
      continua,
      sort,
      limit = 20,
      tvShowFilter,
      categoryFilter,
      exact = false,
      apostrophe = false,
      mustIncludeYouTubeId = undefined,
    } = {}) {
      let tv_show, category; // Undefined by default
      if (tvShowFilter) tv_show = tvShowFilter === "all" ? "nnull" : tvShowFilter.join(",");
      if (categoryFilter) category = categoryFilter === "all" ? "nnull" : categoryFilter.join(",");
      let hits = [];
      // terms = terms.filter((t) => t).map((t) => t.replace(/'/g, "&#39;"));
      terms = mutuallyExclusive(terms); // So if terms are ['dièdres', 'dièdre'], we search only 'dièdre' since results of the plural will be included automatically.
      let timestamp = adminMode ? Date.now() : 0;
      let params = {
        l2Obj,
        tv_show,
        category,
        terms,
        sort,
        limit,
        timestamp,
      };
      let videos = await app.$directus.searchCaptions(params);
      if (mustIncludeYouTubeId) {
        let matchedVideo = videos.find(
          (v) => v.youtube_id === mustIncludeYouTubeId
        );
        if (!matchedVideo) {
          let matchedVideos = await app.$directus.getVideos({
            l2Id: l2Obj.id,
            params: {
              'filter[youtube_id][eq]': mustIncludeYouTubeId,
            },
            subs: true
          });
          matchedVideo = matchedVideos[0];
          if (matchedVideos?.length > 0) {
            videos = [matchedVideo, ...videos];
          }
        }
      }
      if (videos?.length > 0) {
        for (let video of videos) {
          if (video.subs_l2)
            video.subs_l2 = this.parseSavedSubs(video.subs_l2).filter(
              (line) => line.starttime
            );
          if (video.subs_l1) video.subs_l1 = this.parseSavedSubs(video.subs_l1);
          if (video.notes) video.notes = this.parseNotes(video.notes);
        }
        hits = hits.concat(
          this.getHits(
            videos,
            terms,
            excludeTerms,
            continua,
            exact,
            apostrophe,
            mustIncludeYouTubeId,
            limit
          )
        );
      }
      return hits;
    },
    async searchSubs({
      terms,
      excludeTerms = [],
      l2Obj,
      tvShowFilter,
      categoryFilter,
      adminMode = false,
      continua = true,
      sort,
      limit = 20,
      exact = false,
      apostrophe = false,
      mustIncludeYouTubeId = undefined,
    } = {}) {
      let hits = await this.searchWithLike({
        terms,
        l2Obj,
        tvShowFilter,
        categoryFilter,
        adminMode,
        excludeTerms,
        continua,
        sort,
        limit,
        exact,
        apostrophe,
        mustIncludeYouTubeId,
      })
      hits = uniqueByValue(hits, "id");
      // Before slicing to a limit, the video with mustIncludeYouTubeId must be the first element for this to work properly, otherwise we won't have the video from which the user saved the word
      if (mustIncludeYouTubeId) {
        let mustIncludeHit = hits.find(
          (hit) => hit.video.youtube_id === mustIncludeYouTubeId
        );
        if (mustIncludeHit) {
          hits = [mustIncludeHit, ...hits.filter((hit) => hit.id !== mustIncludeHit.id)];
        }
      }
      if (limit) hits = hits.slice(0, limit); 
      return hits.sort((a, b) => a.lineIndex - b.lineIndex);
    },

    // Helper function to process videos
    extractHitsFromVideos(videos, exact, regex, punctuationsRegex, excludeRegex, mustIncludeYouTubeId) {
      const hits = [];
      const seenYouTubeIds = [];

      for (const video of videos) {

        if (!video || seenYouTubeIds.includes(video.youtube_id)) continue;

        seenYouTubeIds.push(video.youtube_id);

        for (const [index, { line: rawLine }] of Object.entries(
          video.subs_l2 || {}
        )) {

          const line = he.decode(rawLine).replace(/\n/g, " ");

          if (
            this.lineMeetsTermAndExclusionCriteria(
              line,
              exact,
              regex,
              punctuationsRegex,
              mustIncludeYouTubeId === video.youtube_id ? null : excludeRegex
            )
          ) {
            hits.push({
              video,
              lineIndex: index,
              id: `${video.youtube_id}#${index}`,
            });
          }
        }
      }

      return hits
    },
    // Helper function to escape regular expressions
    escapeRegExp(text) {
      if (!text) return text;
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },

    // Helper function to create a regex based on conditions
    createRegex({ exact, apostrophe, continua, termsRegex }) {
      if (exact) {
        const punctuations =
          characterClass(
            apostrophe ? "PunctuationNoApostropheNoHyphen" : "Punctuation"
          ) + (continua ? " " : "");
        const punctuationsRegex = new RegExp(`[${punctuations}]`, "g");
        return [
          new RegExp(`^s*(${termsRegex.join("|")})s*$`, "i"),
          punctuationsRegex,
        ];
      }
      const boundary = continua ? "" : `(^|[^${characterClass("L")}]+)`;
      const termsStr = termsRegex
        .join("|")
        .replace(/\\\*/g, ".+")
        .replace(/[_]/g, ".");
      return [new RegExp(`${boundary}(${termsStr})`, "i")];
    },

    // Helper function to check term and exclusion conditions
    lineMeetsTermAndExclusionCriteria(line, exact, regex, punctuationsRegex, excludeRegex) {
      let matchesTerms = false
      if (exact) {
        let segs = line
          .replace(punctuationsRegex, "\n")
          .split("\n")
          .map(line => line.replace(/^\s*[-–]\s*/, "").trim())
          .filter(line => line && line !== "");
        for (let seg of segs) {
          let test = regex.test(seg);
          if (test) matchesTerms = true;
        }
      } else {
        if (regex.test(line)) matchesTerms = true;
      }
      if (!matchesTerms) return false;
      const notExcluded = !excludeRegex || !excludeRegex.test(line);
      return notExcluded;
    },

    getHits(
      videos,
      terms,
      excludeTerms,
      continua = true,
      exact = false,
      apostrophe = false,
      mustIncludeYouTubeId
    ) {
      const termsRegex = terms.map(this.escapeRegExp);
      const [regex, punctuationsRegex] = this.createRegex({
        exact,
        apostrophe,
        continua,
        termsRegex,
      });
      const excludeRegex =
        excludeTerms?.length > 0
          ? new RegExp(excludeTerms.map(this.escapeRegExp).join("|"), "i")
          : null;

      let hits = this.extractHitsFromVideos(
        videos,
        exact,
        regex,
        punctuationsRegex,
        excludeRegex,
        mustIncludeYouTubeId
      );

      for (let hit of hits) {
        hit.line = hit.video.subs_l2[hit.lineIndex].line.trim();

      }

      return hits;
    },
  });
  
};
