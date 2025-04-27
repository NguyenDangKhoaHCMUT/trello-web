import { useEffect } from 'react'
import Container from '@mui/material/Container'

import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'

import {
  updateBoardDetailsAPI,
  updateColumnDetailsAPI,
  moveCardToDifferentColumnAPI
} from '~/apis'
import { cloneDeep } from 'lodash'

import Reload from '~/customReloadPage/reload'
import Box from '@mui/material/Box'

import {
  fetchBoardDetailsAPI,
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'

import { useDispatch, useSelector } from 'react-redux'

import { useParams } from 'react-router-dom'

function Board() {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard) // Lấy dữ liệu board từ redux store

  const { boardId } = useParams()


  useEffect(() => {
    // Call API
    dispatch(fetchBoardDetailsAPI(boardId))
  }, [dispatch, boardId])


  // Function này có nhiệm vụ gọi API cập nhật lại thứ tự các Column khi kéo thả Column xong xuôi
  // và làm lại dữ liệu State board
  // Chỉ cần gọi API để cập nhật mảng columnOrderIds của Board chứa nó (thay đổi vị trí trong mảng)
  const moveColumns = (dndOrderedColumns) => {
    // Cập nhật lại cho chuẩn dữ liệu state board
    const dndOrderedColumnsIds = dndOrderedColumns.map(column => column._id)

    /**
     * TH này dùng Spead Operator lại không sao bởi vì ở đây chúng ta không dùng push như ở trên
     * làm thay đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds
     * bằng 2 mảng mới. Tương tự như cách làm concat ở Th createNewColumn thôi
     */
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns // Cập nhật lại danh sách Column trong Board
    newBoard.columnOrderIds = dndOrderedColumnsIds // Cập nhật lại danh sách ColumnId trong Board
    // console.log(newBoard)
    // setBoard(newBoard) // Cập nhật lại state board
    dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

    // Gọi API cập nhật lại thứ tự các Column
    updateBoardDetailsAPI(newBoard._id, {
      columnOrderIds: dndOrderedColumnsIds
    })
  }

  // Khi di chuyển Card trong cùng một Column:
  // Chỉ cần gọi API để cập nhật mảng cardOrderIds của Column chứa nó (thay đổi vị trí trong mảng)
  const moveCardInTheSameColumn = (dndOrderedCards, dndOrderedCardsIds, columnId) => {
    // Update lại cho chuẩn dữ liệu state board

    /**
     * Cannot assign to read only property 'cards' of object
     * TH Immutability này ở đây đã đụng tới giá trị cards đang đc coi là chỉ đọc (read only) - (nested object - can thiệp sâu dữ liệu)
     */
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board) // Dùng hàm cloneDeep của lodash để deep copy toàn bộ Board
    const columnToUpdate = newBoard.columns.find(c => c._id === columnId) // Tìm Column cần cập nhật
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards // Cập nhật lại danh sách Card trong Column
      columnToUpdate.cardOrderIds = dndOrderedCardsIds // Cập nhật lại danh sách CardId trong Column
    }
    // setBoard(newBoard) // Cập nhật lại state board
    dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

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
    // Tương tự như hàm moveColumns, chỗ này không ảnh hưởng Rule Immutability của redux toolkit
    const newBoard = { ...board }
    newBoard.columns = dndOrderedColumns // Cập nhật lại danh sách Column trong Board
    newBoard.columnOrderIds = dndOrderedColumnsIds // Cập nhật lại danh sách ColumnId trong Board
    // setBoard(newBoard) // Cập nhật lại state board
    dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

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


  if (!board) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        height: '100vh'
      }}>
        <Reload />
      </Box>
    )
  }
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board}/> {/* Optional Chaning */}
      <BoardContent
        board={board}

        // 3 TH dưới đây đã sử dụng Redux để xử lý ở các component con, không cần phải truyền xuống nữa
        // createNewColumn={createNewColumn}
        // createNewCard={createNewCard}
        // deleteColumnDetails={deleteColumnDetails} // Xóa Column và Cards bên trong nó

        // 3 cái Trường hợp move dưới đây thì giữ nguyên để xử lý kéo thả ở phần BoardContent
        // không bị quá dài mất kiểm soát khi đọc code, maintain
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
      />
    </Container>
  )
}

export default Board
