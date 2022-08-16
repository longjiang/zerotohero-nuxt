
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
    return moment(date).format("YYYY-MM-DD HH:mm:ss")
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
/**
 * Render a time in seconds in the "HH:mm:ss" format.
 * https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
 * @param {Number} time time in seconds
 * @returns 
 */
export const toHHMMSS = (time) => {
  var sec_num = parseInt(time, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  if (hours > 0) return hours + ':' + minutes + ':' + seconds;
  return minutes + ':' + seconds;
}