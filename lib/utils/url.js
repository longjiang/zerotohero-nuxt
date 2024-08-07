
export const absoluteURL = (base, relative) => {
  if (relative.startsWith('http') || relative.startsWith('//')) {
    return relative
  }
  if (relative.startsWith('#')) {
    return base + relative
  }
  if (relative.startsWith('/')) {
    const protocal = base.replace(/(.*):\/\/.*/, '$1')
    const host = base.replace(/.*\/\/([^/]*).*/, '$1')
    return `${protocal}://${host}${relative}`
  }
  var stack = base.split('/'),
    parts = relative.split('/')
  stack.pop() // remove current file name (or empty string)
  // (omit if "base" is the current folder without trailing slash)
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] == '.') continue
    if (parts[i] == '..') stack.pop()
    else stack.push(parts[i])
  }
  return stack.join('/')
}
//https://stackoverflow.com/questions/1714786/query-string-encoding-of-a-javascript-object
export const queryString = (obj) => {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
// https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
export const baseUrl = (url) => {
  var pathArray = url.split( '/' );
  var protocol = pathArray[0];
  var host = pathArray[2];
  var url = protocol + '//' + host;
  return url
}

export const HOST = process.server ? process.env.baseUrl : typeof window !== 'undefined' ? window.location.protocol + '//' + window.location.hostname + ':' + window.location.port : ''