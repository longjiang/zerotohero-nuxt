import { sify } from "chinese-conv";
import { parseSync } from "subtitle";
import Papa from "papaparse";
import he from "he"; // html entities
import {
  mutuallyExclusive,
  uniqueByValue,
  characterClass,
  escapeRegExp,
} from "@/lib/utils";

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
      if (jsonOrCSV) {
        let isJSON = jsonOrCSV.charAt(0) === "[";
        let parsed = isJSON
          ? JSON.parse(jsonOrCSV)
          : Papa.parse(jsonOrCSV, { header: true }).data;
        parsed = parsed.filter((line) => line.starttime);
        for (let line of parsed) {
          line.starttime = Number(line.starttime);
          if (line.duration) line.duration = Number(line.duration);
          if (line.line) line.line = he.decode(line.line);
        }
        parsed = parsed.sort((a, b) => a.starttime - b.starttime);
        return parsed;
      } else {
        return [];
      }
    },
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
      return uniqueByValue(subs_l2, "starttime");
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
          } else if (index < subs.length - 1) {
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
      langId,
      adminMode,
      excludeTerms = [],
      continua,
      limit = 20,
      tvShowFilter = "all",
      talkFilter = "all",
      exact = false,
      apostrophe = false,
      convertToSimplified = false,
      mustIncludeYouTubeId = undefined,
    } = {}) {
      let tv_show = tvShowFilter === "all" ? "nnull" : tvShowFilter.join(",");
      let talk = talkFilter === "all" ? "nnull" : talkFilter.join(",");
      let hits = [];
      terms = terms.filter((t) => t).map((t) => t.replace(/'/g, "&#39;"));
      terms = mutuallyExclusive(terms); // So if terms are ['dièdres', 'dièdre'], we search only 'dièdre' since results of the plural will be included automatically.
      let timestamp = adminMode ? Date.now() : 0;
      let params = {
        l2Id: langId,
        tv_show,
        talk,
        terms,
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
            l2Id: langId,
            query: `filter[youtube_id][eq]=${mustIncludeYouTubeId}`,
          });
          if (matchedVideos?.length > 0) {
            videos = [matchedVideos[0], ...videos];
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
            convertToSimplified,
            exact,
            apostrophe,
            mustIncludeYouTubeId
          )
        );
      }
      return hits;
    },
    async searchSubs({
      terms,
      excludeTerms = [],
      langId = 1824,
      tvShowFilter = "all",
      talkFilter = "all",
      adminMode = false,
      continua = true,
      limit = 20,
      exact = false,
      apostrophe = false,
      convertToSimplified = false,
      mustIncludeYouTubeId = undefined,
    } = {}) {
      let hits = [];
      if (tvShowFilter !== []) {
        hits = hits.concat(
          await this.searchWithLike({
            terms,
            langId,
            tvShowFilter,
            talkFilter,
            adminMode,
            excludeTerms,
            continua,
            limit,
            exact,
            apostrophe,
            convertToSimplified,
            mustIncludeYouTubeId,
          })
        );
      }
      hits = uniqueByValue(hits, "id");
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

      return hits;
    },
    // Helper function to escape regular expressions
    escapeRegExp(text) {
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
      const notExcluded = !excludeRegex || !excludeRegex.test(line);
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
      return matchesTerms && notExcluded;
    },

    // Helper function to update hit contexts
    updateHitContexts(hit, termsRegex) {
      const getLeftContext = (prevLine, currentLine, regex) =>
        (prevLine ? prevLine.trim() : "") + currentLine.replace(regex, "");

      const getRightContext = (currentLine, nextLine, regex) =>
        currentLine.replace(regex, "").trim() +
        (nextLine ? nextLine.trim() : "");

      let prev = hit.video.subs_l2[hit.lineIndex - 1];
      let next = hit.video.subs_l2[Number(hit.lineIndex) + 1];
      let regex = new RegExp(
        `(${termsRegex.join("|").replace(/[*]/g, ".+").replace(/[_]/g, ".")})`,
        "gim"
      );

      if (!hit.leftContext) {
        hit.leftContext = getLeftContext(prev ? prev.line : "", hit.line, regex)
          .split("")
          .reverse()
          .join("")
          .trim();
      }

      if (!hit.rightContext) {
        hit.rightContext = getRightContext(hit.line, next && next.line, regex);
      }
    },

    // Convert subtitles to simplified Chinese
    convertSubLinesToSimplified(hit, sify) {
      [hit.lineIndex - 1, hit.lineIndex, hit.lineIndex + 1].forEach((index) => {
        const lineObj = hit.video.subs_l2[index];
        if (lineObj) {
          lineObj.line = sify(lineObj.line);
        }
      });
    },

    getHits(
      videos,
      terms,
      excludeTerms,
      continua = true,
      convertToSimplified = false,
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

        if (convertToSimplified) {
          this.convertSubLinesToSimplified(hit, sify);
        }

        this.updateHitContexts(hit, termsRegex);
      }

      hits = hits.sort((a, b) =>
        a.rightContext.localeCompare(b.rightContext, "zh-CN")
      );

      return hits;
    },
  });
};
