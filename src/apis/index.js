import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

/**
 * Lưu ý: Đối với việc sử dụng axios ở khóa Mern Stack Pro
 * Tất cả các function bên dưới các bạn sẽ thấy mình chỉ request lấy data từu response luôn, mà không có try catch
 * hay then catch gì để bắt lỗi
 * Lý do là vì ở phía FE chúng ta không cần thiết làm như vậy đối với mọi request bởi nó sẽ gây ra việc
 * dư thừa code catch lỗi quá nhiều
 * Giải pháp Clean Code gọn gàng đó là chúng ta sẽ catch lỗi tập trung tại 1 nơi bằng cách tận dụng một thứ
 * cực kỳ mạnh mẽ trong axios đó là Interceptors
 * Hiểu đơn giản Interceptors là cách mà chúng ta sẽ đánh chặn vào giữa request và response để xử lý logic
 * mà chúng ta muốn
 * (Và ở học phần MERN Stack Advanced nâng cao sẽ dạy cực kì đầy đủ cách xử lý, áp dụng phần này chuẩn chỉnh)
 */

// Board APIs
export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // Lưu ý: axios sẽ trả về kết quả qua property của nó là data
  return response.data
}

export const updateBoardDetailsAPI = async (boardId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/${boardId}`, updateData)
  return response.data
}

export const moveCardToDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/boards/supports/moving_cards`, updateData)
  return response.data
}
// Column APIs
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData)
  // Lưu ý: axios sẽ trả về kết quả qua property của nó là data
  return response.data
}

export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(`${API_ROOT}/v1/columns/${columnId}`, updateData)
  return response.data
}

export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`)
  return response.data
}
// Card APIs
// Board APIs
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData)
  // Lưu ý: axios sẽ trả về kết quả qua property của nó là data
  return response.data
}