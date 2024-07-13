/**
 * Class representing a Language Mapper
 */
class LanguageMapper {
  /**
   * Create a Language Mapper
   * @param {Object} options - Configuration options
   * @param {number} options.minZoom - Minimum zoom level
   * @param {number} options.maxZoom - Maximum zoom level
   */
  constructor(options = {}) {
    this.minZoom = options.minZoom || 3;
    this.maxZoom = options.maxZoom || 9;
    this.magicNumbers = {
      1: 8,
      2: 4,
      3: 2,
      4: 1,
      5: 0.5,
      6: 0.25,
      7: 0.125,
      8: 0.0625,
      9: 0.0375,
    };
    this.magicScale = 2;
  }

  /**
   * Filter languages based on map bounds
   * @param {Array} languages - Array of language objects
   * @param {Object} bounds - Map bounds object
   * @returns {Array} Filtered languages
   */
  filterLanguagesByBounds(languages, bounds) {
    return languages.filter((l) => {
      return (
        l.lat &&
        l.long &&
        l.lat < bounds.northEast.lat &&
        l.lat > bounds.southWest.lat &&
        l.long > bounds.southWest.lng &&
        l.long < bounds.northEast.lng
      );
    });
  }

  /**
   * Filter out overlapping languages based on zoom level
   * @param {Array} languages - Array of language objects
   * @param {number} currentZoom - Current zoom level
   * @returns {Array} Filtered languages
   */
  filterOverlappingLanguages(languages, currentZoom) {
    let filteredLanguages = [...languages];
    for (let language of languages) {
      if (filteredLanguages.includes(language)) {
        filteredLanguages = filteredLanguages
          .filter((l) => {
            let overlapped =
              l !== language &&
              Math.abs(l.lat - language.lat) <
                this.magicNumbers[currentZoom] * this.magicScale &&
              Math.abs(l.long - language.long) <
                this.magicNumbers[currentZoom] * this.magicScale * 3;
            return !overlapped;
          })
          .slice(0, 50);
      }
    }
    return filteredLanguages;
  }

  /**
   * Calculate marker diameter based on number of speakers and zoom level
   * @param {Object} language - Language object
   * @param {number} currentZoom - Current zoom level
   * @returns {number} Marker diameter
   */
  calculateMarkerDiameter(language, currentZoom) {
    return (
      ((Math.sqrt(language.speakers / Math.PI) / Math.pow(10, 3)) *
        Math.pow(currentZoom, 3 - currentZoom * 0.14)) /
      2.5
    );
  }

  /**
   * Calculate zoom level for a language based on number of speakers
   * @param {Object} language - Language object
   * @returns {number} Calculated zoom level
   */
  calculateLanguageZoomLevel(language) {
    const x = language.speakers ? Math.max(Math.log10(language.speakers), 0) : 0;
    return this.maxZoom - ((this.maxZoom - this.minZoom) / 9) * x;
  }

  /**
   * Filter languages based on various criteria
   * @param {Array} languages - Array of language objects
   * @param {Function} hasDictionaryFn - Function to check if a language has a dictionary
   * @param {Function} hasYouTubeFn - Function to check if a language has YouTube content
   * @returns {Array} Filtered languages
   */
  filterLanguages(languages, hasDictionaryFn, hasYouTubeFn) {
    return languages
      .filter((l) => {
        if (!(l.lat && l.long)) return false;
        if (l.name.includes("Sign Language")) return false;
        if (["A", "E", "H"].includes(l.type)) return false;
        if (!hasDictionaryFn(l) && !hasYouTubeFn(l)) return false;
        return true;
      })
      .sort((x, y) => y.speakers - x.speakers);
  }
}

export default LanguageMapper;