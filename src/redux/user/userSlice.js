import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'
import { toast } from 'react-toastify'

// Khởi tạo giá trị State của 1 cái Slice trong redux
const initialState = {
  currentUser: null
}

// Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng MiddleWare createAsyncThunk
// đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const loginUserAPI = createAsyncThunk (
  'user/loginUserAPI', // cách đặt tên giống doc của redux
  async (data) => {
    const response = await authorizeAxiosInstance.post(`${API_ROOT}/v1/users/login`, data)
    // Lưu ý: authorizeAxiosInstance sẽ trả về kết quả qua property của nó là data
    return response.data
  }
)

export const logoutUserAPI = createAsyncThunk (
  'user/logoutUserAPI', // cách đặt tên giống doc của redux
  async (showSucessMessage = true) => {
    const response = await authorizeAxiosInstance.delete(`${API_ROOT}/v1/users/logout`)

    if (showSucessMessage) {
      toast.success('Log out successfully!')
    }

    // Lưu ý: authorizeAxiosInstance sẽ trả về kết quả qua property của nó là data
    return response.data
  }
)

export const updateUserAPI = createAsyncThunk (
  'user/updateUserAPI', // cách đặt tên giống doc của redux
  async (data) => {
    const response = await authorizeAxiosInstance.put(`${API_ROOT}/v1/users/update`, data)
    // Lưu ý: authorizeAxiosInstance sẽ trả về kết quả qua property của nó là data
    return response.data
  }
)

// Khởi tạo một slice trong kho lưu trữ - redux store
export const userSlice = createSlice({
  name: 'user',
  initialState,
  // Reducers: là nơi xử lý dữ liệu đồng bộ
  reducers: {},
  // ExtraReducers: là nơi xử lý dữ liệu bất đồng bộ (các action gọi API)
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(loginUserAPI.fulfilled, (state, action) => {
      // Update lại dữ liệu của cái currentActiveBoard
      state.currentUser = action.payload
    })
    builder.addCase(logoutUserAPI.fulfilled, (state) => {
      /**
       * API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
       * Kết hợp với ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang Login
       */
      state.currentUser = null
    })
    builder.addCase(updateUserAPI.fulfilled, (state, action) => {
      state.currentUser = action.payload
    })
  }
})

// Actions: là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu
// thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions nào cả, bởi vì những cái actions này đơn giản là được
// thằng redux tạo tự động theo tên của reducer nhé
// export const {  } = userSlice.actions

// Selectors: là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentUser = (state) => {
  return state.user.currentUser
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, LƯU Ý
export const userReducer = userSlice.reducer