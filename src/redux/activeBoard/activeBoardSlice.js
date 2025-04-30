import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authorizeAxiosInstance from '~/utils/authorizeAxios'
import { API_ROOT } from '~/utils/constants'

import { generatePlaceholderCard } from '~/utils/formatter'
import { mapOrder } from '~/utils/sorts'
import { isEmpty } from 'lodash'

// Khởi tạo giá trị State của 1 cái Slice trong redux
const initialState = {
  currentActiveBoard: null
}

// Các hành động gọi API (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng MiddleWare createAsyncThunk
// đi kèm với extraReducers
// https://redux-toolkit.js.org/api/createAsyncThunk
export const fetchBoardDetailsAPI = createAsyncThunk (
  'activeBoard/fetchBoardDetailsAPI', // cách đặt tên giống doc của redux
  async (boardId) => {
    const response = await authorizeAxiosInstance.get(`${API_ROOT}/v1/boards/${boardId}`)
    // Lưu ý: authorizeAxiosInstance sẽ trả về kết quả qua property của nó là data
    return response.data
  }
)

// Khởi tạo một slice trong kho lưu trữ - redux store
export const activeBoardSlice = createSlice({
  name: 'activeBoard',
  initialState,
  // Reducers: là nơi xử lý dữ liệu đồng bộ
  reducers: {
    // Lưu ý luôn là ở đây cần cặp ngoặc nhọn cho function trong reducer cho dù code bên trong chỉ có 1
    // dòng, đây là rule của redux
    // https://redux-toolkit.js.org/usage/immer-reducers
    updateCurrentActiveBoard: (state, action) => {
      // action.payload là chuẩn đặt tên nhận dữ liệu vào reducers, ở đây chúng ta gán nó ra một biến có
      // nghĩa hơn
      const board = action.payload

      // Xử lý dữ liệu nếu cần thiết ...

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    }
  },
  // ExtraReducers: là nơi xử lý dữ liệu bất đồng bộ (các action gọi API)
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
      // LƯU Ý: action.payload ở đây chính là response.data mà chúng ta đã trả về từ API
      let board = action.payload

      // Sắp xếp lại thứ tự các columns luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71
      // đã giải thích phần fix bug quan trọng)
      board.columns = mapOrder(board.columns, board.columnOrderIds, '_id')
      board.columns.forEach((column) => {
        // Khi F5 trang web thì cần xử lý vấn đề kéo thả vào một Column rỗng (nhớ lại video 37.2, code hiện tại là vid 69)
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)] // Tạo ra một card đặc biệt để kéo thả vào
          column.cardOrderIds = [generatePlaceholderCard(column)._id] // Tạo ra một cardOrderIds rỗng để kéo thả vào
        }
        else {
          // Sắp xếp lại thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con (video 71
          // đã giải thích phần fix bug quan trọng)
          column.cards = mapOrder(column.cards, column.cardOrderIds, '_id')
        }
      })

      // Update lại dữ liệu của cái currentActiveBoard
      state.currentActiveBoard = board
    })
  }
})

// Actions: là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu
// thông qua reducer (chạy đồng bộ)
// Để ý ở trên thì không thấy properties actions nào cả, bởi vì những cái actions này đơn giản là được
// thằng redux tạo tự động theo tên của reducer nhé
export const { updateCurrentActiveBoard } = activeBoardSlice.actions

// Selectors: là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu từ trong kho redux store ra sử dụng
export const selectCurrentActiveBoard = (state) => {
  return state.activeBoard.currentActiveBoard
}

// Cái file này tên là activeBoardSlice NHƯNG chúng ta sẽ export một thứ tên là Reducer, LƯU Ý
// export default activeBoardSlice.reducer
export const activeBoardReducer = activeBoardSlice.reducer