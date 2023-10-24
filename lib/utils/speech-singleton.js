import Speech from "speak-tts";

class SpeechSingleton {
  constructor() {
    this.speech = new Speech();
    this.utterance = null;
  }

  async init(langCode) {
    await this.speech.init({ lang: langCode });
  }

  getVoices(langCode) {
    let speechSynthesis = window?.speechSynthesis;
    if (!speechSynthesis) return;
    let voices = speechSynthesis
      .getVoices()
      .filter(
        (voice) =>
          voice.lang.startsWith(langCode) &&
          !voice.name.includes("Siri")
      );
    return voices;
  }


  speak({l2, text, voice, rate = 1}) {
    return new Promise((resolve, reject) => {
      if (window && window.speechSynthesis) {
        let speechSynthesis = window.speechSynthesis;
  
        if (speechSynthesis.paused) {
          if (this.utterance) {
            this.utterance.onend = undefined;
          }
          speechSynthesis.cancel();
        }
  
        if (!voice) {
          const voices = this.getVoices(l2.code);
          voice = voices[0];
        }
  
        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.rate = rate;
        this.utterance.voice = voice;
  
        // Handle the end of speech
        this.utterance.onend = () => {
          resolve();  // Resolve the promise when speaking is done
        };
  
        // Handle any errors that occur during speech
        this.utterance.onerror = (event) => {
          reject(event.error);  // Reject the promise with the error
        };
  
        speechSynthesis.speak(this.utterance);
      } else {
        reject(new Error("Speech synthesis not supported"));
      }
    });
  }  
}

let instance;

// Export a getter function to get the singleton instance.
export default {
  get instance() {
    if (!instance) {
      instance = new SpeechSingleton();
    }
    return instance;
  }
};
