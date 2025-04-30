import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import { useState } from 'react'

import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

import { toast } from 'react-toastify'

import {
  createNewColumnAPI
} from '~/apis'

import { generatePlaceholderCard } from '~/utils/formatter'
import { cloneDeep } from 'lodash'
import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'
import { useDispatch, useSelector } from 'react-redux'

import { selectCurrentUser } from '~/redux/user/userSlice'
import { TESTING_ACCOUNT_EMAIL } from '~/utils/constants'

// The <SortableContext> component requires that you pass it the sorted array of
// the unique identifiers associated to each sortable item via the items prop.
// This array should look like ["1", "2", "3"], not [{id: "1"}, {id: "2}, {id: "3}].
// All you have to do is map your items array to an array of strings that represent the unique identifiers for each item:
// https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
// Nếu không đúng thì vẫn kéo thả được nhưng không có hiệu ứng animation

function ListColumns({
  columns
  // createNewColumn,
  // createNewCard,
  // deleteColumnDetails
}) {
  const board = useSelector(selectCurrentActiveBoard) // Lấy dữ liệu board từ redux store
  const dispatch = useDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
  }
  const [newColumnTitle, setnewColumnTitle] = useState('')
  const addNewColumn = async () => {
    if (!newColumnTitle) {
      toast.error('Please enter column title')
      return
    }

    if (currentUser.email === TESTING_ACCOUNT_EMAIL) {
      toast.warning('This is just a testing account! You do not have permisson to create new column!')
      return
    }

    // Tạo dữ liệu Column để gọi API
    const newColumnData = {
      title: newColumnTitle
    }

    // gọi API tạo mới Column và làm lại dữ liệu State board
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


    /**
     * Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone ra giá trị newBoard nhưng bản chất
     * cảu spread operator là shallow copy, nên dính phải rule Immutability của redux toolkit không
     * được dùng hàm PUSH (sửa giá trị mảng trực tiếp), cách đơn giản nhanh gọn nhất trong TH này là chúng ta dùng tới
     * deep copy toàn bộ cái Board cho dễ hiểu và code ngắn hơn
     *
     * https://redux-toolkit.js.org/usage/immer-reducers#immutability-and-redux
     */
    // const newBoard = { ...board }
    const newBoard = cloneDeep(board) // Dùng hàm cloneDeep của lodash để deep copy toàn bộ Board
    newBoard.columns.push(createdColumn) // Thêm Column mới vào Board
    newBoard.columnOrderIds.push(createdColumn._id) // Thêm ColumnId mới vào cuối ColumnOrderIds

    /**
     * Ngoài ra, còn một cách nữa là vẫn có thể dùng array.concat thay cho push như docs của redux toolkit ở trên vì
     * push như đã nói là nó sẽ thay đổi giá trị mảng trực tiếp, còn concat thì nó merge - ghép mảng lại và
     * tạo ra một mảng mới để chúng ta gán lại giá trị nên không vấn đề gì
     */
    // const newBoard = { ...board }
    // newBoard.columns = newBoard.columns.concat([createdColumn]) // Thêm Column mới vào Board
    // newBoard.columnOrderIds = newBoard.columnOrderIds.concat([createdColumn._id]) // Thêm ColumnId mới vào cuối ColumnOrderIds

    // Cập nhật dữ liệu Board vào trong Redux Store
    dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

    // Đóng trạng thái thêm Column mới và clear input
    toggleNewColumnForm()
    setnewColumnTitle('')
  }
  return (
    <SortableContext items={ columns?.map(c => c._id) } strategy={horizontalListSortingStrategy}>
      <Box sx={{
        bgcolor: 'inherit',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        '&::-webkit-scrollbar-track': { //track la cai boc scrollbar
          m: 2
        }
      }}>
        {columns?.map(column => (
          <Column
            key={column._id}
            column={column}
            // createNewCard={createNewCard}
            // deleteColumnDetails={deleteColumnDetails}
          />
        ))}

        {!openNewColumnForm
          ? <Box onClick={toggleNewColumnForm} sx={{
            minWidth: 250,
            maxWidth: 250,
            mx: 2,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d'
          }}>
            <Button
              startIcon={<NoteAddIcon/>}
              sx={{
                color: 'white',
                width: '100%',
                justifyContent: 'flex-start',
                pl: 2.5,
                py: 1
              }}
            >
              Add new column
            </Button>
          </Box>
          : <Box sx={{
            minWidth: 250,
            maxWidth: 250,
            mx: 2,
            p: 1,
            borderRadius: '6px',
            height: 'fit-content',
            bgcolor: '#ffffff3d',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <TextField
              label="Enter column title..."
              type="text"
              size='small'
              variant='outlined'
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setnewColumnTitle(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addNewColumn()
                } else if (event.key === 'Escape') {
                  toggleNewColumnForm()
                }
              }}
              sx={{
                // label khi khong focus thi co mau ...,
                '& label': {
                  color: 'white'
                },
                // khi input thi mau chu ...
                '& input': {
                  color: 'white'
                },
                // label khi focus thi co mau ...,
                '& label.Mui-focused': {
                  color: 'white'
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { //khi focus thi border co mau ...,
                    borderColor: 'white'
                  },
                  '&: hover fieldset': { //khi focus thi border co mau ...,
                    borderColor: 'white'
                  },
                  '&.Mui-focused fieldset': { //khi focus thi border co mau ...,
                    borderColor: 'white'
                  }
                }
              }}
            />
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Button
                className='interceptor-loading'
                onClick={addNewColumn}
                variant='contained'
                color='success'
                size='small'
                sx={{
                  boxShadow: 'none',
                  border: '0.5px solid',
                  borderColor: (theme) => theme.palette.success.main,
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.success.main
                  }
                }}>Add Column</Button>
              <CloseIcon
                fontSize='small'
                sx={{
                  color: 'white',
                  cursor: 'pointer',
                  '&:hover': {
                    color: (theme) => theme.palette.warning.light
                  }
                }}
                onClick={toggleNewColumnForm}
              />
            </Box>
          </Box>
        }
      </Box>
    </SortableContext>
  )
}

export default ListColumns
