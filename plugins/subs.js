import { sify } from "chinese-conv";
import Papa from "papaparse";
import he from "he"; // html entities
import Helper from '@/lib/helper'

export default ({ app }, inject) => {
  inject('subs', {
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
        parsed = parsed.filter(line => line.starttime);
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
    unparseSubs(subs, l2 = "en") {
      let lines = subs
        .filter(l => l)
        .map(l => {
          let line = l.line;
          if (["he", "hbo"].includes(l2)) line = this.stripHebrewVowels(line);
          if (l2 === "got") line = he.encode(line);
          let obj = { starttime: l.starttime };
          if (l.duration) obj.duration = l.duration;
          obj.line = line;
          return obj;
        });
      let csv = Papa.unparse(lines);
      return csv;
    },
    unparseNotes(notes) {
      notes = notes.filter(note => note);
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
      convertToSimplified = false
    } = {}) {
      let tv_show = tvShowFilter === "all" ? "nnull" : tvShowFilter.join(",")
      let talk = talkFilter === "all" ? "nnull" : talkFilter.join(",")
      let hits = [];
      terms = terms.map(t => t.replace(/'/g, "&#39;"));
      terms = Helper.mutuallyExclusive(terms) // So if terms are ['dièdres', 'dièdre'], we search only 'dièdre' since results of the plural will be included automatically.
      let timestamp = adminMode ? Date.now() : 0;
      let params = {
        l2Id: langId,
        tv_show,
        talk,
        terms,
        limit,
        timestamp
      }
      let videos = await app.$directus.searchCaptions(params)
      if (
        videos?.length > 0
      ) {
        for (let video of videos) {
          if (video.subs_l2)
            video.subs_l2 = this.parseSavedSubs(video.subs_l2).filter(
              line => line.starttime
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
            apostrophe
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
      convertToSimplified = false
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
            convertToSimplified
          })
        );
      }
      hits = Helper.uniqueByValue(hits, "id");
      if (limit) hits = hits.slice(0, 1000 ); // For device performance
      return hits.sort((a, b) => a.lineIndex - b.lineIndex);
    },

    getHits(
      videos,
      terms,
      excludeTerms,
      continua = true,
      convertToSimplified = false,
      exact = false,
      apostrophe = false
    ) {
      let seenYouTubeIds = [];
      let hits = [];
      let punctuations, punctuationsRegex, boundary, termsStr, regexStr, regex;
      if (exact) {
        punctuations = Helper.characterClass(
          apostrophe ? "PunctuationNoApostropheNoHyphen" : "Punctuation"
        );
        if (continua) {
          punctuations = punctuations + " ";
        }
        punctuationsRegex = new RegExp(`[${punctuations}]`, "g");
        regexStr =
          "^s*(" + terms.map(t => Helper.escapeRegExp(t)).join("|") + ")s*$";
        regex = new RegExp(regexStr, "i");
      } else {
        boundary = continua ? "" : `(^|[^${Helper.characterClass("L")}]+)`;
        termsStr = terms
          .map(t => Helper.escapeRegExp(t))
          .join("|")
          .replace(/\\\*/g, ".+")
          .replace(/[_]/g, ".");
        regexStr = `${boundary}(${termsStr})`;
        regex = new RegExp(regexStr, "i");
      }
      for (let video of videos) {
        if (video && !seenYouTubeIds.includes(video.youtube_id)) {
          seenYouTubeIds.push(video.youtube_id);
          for (let index in video.subs_l2) {
            let line = video.subs_l2[index].line;
            line = he.decode(line).replace(/\n/g, " ");
            let passed = false;
            if (exact) {
              let segs = line
                .replace(punctuationsRegex, "\n")
                .split("\n")
                .map(line => line.replace(/^\s*[-–]\s*/, "").trim())
                .filter(line => line && line !== "");
              for (let seg of segs) {
                let test = regex.test(seg);
                if (test) passed = true;
              }
            } else {
              let notExcluded =
                excludeTerms.length === 0 ||
                !new RegExp(
                  excludeTerms.map(t => Helper.escapeRegExp(t)).join("|"),
                  "i"
                ).test(line);
              passed = regex.test(line) && notExcluded;
            }
            if (passed) {
              hits.push({
                video: video,
                lineIndex: index,
                id: `${video.youtube_id}#${index}`
              });
            }
          }
        }
      }
      let emptyLine = {
        starttime: 0,
        line: ""
      };
      for (let video of videos) {
        let matchedHits = hits.filter(hit => hit.video === video);
        let matchedLineIndexes = matchedHits.map(hit => Number(hit.lineIndex));
        let keptIndexes = video.subs_l2
          .map((l, i) => i)
          .filter(i => {
            for (let index of matchedLineIndexes) {
              if (i > index - 10 && i < index + 10) return true;
            }
          });
        for (let lineIndex in video.subs_l2) {
          if (!keptIndexes.includes(Number(lineIndex))) {
            video.subs_l2[lineIndex] = emptyLine;
          }
        }
      }
      for (let hit of hits) {
        if (convertToSimplified) {
          if (hit.video.subs_l2[hit.lineIndex - 1])
            hit.video.subs_l2[hit.lineIndex - 1].line = sify(
              hit.video.subs_l2[hit.lineIndex - 1].line
            );
          hit.video.subs_l2[hit.lineIndex].line = sify(
            hit.video.subs_l2[hit.lineIndex].line
          );
          if (hit.video.subs_l2[hit.lineIndex + 1])
            hit.video.subs_l2[hit.lineIndex + 1].line = sify(
              hit.video.subs_l2[hit.lineIndex + 1].line
            );
        }

        hit.line = hit.video.subs_l2[hit.lineIndex].line.trim();
        if (!hit.leftContext) {
          let prev = hit.video.subs_l2[hit.lineIndex - 1];
          let regex = new RegExp(
            `(${terms
              .map(t => Helper.escapeRegExp(t))
              .join("|")
              .replace(/[*]/g, ".+")
              .replace(/[_]/g, ".")})(.|\n)*`,
            "gim"
          );

          let leftContext =
            (prev ? prev.line.trim() : "") + hit.line.replace(regex, "");
          hit.leftContext = leftContext
            .split("")
            .reverse()
            .join("")
            .trim();
        }
        if (!hit.rightContext) {
          let next = hit.video.subs_l2[Number(hit.lineIndex) + 1];
          let regex = new RegExp(
            `(.|\n)*(${terms
              .map(t => Helper.escapeRegExp(t))
              .join("|")
              .replace(/[*]/g, ".+")
              .replace(/[_]/g, ".")})`,
            "gim"
          );
          let rightContext =
            hit.line.replace(regex, "").trim() +
            (next && next.line ? next.line.trim() : "");
          hit.rightContext = rightContext;
        }
      }
      hits = hits.sort((a, b) =>
        a.rightContext.localeCompare(b.rightContext, "zh-CN")
      );
      return hits;
    },
  })
}