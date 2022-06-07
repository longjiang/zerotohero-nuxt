
export const randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}
export const randomArrayItem = (array, start = 0, length = false) => {
  length = length || array.length
  array = array.slice(start, length)
  let index = Math.floor(Math.random() * array.length)
  return array[index]
}
export const randBase64 = (length) => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}