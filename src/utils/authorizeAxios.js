import axios from 'axios'
import { toast } from 'react-toastify'
import { interceptorLoadingElements } from './formatter'
import { refreshTokenAPI } from '~/apis'
import { logoutUserAPI } from '~/redux/user/userSlice'

/**
* Không thế import { store } from '~/redux/store' theo cách thông thường ở đây
* Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biên redux store ở các file ngoài phạm vi component
như file authorizeAxios hiện tại
* Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi
hàm injectStore ngay lập tức để gán biến mainStore vào biến axiosReduxStore cục bộ trong file này.
* https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
*/

let axiosReduxStore
export const injectStore = mainStore => { axiosReduxStore = mainStore }

// Khởi tạo một đối tượng Axios (authorizeAxiosInstance) mục đích để custom và cấu hình chung cho dự án.
let authorizeAxiosInstance = axios.create()
// Thời gian chờ tối đa của 1 request: để 10p
authorizeAxiosInstance.defaults.timeout = 1000 * 60 * 10

// withCreadentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ việc chúng ta sẽ lưu
// JWT (refresh & access) vào trong httpOnly cookie của trình duyệt)
authorizeAxiosInstance.defaults.withCredentials = true

// Cấu hình Interceptors (Bộ đánh chặn vào giữa mọi Request & Response)
// https://axios-http.com/docs/interceptors

// Interceptor request: Can thiệp vào những cái request API
authorizeAxiosInstance.interceptors.request.use(
  config => {
    // Do something before request is sent
    // Kỹ thuật chặn spam click
    interceptorLoadingElements(true)
    return config
  },
  error => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api
// bị lỗi trước đó.
// https://www.thedutchlab.com/en/insights/using-axios-interceptors-for-refreshing-your-api-token
let refreshTokenPromise = null

// Interceptor response: Can thiệp vào những cái response nhận về
authorizeAxiosInstance.interceptors.response.use(
  response => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    // Kỹ thuật chặn spam click
    interceptorLoadingElements(false)
    return response
  },
  error => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // Mọi mã http status code nằm ngoài khoảng 200 -> 299 se là error và rơi vào

    // Kỹ thuật chặn spam click
    interceptorLoadingElements(false)

    // Quan trọng: Xử lý RefreshToken tự động
    // TH1: Nếu như nhận mã 401 từ BE, thì gọi API đăng xuất luôn
    if (error?.response?.status === 401) {
      axiosReduxStore.dispatch(logoutUserAPI(false))
    }

    // TH2: Nếu như nhận mã 410 từ BE, thì sẽ gọi API refresh token để làm mới lại accesstoken
    // Đầu tiên lấy đc các request API đang bị lỗi thông qua error.config
    const originalRequests = error.config
    // console.log('🚀 ~ originalRequests:', originalRequests)
    if (error?.response?.status === 410 && !originalRequests._retry) {
      originalRequests._retry = true
      // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token đòng thời
      // gán vào cho cái refreshTokenPromise
      if (!refreshTokenPromise) {
        // Đồng thời accessToken đã nằm trong httpOnly cookie (xử lý phía BE)
        refreshTokenPromise = refreshTokenAPI()
          .then(data => {
            return data?.accessToken
          })
          .catch((_error) => {
            // Nếu nhận bất kì lỗi nào từ api refresh token thì cứ logout luôn
            axiosReduxStore.dispatch(logoutUserAPI(false))
            return Promise.reject(_error)
          })
          .finally(() => {
            // Dù API có oke hay lỗi thì vẫn luôn gán lại cái refreshTokenPromise về null như ban đầu
            refreshTokenPromise = null
          })
      }

      // Cần return trường hợp refreshTokenPromise chạy thành công và xử lý thêm ở đây
      // eslint-disable-next-line no-unused-vars
      return refreshTokenPromise.then(accessToken => {
        /**
        * Bước 1: Đối với Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết
        thêm code xử lý ở đây.
        * Hiện tại ở đây không cần bước 1 này vì chúng ta đã đưa accessToken vào cookie (xử lý từ phía BE)
        sau khi api refreshToken được gọi thành công.
        */

        // Bước 2: Bước Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để
        //gọi lại những api ban đầu bị lỗi
        return authorizeAxiosInstance(originalRequests)
      })
    }


    // Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code 1 lần: Clean Code)
    // console.log error ra là sẽ thấy cấu trúc data dẫn tới messge lỗi như dưới đây
    // console.log(error)
    let errrorMsg = error?.message
    if (error?.response?.data?.message) {
      errrorMsg = error?.response?.data?.message

      // Dùng toastify để hiển thị bất kể mọi mã lỗi trên màn hình - Ngoại trừ mã lỗi 410 - GONE phục vụ việc tự
      // động refresh lại token
      if (error?.response?.status !== 410) {
        toast.error(errrorMsg)
      }
    }
    return Promise.reject(error)
  }
)

export default authorizeAxiosInstance
