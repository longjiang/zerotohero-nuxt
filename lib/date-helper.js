
import moment from 'moment'
import tr from 'timeago-reverse'

export default {
  /**
   * Convert a string representing a date, including the 'ago' format, to a Date object.
   * @param {String} dateStr 
   * @returns 
   */
  parseDate(dateStr) {
    let date
    if (/.*ago$/.test(dateStr)) date = tr.parse(dateStr);
    else {
      let m = moment(dateStr)
      date = m._d
    }
    return date
  },
  /**
   * Format the date for storage in the database.
   * @param {Date} date 
   * @returns 
   */
  unparseDate(date) {
    return moment().format("YYYY-MM-DD HH:mm:ss")
  },
  /**
   * Format the date into a human-readable format.
   * @param {Date} date 
   * @returns 
   */
  formatDate(date) {
    return moment(date).format("LL");
  },
  /**
   * Parse a string in the format of "HH:mm:ss.SS" and return the time in milliseconds.
   * @param {String} hms 
   * @returns 
   */
  parseHMSTime(hms) {
    // 0:00:57.28
    let ms = moment(hms, "HH:mm:ss.SS").diff(
      moment().startOf("day"),
      "milliseconds"
    );
    let s = ms / 1000;
    return s;
  },
}