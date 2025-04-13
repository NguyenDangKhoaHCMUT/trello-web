import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'

import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'

import { fetchBoardDetailsAPI, createNewColumnAPI, createNewCardAPI } from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao là chúng ta
    // sẽ sử dụng react-router-dom để lấy boardId từ URL
    const boardId = '67fa8ea8c613601fec509f3a'
    // Call API
    fetchBoardDetailsAPI(boardId)
      .then((board) => {
        // Cần xử lý vấn đề kéo thả vào một Column rỗng (nhớ lại video 37.2, code hiện tại là vid 69)
        board.columns.forEach((column) => {
          if (isEmpty(column.cards)) {
            column.cards = [generatePlaceholderCard(column)] // Tạo ra một card đặc biệt để kéo thả vào
            column.cardOrderIds = [generatePlaceholderCard(column)._id] // Tạo ra một cardOrderIds rỗng để kéo thả vào
          }
        })
        setBoard(board)
      })
  }, [])

  // Function này có nhiệm vụ gọi API tạo mới Column và làm lại dữ liệu State board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id // Gán boardId vào dữ liệu tạo mới Column
    })

    // Cần xử lý vấn đề kéo thả vào một Column rỗng (nhớ lại video 37.2, code hiện tại là vid 69)
    createdColumn.cards = [generatePlaceholderCard(createdColumn)] // Tạo ra một card đặc biệt để kéo thả vào
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id] // Tạo ra một cardOrderIds rỗng để kéo thả vào

    // Cập nhật lại state board
    /**
     * Phía FE chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lạ API fetchBoardDetailsAPI)
     * để lấy lại dữ liệu board mới nhất
     * Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ Board
     * dù đây có là api tạo Column hay Card đi chăng nữa => lúc này FE sẽ nhàn hơn
     */
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn) // Thêm Column mới vào Board
    newBoard.columnOrderIds.push(createdColumn._id) // Thêm ColumnId mới vào cuối ColumnOrderIds
    setBoard(newBoard) // Cập nhật lại state board
  }

  // Function này có nhiệm vụ gọi API tạo mới Card và làm lại dữ liệu State board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id // Gán boardId vào dữ liệu tạo mới Column
    })

    // Cập nhật lại state board
    /**
     * Phía FE chúng ta phải tự làm đúng lại state data board (thay vì phải gọi lạ API fetchBoardDetailsAPI)
     * để lấy lại dữ liệu board mới nhất
     * Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ Board
     * dù đây có là api tạo Column hay Card đi chăng nữa => lúc này FE sẽ nhàn hơn
     */
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(c => c._id === newCardData.columnId) // Tìm Column cần cập nhật
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard) // Thêm Card mới vào Column
      columnToUpdate.cardOrderIds.push(createdCard._id) // Thêm CardId mới vào cuối CardOrderIds
    }
    setBoard(newBoard) // Cập nhật lại state board
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board}/> {/* Optional Chaning */}
      <BoardContent board={board} createNewColumn={createNewColumn} createNewCard={createNewCard}/>
    </Container>
  )
}

export default Board
