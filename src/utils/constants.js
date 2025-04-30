let apiRoot = ''
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://trello-api-2i61.onrender.com'
}

export const API_ROOT = apiRoot
export const TESTING_ACCOUNT_EMAIL = 'testing@gmail.com'