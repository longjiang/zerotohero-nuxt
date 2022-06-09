export default class {
  constructor(sections, sectionId, eventId) {
    this.sections = sections;
    this.sectionId = sectionId;
    this.eventId = eventId;
  }
  current() {
    return this.sections[this.sectionId].events[this.eventId];
  }
  currentReturnSet() {
    return {
      event: this.current(),
      hash: {
        sectionId: this.sectionId,
        eventId: this.eventId,
      },
    };
  }
  previous() {
    if (this.eventId > 0) {
      this.eventId = Number(this.eventId) - 1;
    } else {
      this.sectionId = Number(this.sectionId) - 1;
      this.eventId = this.sections[this.sectionId].events.length - 1;
    }
    return this.currentReturnSet();
  }
  next() {
    var currentSection = this.sections[this.sectionId];
    if (this.eventId < currentSection.events.length - 1) {
      this.eventId = Number(this.eventId) + 1;
    } else {
      this.sectionId = Number(this.sectionId) + 1;
      this.eventId = 0;
    }
    return this.currentReturnSet();
  }
  index() {
    var sectionsBeforeThisEvent = this.sections.slice(0, this.sectionId);
    var numEventsBeforeThisSection = 0;
    if (sectionsBeforeThisEvent.length > 0) {
      numEventsBeforeThisSection = sectionsBeforeThisEvent.reduce(function (
        a,
        b
      ) {
        return { events: { length: a.events.length + b.events.length } };
      });
      numEventsBeforeThisSection = numEventsBeforeThisSection.events.length;
    }
    var eventsInThisSection = this.sections[this.sectionId].events.length;
    return numEventsBeforeThisSection + this.eventId + 1;
  }
  length() {
    var length = this.sections.reduce(function (a, b) {
      return { events: { length: a.events.length + b.events.length } };
    });
    return length.events.length;
  }
}