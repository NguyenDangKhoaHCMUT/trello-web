import { useEffect, useState } from 'react'
import Container from '@mui/material/Container'

import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'

import {
  fetchBoardDetailsAPI,
  updateBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI,
  deleteColumnDetailsAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatter'
import { isEmpty } from 'lodash'

import { mapOrder } from '~/utils/sorts'

import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

import { toast } from 'react-toastify'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao là chúng ta
    // sẽ sử dụng react-router-dom để lấy boardId từ URL
    const boardId = '67fa8ea8c613601fec509f3a'
    // Call API
    fetchBoardDetailsAPI(boardId)
      .then((board) => {
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
        // console.log('board: ', board)
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
      // Nếu column rỗng: bản chất là đang chứa placeholderCard, cần xóa nó đi trc khi thêm card mới vào
      if (columnToUpdate.cards.some(card => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard]
        columnToUpdate.cardOrderIds = [createdCard._id] // Thay thế cardOrderIds mới cho Column
      } else {
        // Ngược lại, Column đã có data thì push vào cuối mảng
        columnToUpdate.cards.push(createdCard) // Thêm Card mới vào Column
        columnToUpdate.cardOrderIds.push(createdCard._id) // Thêm CardId mới vào cuối CardOrderIds
      }
    }
    setBoard(newBoard) // Cập nhật lại state board
  }

  // Function này có nhiệm vụ gọi API cập nhật lại thứ tự các Column khi kéo thả Column xong xuôi
  // và làm lại dữ liệu State board
  // Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong mảng)
  const moveColumns = (dndOrderedColumns) => {
    // Cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(column => column._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns // Cập nhật lại danh sách Column trong Board
    newBoard.columnOrderIds = dndOrderedColumnsIds // Cập nhật lại danh sách ColumnId trong Board
    // console.log(newBoard)
    setBoard(newBoard) // Cập nhật lại state board

    // Gọi API cập nhật lại thứ tự các Column
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnsIds
    })
  }

  // Khi di chuyển Card trong cùng một Column:
  // Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardsIds, columnId) => {
    // Update lại cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(c => c._id === columnId) // Tìm Column cần cập nhật
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards // Cập nhật lại danh sách Card trong Column
      columnToUpdate.cardOrderIds = dndOrderedCardsIds // Cập nhật lại danh sách CardId trong Column
    }
    setBoard(newBoard) // Cập nhật lại state board

    // Goi API cập nhật lại thứ tự các Card trong Column
    updateColumnDetailsAPI(columnId, {
      cardOrderIds: dndOrderedCardsIds // Gọi API cập nhật lại thứ tự các Card trong Column
    })
  }


  /**
   * Khi di chuyển Card sang Column khác:
   * B1: Cập nhật lại mảng cardOrderIds của Columnn ban đầu chứa nó (hiểu bản chất là xóa
   * cái _id của Card trong mảng cardOrderIds của Column ban đầu)
   *
   * B2: Cập nhật lại mảng cardOrderIds của Columnn mới chứa nó (hiểu bản chất là thêm
   * cái _id của Card vào mảng cardOrderIds của Column mới)
   *
   * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
   *
   * => Làm một API support riêng
   */
  const moveCardToDifferentColumn = (currentCardId, prevColumnId, nextColumnId, dndOrderedColumns) => {
    const dndOrderedColumnsIds = dndOrderedColumns.map(column => column._id)
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns // Cập nhật lại danh sách Column trong Board
    newBoard.columnOrderIds = dndOrderedColumnsIds // Cập nhật lại danh sách ColumnId trong Board
    setBoard(newBoard) // Cập nhật lại state board

    // Gọi API xử lý phía BE
    let prevCardOrderIds = dndOrderedColumns.find(c => c._id === prevColumnId)?.cardOrderIds
    // Xử lý vấn đề khi kéo card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholderCard,
    // cần xóa nó đi trc khi gửi dữ liệu lên cho phía BE. (Nhớ lại video 37.2, code hiện tại là vid 73)
    if (prevCardOrderIds[0].includes('placeholder-card')) prevCardOrderIds = []

    moveCardToDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find(c => c._id === nextColumnId)?.cardOrderIds
    })
  }

  // Xử lý xóa một Column và Cards bên trong nó
  const deleteColumnDetails = (columnId) => {
    // Cập nhật lại cho chuẩn dữ liệu state board
    const newBoard = { ...board }
    newBoard.columns = newBoard.columns.filter(c => c._id !== columnId) // Xóa Column trong Board
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(id => id !== columnId) // Xóa ColumnId trong Board
    // console.log(newBoard)
    setBoard(newBoard) // Cập nhật lại state board

    // Gọi API xử lý phía BE
    deleteColumnDetailsAPI(columnId)
      .then(res => {
        // console.log("🚀 ~ deleteColumnDetails ~ res:", res)
        toast.success(res?.deleteResult)
      })
  }

  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        width: '100vh',
        height: '100vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board}/> {/* Optional Chaning */}
      <BoardContent
        board={board}

        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        deleteColumnDetails={deleteColumnDetails} // Xóa Column và Cards bên trong nó
      />
    </Container>
  )
}

export default Board
