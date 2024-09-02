// @/lib/language-mapper.js

/**
 * Class representing a Language Mapper for managing language data on a map
 */
class LanguageMapper {
  /**
   * Create a Language Mapper
   * @param {Object} options - Configuration options
   * @param {number} options.minZoom - Minimum zoom level for the map
   * @param {number} options.maxZoom - Maximum zoom level for the map
   */
  constructor(options = {}) {
    // Set minimum and maximum zoom levels for the map
    this.minZoom = options.minZoom || 3;
    this.maxZoom = options.maxZoom || 9;

    // Magic numbers for controlling marker overlap at different zoom levels
    // These values determine the spacing between markers
    this.magicNumbers = {
      1: 8,   // At zoom level 1, markers should be 8 units apart
      2: 4,   // At zoom level 2, markers should be 4 units apart
      3: 2,
      4: 1,
      5: 0.5,
      6: 0.25,
      7: 0.125,
      8: 0.0625,
      9: 0.0375, // At zoom level 9, markers can be very close (0.0375 units apart)
    };

    // Additional scaling factor for marker spacing
    this.magicScale = 2.9;
  }

  setMagicScale(scale) {
    this.magicScale = scale;
  }

  /**
   * Filter languages based on current map bounds
   * This ensures only languages within the visible map area are processed
   * 
   * @param {Array} languages - Array of language objects
   * @param {Object} bounds - Map bounds object with northEast and southWest coordinates
   * @returns {Array} Filtered languages within the current map bounds
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
   * This prevents cluttering of markers in densely populated language areas
   * 
   * @param {Array} languages - Array of language objects
   * @param {number} currentZoom - Current zoom level of the map
   * @returns {Array} Filtered languages with reduced overlap
   */
  filterOverlappingLanguages(languages, currentZoom) {
    let filteredLanguages = [...languages];
    for (let language of languages) {
      if (filteredLanguages.includes(language)) {
        filteredLanguages = filteredLanguages
          .filter((l) => {
            // Calculate if two languages are too close based on current zoom level
            let overlapped =
              l !== language &&
              Math.abs(l.lat - language.lat) <
                this.magicNumbers[currentZoom] * this.magicScale &&
              Math.abs(l.long - language.long) <
                this.magicNumbers[currentZoom] * this.magicScale * 3;
            return !overlapped;
          })
          // Add a slice to this list here if performance is an issue
      }
    }
    return filteredLanguages;
  }

  /**
   * Calculate marker diameter based on number of speakers and zoom level
   * This creates a visual representation of language prominence on the map
   * 
   * @param {Object} language - Language object with a 'speakers' property
   * @param {number} currentZoom - Current zoom level of the map
   * @returns {number} Marker diameter in pixels
   */
  calculateMarkerDiameter(language, currentZoom) {
    // Base the diameter on the square root of speakers for a more balanced scale
    // Adjust based on zoom level to maintain visibility at different zoom levels
    return (
      ((Math.sqrt(language.speakers / Math.PI) / Math.pow(10, 3)) *
        Math.pow(currentZoom, 3 - currentZoom * 0.14)) /
      2.5
    );
  }

  /**
   * Calculate appropriate zoom level for a language based on number of speakers
   * This is used when flying to a specific language on the map
   * 
   * @param {Object} language - Language object with a 'speakers' property
   * @returns {number} Calculated zoom level
   */
  calculateLanguageZoomLevel(language) {
    // Use log scale of speakers to determine zoom level
    const x = language.speakers ? Math.max(Math.log10(language.speakers), 0) : 0;
    // A magic number, higher the number the higher the zoom level
    const magicNumber = 12;
    // Interpolate between min and max zoom based on speaker count
    const zoomLevel = this.maxZoom - ((this.maxZoom - this.minZoom) / magicNumber) * x;
    return Math.ceil(zoomLevel);
  }

  /**
   * Filter languages based on various criteria
   * This is used for initial language filtering when populating the map
   * 
   * @param {Array} languages - Array of all language objects
   * @param {Function} hasDictionaryFn - Function to check if a language has a dictionary
   * @param {Function} hasYouTubeFn - Function to check if a language has YouTube content
   * @returns {Array} Filtered and sorted languages
   */
  filterLanguages(languages, hasDictionaryFn, hasYouTubeFn) {
    return languages
      .filter((l) => {
        if (!(l.lat && l.long)) return false; // Exclude languages without coordinates
        if (l.name.includes("Sign Language")) return false; // Exclude sign languages
        if (["A", "E", "H"].includes(l.type)) return false; // Exclude certain language types
        if (!hasDictionaryFn(l) && !hasYouTubeFn(l)) return false; // Exclude languages without dictionary or YouTube content
        return true;
      })
      .sort((x, y) => y.speakers - x.speakers); // Sort by number of speakers, descending
  }
}

export default LanguageMapper;