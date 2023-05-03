var RussianLegacy = (function () {
  var files = [
    {
      name: "adjectives-Table 1.csv",
      pos: "adjective",
      headerColumns: ["gender", "example", "dictionary form"],
      dataColumns: [
        "nominative singular",
        "genitive singular",
        "dative singular",
        "accusative singular",
        "accusative singular (animate)",
        "instrumental singular",
        "prepositional singular",
        "locative singular",
        "nominative plural",
        "genitive plural",
        "dative plural",
        "accusative plural",
        "accusative plural (animate)",
        "instrumental plural",
        "prepositional plural",
      ],
    },
    {
      name: "nouns-Table 1.csv",
      pos: "noun",
      headerColumns: [
        "gender",
        "example",
        "example (animate)",
        "dictionary form",
      ],
      dataColumns: [
        "nominative singular",
        "genitive singular",
        "dative singular",
        "accusative singular",
        "accusative singular (animate)",
        "instrumental singular",
        "prepositional singular",
        "locative singular",
        "nominative plural",
        "genitive plural",
        "dative plural",
        "accusative plural",
        "accusative plural (animate)",
        "instrumental plural",
        "prepositional plural",
      ],
    },
    {
      name: "verbs-present-Table 1.csv",
      pos: "verb (present)",
      headerColumns: ["gender", "number", "example", "infinitive"],
      dataColumns: ["я", "ты", "он/она́/оно́", "мы", "вы", "они́"],
    },
    {
      name: "verbs-past-Table 1.csv",
      pos: "verb (past)",
      headerColumns: ["gender", "number", "example", "infinitive"],
      dataColumns: ["past"],
    },
    {
      name: "prepositions-Table 1.csv",
      pos: "preposition",
      headerColumns: ["case", "meaning"],
      dataColumns: ["preposition"],
    },
  ];

  function removeStress(text) {
    if (text) {
      text = text.replace("а́", "а");
      text = text.replace("е́", "е");
      text = text.replace("и́", "и");
      text = text.replace("о́", "о");
      text = text.replace("у́", "у");
      text = text.replace("ы́", "ы");
      text = text.replace("э́", "э");
      text = text.replace("ю́", "ю");
      text = text.replace("я́", "я");
      return text;
    }
  }

  function removeStressAndAddParenthesis(text) {
    if (text) {
      text = removeStress(text);
      text = text.replace("[", "([");
      text = text.replace("]", "])");
      return text;
    }
  }

  function search(needle, row, pos, headerColumns, dataColumns) {
    var results = [];
    dataColumns.forEach(function (dataColumn) {
      if (row[dataColumn]) {
        row[dataColumn] = removeStressAndAddParenthesis(row[dataColumn]);
        var regex = new RegExp(row[dataColumn]);
        var matches = needle.match(regex);
        if (matches && matches[0] == needle) {
          var result = Object.assign({}, row);
          headerColumns.forEach(function (headerColumn) {
            result[headerColumn] = row[headerColumn];
          });
          result["match"] = matches[0];
          result["firstGroup"] = matches[1];
          result["type"] = dataColumn;
          result["pos"] = pos;
          results.push(result);
        }
      }
    });
    if (results.length > 0) {
      return results;
    }
  }

  function lookup(ending, files) {
    var messages = [];
    files.forEach(function (file) {
      var rows = file.data;
      rows.forEach(function (row) {
        var results = search(
          ending,
          row,
          file.pos,
          file.headerColumns,
          file.dataColumns
        );
        if (results) {
          results.forEach(function (result) {
            if (result.pos == "noun") {
              var noun = result;
              var dictionaryForm = noun["dictionary form"];
              var example = noun.example;
              if (noun.type.includes("animate")) {
                example = noun["example (animate)"];
              }
              var declinedExample = noun[noun.type + " example"];
              if (noun.firstGroup) {
                dictionaryForm = dictionaryForm.replace(
                  /\[.*\]/,
                  noun.firstGroup
                );
              }
              messages.push(
                '<span class="noun">the <b>' +
                  noun.type +
                  "</b> form of a " +
                  noun.gender +
                  " <b>-" +
                  dictionaryForm +
                  "</b> noun (" +
                  example +
                  " → " +
                  declinedExample +
                  ")</span>"
              );
            }
            if (result.pos == "adjective") {
              var adjective = result;
              var dictionaryForm = adjective["dictionary form"];
              if (adjective.firstGroup) {
                dictionaryForm = dictionaryForm.replace(
                  /\[.*\]/,
                  adjective.firstGroup
                );
              }
              var genderOrNumber = "";
              if (adjective["number"] == "plural") {
                genderOrNumber = adjective.number;
              } else {
                genderOrNumber = adjective.gender;
              }

              messages.push(
                '<span class="adjective">the <b>' +
                  adjective.type +
                  " " +
                  genderOrNumber +
                  "</b> form of an <b>-" +
                  dictionaryForm +
                  " " +
                  "</b> adjective</span>"
              );
            }
            if (result.pos == "verb (present)") {
              var verb = result;
              var dictionaryForm = verb["infinitive"];
              if (verb.firstGroup) {
                dictionaryForm = dictionaryForm.replace(
                  /\[.*\]/,
                  verb.firstGroup
                );
              }
              messages.push(
                '<span class="verb">the <b>' +
                  verb.type +
                  "</b> form of a <b>-" +
                  dictionaryForm +
                  "</b> verb</span>"
              );
            }
            if (result.pos == "verb (past)") {
              var verb = result;
              var dictionaryForm = verb["infinitive"];
              if (verb.firstGroup) {
                dictionaryForm = dictionaryForm.replace(
                  /\[.*\]/,
                  verb.firstGroup
                );
              }
              if (verb["gender"] == "any") {
                verb["gender"] = "";
              }
              messages.push(
                '<span class="verb">the <b>' +
                  verb.type +
                  "</b> form of a <b>-" +
                  dictionaryForm +
                  " verb</b> (" +
                  verb["gender"] +
                  " " +
                  verb["number"] +
                  ")</span>"
              );
            }
          });
        }
      });
    });
    messages.sort();
    return messages;
  }

  function lookupPrepositions(ending, files) {
    var messages = [];
    files.forEach(function (file) {
      if (file.pos == "preposition") {
        var rows = file.data;
        rows.forEach(function (row) {
          if (row.preposition.includes(ending)) {
            var message =
              "<b>" +
              row.preposition +
              "</b> + " +
              row.case +
              ": <em>" +
              row.meaning +
              "</em>";
            messages.push(message);
          }
        });
      }
    });
    messages.sort();
    return messages;
  }

  function process(index) {
    var ending = $("#search-field-" + index).val();
    let messages = lookup(ending, files);
    $(".result-list-" + index).html("");
    $(".result-heading-" + index).html(
      '<p>A word ending in <b>"-' + ending + '"</b> can be: </p>'
    );
    messages.forEach(function (message) {
      $(".result-list-" + index).append(
        '<li class="result-item">' + message + "</li>"
      );
    });
  }

  function processPrepositions(index) {
    var ending = $("#search-field-" + index).val();
    let messages = lookupPrepositions(ending, files);
    $(".result-list-" + index).html("");
    messages.forEach(function (message) {
      $(".result-list-" + index).append(
        '<li class="result-item">' + message + "</li>"
      );
    });
  }

  function formatExampleSentenceHtml(types, data) {
    types.forEach(function (type) {
      data.forEach(function (row) {
        var example = row.example;
        if (type.includes("animate")) {
          example = row["example (animate)"];
        }
        var typeExample = row[type + " example"];
        if (typeExample) {
          var exampleSentence = row[type + " example sentence"];
          var blank =
            '<span class="blank" data-type="' +
            type +
            '"><span class="question"><b>' +
            example +
            "</b> + " +
            type +
            '</span><span class="answer transparent"><b>' +
            typeExample +
            "</b></span></span>";
          exampleSentenceHTML = removeStressAndAddParenthesis(
            exampleSentence
          ).replace(
            new RegExp(removeStressAndAddParenthesis(typeExample), "i"),
            blank
          );
          row[type + " example sentence html"] = exampleSentenceHTML;
        }
      });
    });
    return data;
  }

  function speakRussian(text) {
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru";
    speechSynthesis.speak(utterance);
  }

  function addBlankEventHandlers() {
    $(".blank").click(function () {
      $(this).toggleClass("answered");
      $(this).find(".question").toggleClass("transparent");
      $(this).find(".answer").toggleClass("transparent");
      var answer = $(this).find(".answer").text();
      speakRussian(answer);
    });
  }

  function loadAllCsvsThen(callback) {
    var loaded = 0;
    files.forEach(function (file) {
      Papa.parse(
        "https://server.chinesezerotohero.com/data/russian-grammar/" +
          file.name,
        {
          download: true,
          header: true,
          complete: function (results) {
            loaded++;
            file.data = results.data;
            if (loaded == files.length) {
              callback(files);
            }
          },
        }
      );
    });
  }

  function getFileByPos(pos) {
    var result;
    files.forEach(function (file) {
      if (file.pos === pos) {
        result = file;
      }
    });
    return result;
  }

  function getHintText(row) {
    var adjEnding = row.adjDictForm.replace(/\[.*\]/, "");
    var nounEnding = row.nounDictForm.replace(/\[.*\]/, "");
    if (nounEnding == "") {
      nounEnding += "ø";
    }
    return (
      "<b>" +
      adjEnding +
      "</b> adjective + " +
      " <b>" +
      nounEnding +
      "</b> " +
      row.gender +
      " noun"
    );
  }

  function markCases(text, adjTable, nounTable) {
    // goes through a table that converts regex pattern to case/number combos
    var endingComboTable = makeEndingComboTable(adjTable, nounTable);
    endingComboTable.forEach(function (row) {
      var pattern =
        "([\\wа-я]+" +
        removeStress(row.adjectiveEnding) +
        ") ([\\wа-я]+" +
        removeStress(row.nounEnding) +
        ")([^\\wа-я])";
      text = text.replace(
        new RegExp(pattern, "ig"),
        "<span class='case-marked' data-case=\"" +
          row.caseNumberCombo +
          '" data-hint="' +
          getHintText(row) +
          '">$1 $2</span>$3'
      );
    });
    endingComboTable.forEach(function (row) {
      var pattern =
        "([\\wа-я]+" +
        removeStress(row.nounEnding) +
        ") ([\\wа-я]+" +
        removeStress(row.adjectiveEnding) +
        ")([^\\wа-я])";
      text = text.replace(
        new RegExp(pattern, "ig"),
        "<span class='case-marked' data-case=\"" +
          row.caseNumberCombo +
          '" data-noun-dict-form="' +
          row.nounDictForm +
          '" data-adj-dict-form="' +
          row.adjDictForm.replace(/\[.*\]/, "") +
          '" data-hint="' +
          getHintText(row) +
          '">$1 $2</span>$3'
      );
    });
    return text;
  }

  function caseMarkedOver(event) {
    event.stopPropagation();
    let messages = [
      '<span data-case="' +
        $(this).attr("data-case") +
        '">' +
        $(this).attr("data-case") +
        "</span>: " +
        $(this).attr("data-hint"),
    ];
    $(this)
      .parents(".case-marked")
      .each(function () {
        messages.push(
          '<span data-case="' +
            $(this).attr("data-case") +
            '">' +
            $(this).attr("data-case") +
            "</span>: " +
            $(this).attr("data-hint")
        );
      });
    let $ul = $("<ul></ul>");
    messages.forEach(function (message) {
      $ul.append($("<li>" + message + "</li>"));
    });
    showPopup($ul.html(), this);
  }

  function showPopup(html, element) {
    let $popup = $("#popup");
    $popup.html(html);
    var rect = element.getBoundingClientRect();
    $popup.css("top", rect.bottom);
    $popup.css("left", rect.left);
    $popup.removeClass("hidden");
  }
  /**
   * Removes duplicates in the array if all the fields match
   */
  function removeDuplicates(array, fields) {
    var uniques = [];
    // Cycle through the array
    array.forEach(function (item) {
      // See if we've seen it, if we haven't seen it, push it to uniques[]
      var seen = uniques.find(function (element, index, array) {
        // check each fields
        var m = true;
        fields.forEach(function (field) {
          m = m && item[field] == element[field];
        });
        return m;
      });
      if (!seen) {
        uniques.push(item);
      }
    });
    return uniques;
  }

  function makeEndingComboTable(adjTable, nounTable) {
    var nounFile = getFileByPos("noun");
    var caseNumberCombos = nounFile.dataColumns;
    var genders = ["masculine", "feminine", "neuter"];
    var table = [];
    caseNumberCombos.forEach(function (caseNumberCombo) {
      genders.forEach(function (gender) {
        adjTable.forEach(function (adjRow) {
          if (adjRow.gender === gender) {
            nounTable.forEach(function (nounRow) {
              if (nounRow.gender === gender) {
                let resultRow = {
                  gender: gender,
                  caseNumberCombo: caseNumberCombo,
                  nounEnding: nounRow[caseNumberCombo],
                  adjectiveEnding: adjRow[caseNumberCombo],
                  nounDictForm: nounRow["nominative singular"],
                  adjDictForm: adjRow["nominative singular"],
                };
                table.push(resultRow);
              }
            });
          }
        });
      });
    });
    // return table;
    return removeDuplicates(table, [
      "adjectiveEnding",
      "nounEnding",
      "caseNumberCombo",
    ]);
  }
})();
