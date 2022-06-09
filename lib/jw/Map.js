import Papa from "papaparse";
export default {


  getPlacesCSV() {
    // load place data
    return new Promise((resolve) => {
      Papa.parse("/data/jw/info.openbible.geo.csv", {
        download: true,
        header: true,
        complete: resolve,
      });
    });
  },

  createPlace(item) {
    if (item["Lon"] && item["Lat"]) {
      var place = {
        name: item["#ESV"],
        lon: item["Lon"]
          .replace("~", "")
          .replace("?", "")
          .replace(">", "")
          .replace("<", ""),
        lat: item["Lat"]
          .replace("~", "")
          .replace("?", "")
          .replace(">", "")
          .replace("<", ""),
      };
      switch (item["Lon"].charAt(0)) {
        case "~":
          place.type = "approximate";
          break;
        case ">":
          place.type = "region";
          break;
        case "?":
          place.type = "uncertain";
          break;
        default:
      }
      return place;
    }
  },
}