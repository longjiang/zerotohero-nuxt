importScripts('../js/inflectors/base-inflector.js');

class PatternInflector extends BaseInflector {
  
  async inflect(lemma) {    
    let langCode = this.l2["iso639-3"] || this.l2["glottologId"];
    if (langCode === "nor") langCode = "nob"; // Use Bokmål for Norwegian

    let inflected = this.loadFromServerCache(lemma); // L2 is taken care of in the base class
    if (!inflected) { 
      let url = `${PYTHON_SERVER}inflect-pattern?lang=${langCode}&lemma=${encodeURIComponent(lemma)}`;
      try {
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        inflected = await response.json();
      } catch (error) {
        console.error(error);
      }
    }
    
    return inflected;
  }
}

