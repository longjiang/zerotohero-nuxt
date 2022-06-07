
export const logError = (error, tag) => {
  if (!tag) tag = 'Error'
  if (error.response) {
    // Request made and server responded
    let { data, status, headers } = error.response
    console.log(tag, { data, status, headers });
  } else if (error.request) {
    // The request was made but no response was received
    console.log(tag, { request: error.request });
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log(tag, { message: error.message });
  }
}