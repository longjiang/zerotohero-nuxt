
export const logError = (error, tag) => {
  if (!tag) tag = 'Error'
  if (error.response) {
    let { data, status, headers } = error.response
    console.log(tag, { message: 'Request made and server responded', data, status, headers, response: error.response, error });
  } else if (error.request) {
    console.log(tag, { message: 'The request was made but no response was received', request: error.request, error });
  } else {
    console.log(tag, { message: 'Something happened in setting up the request that triggered an Error' + error.message, status: error.status, error });
  }
}