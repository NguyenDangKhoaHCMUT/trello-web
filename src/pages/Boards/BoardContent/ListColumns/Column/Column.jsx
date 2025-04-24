import { useState } from 'react'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { toast } from 'react-toastify'

import Divider from '@mui/material/Divider'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import ContentCut from '@mui/icons-material/ContentCut'
import ContentCopy from '@mui/icons-material/ContentCopy'
import ContentPaste from '@mui/icons-material/ContentPaste'
import Cloud from '@mui/icons-material/Cloud'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import AddCardIcon from '@mui/icons-material/AddCard'
import DragHandleIcon from '@mui/icons-material/DragHandle'

import ListCards from './ListCards/ListCards'
import theme from '~/theme'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useConfirm } from 'material-ui-confirm'

import {
  updateCurrentActiveBoard,
  selectCurrentActiveBoard
} from '~/redux/activeBoard/activeBoardSlice'

import { useDispatch, useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'

import {
  createNewCardAPI,
  deleteColumnDetailsAPI
} from '~/apis'

function Column({
  column
  // createNewCard,
  // deleteColumnDetails
}) {
  const dispatch = useDispatch()
  // Không dùng State của component nữa mà chuyển qua dùng State của Redux
  // const [board, setBoard] = useState(null)
  const board = useSelector(selectCurrentActiveBoard) // Lấy dữ liệu board từ redux store

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: column._id, data: {
    ...column
  } }) // id = column._id
  const dndKitColumnStyles = {
    // touchAction: 'none', //Dành cho sensor default dạng PointerSensor
    //Nếu sử dụng CSS.transform thì sẽ bị lỗi stretch
    transform: CSS.Translate.toString(transform), // chuyen thanh translate
    transition,
    // Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column dài thì phải
    // kéo ở khu vực giữa rất khó chịu (demo vid 32). Lưu ý lúc này phải kết hợp với {...listeners} ở Box
    // chứ không phải ở div bên ngoài cùng để tránh trường hợp kéo vào vùng xanh
    height: '100%',
    opacity: isDragging ? 0.5 : undefined // Nếu đang kéo thì cho nó mờ đi 50%
  }
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Cards đã được sắp xếp ở trong component cha (board/_id.jsx) rồi (video 71 đã giải thích phần fix bug quan trọng)
  const orderedCards = column.cards
  // phải bọc div ở đây vì vấn đề chiều cao của column khi kéo thả
  // sẽ có bug kiểu flickering (video 32)

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleNewCardForm = () => {
    setOpenNewCardForm(!openNewCardForm)
  }
  const [newCardTitle, setnewCardTitle] = useState('')
  const addNewCard = async () => {
    if (!newCardTitle) {
      toast.error('Please enter Card title', {
        position: 'bottom-right'
      })
      return
    }
    // console.log('newCardTitle: ', newCardTitle)
    // Call API create new Card
    // Tạo dữ liệu Column để gọi API
    const newCardData = {
      title: newCardTitle,
      columnId: column._id // Gán columnId vào dữ liệu tạo mới Card
    }

    // Gọi API tạo mới Card và làm lại dữ liệu State board
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
    // const newBoard = { ...board }

    // Tương tự như hàm createNewColumn, chỗ này dùng CloneDeep để deep copy toàn bộ Board
    const newBoard = cloneDeep(board)
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
    // setBoard(newBoard) // Cập nhật lại state board
    dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

    // Đóng trạng thái thêm Card mới và clear input
    toggleNewCardForm()
    setnewCardTitle('')
  }

  // Xử lý xóa một Column và Cards bên trong nó
  const confirmDeleteColumn = useConfirm()
  const handelDeleteColumn = () => {
    confirmDeleteColumn({
      title: 'Want to delete this column?',
      description: 'This action will delete all cards in this column',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    })
      // Xử lý xóa một Column và Cards bên trong nó
      .then(() => {
        // Cập nhật lại cho chuẩn dữ liệu state board

        // Tương tự như hàm moveColumns, chỗ này không ảnh hưởng Rule Immutability của redux toolkit
        const newBoard = { ...board }
        // Filter trong JS cũng tạo ra mảng mới như concat
        newBoard.columns = newBoard.columns.filter(c => c._id !== column._id) // Xóa Column trong Board
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(id => id !== column._id) // Xóa ColumnId trong Board
        // console.log(newBoard)
        // setBoard(newBoard) // Cập nhật lại state board
        dispatch(updateCurrentActiveBoard(newBoard)) // Cập nhật lại dữ liệu board trong redux store

        // Gọi API xử lý phía BE
        deleteColumnDetailsAPI(column._id)
          .then(res => {
            // console.log("🚀 ~ deleteColumnDetails ~ res:", res)
            toast.success(res?.deleteResult)
          })
      })
      .catch(() => {
        // console.log('Cancel delete column')
      })
  }
  return (
    <div
      ref={setNodeRef}
      style={dndKitColumnStyles}
      {...attributes}
    >
      <Box
        sx={{
          minWidth: 300,
          maxWidth: 300,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : '#ebecf0'),
          ml: 2,
          borderRadius: '6px',
          height: 'fit-content',
          maxHeight: (theme) => `calc(${theme.trello.boardContentHeight} - ${theme.spacing(5)})`
        }}
        {...listeners}
      >
        {/* Header column */}
        <Box sx={{
          height: theme.trello.columnHeaderHeight,
          p: 2,
          display: 'flex',
          alignItems: 'center', // canh giua theo chieu doc
          justifyContent: 'space-between' // theo chieu ngang
        }}>
          <Typography variant='h6'
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {/* Nhấp vào thẻ column title sẽ đổi tên thẻ */}
            {column.title}
          </Typography>
          <Box>
            <Tooltip title="More options">
              <ExpandMoreIcon
                sx={{
                  color: 'tex.primary',
                  cursor: 'pointer'
                }}
                id="basic-button-dropdown"
                aria-controls={open ? 'basic-menu-column' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              />
            </Tooltip>
            <Menu
              id="basic-menu-column"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button-dropdown"'
              }}
            >
              <MenuItem sx={{
                '&:hover': {
                  color: 'success.light',
                  '& .add-card-icon': {
                    color: 'success.light'
                  }
                }
              }}
              onClick={toggleNewCardForm} // Mở trạng thái thêm Card mới
              >
                <ListItemIcon>
                  <AddCardIcon fontSize="small" className='add-card-icon'/>
                </ListItemIcon>
                <ListItemText>Add new card</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCut fontSize="small" />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <ContentPaste fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paste</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={handelDeleteColumn}
                sx={{
                  '&:hover': {
                    color: 'warning.dark',
                    '& .delete-forever-icon': {
                      color: 'warning.dark'
                    }
                  }
                }}
              >
                <ListItemIcon>
                  <DeleteForeverIcon className='delete-forever-icon' fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete this column</ListItemText>
              </MenuItem>
              <MenuItem>
                <ListItemIcon>
                  <Cloud fontSize="small" />
                </ListItemIcon>
                <ListItemText>Archive this column</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        {/* Box List Card */}
        <ListCards cards={orderedCards} />
        {/* Footer column */}
        <Box sx={{
          height: theme.trello.columnFooterHeight,
          p: 2
        }}>
          {!openNewCardForm
            ? <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button startIcon={<AddCardIcon/>} onClick={toggleNewCardForm}>Add new card</Button>
              <Tooltip title="Drag to move">
                <DragHandleIcon sx={{
                  cursor: 'pointer'
                }} />
              </Tooltip>
            </Box>
            : <Box sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TextField
                label="Enter card title..."
                type="text"
                size='small'
                variant='outlined'
                autoFocus
                data-no-dnd='true'
                value={newCardTitle}
                onChange={(e) => setnewCardTitle(e.target.value)}
                sx={{
                  // label khi khong focus thi co mau ...,
                  '& label': {
                    color: 'text.primary'
                  },
                  // khi input thi mau chu ...
                  '& input': {
                    color: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#333643' : 'white')
                  },
                  // label khi focus thi co mau ...,
                  '& label.Mui-focused': {
                    color: (theme) => theme.palette.primary.main
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { //khi focus thi border co mau ...,
                      borderColor: (theme) => theme.palette.primary.main
                    },
                    '&: hover fieldset': { //khi focus thi border co mau ...,
                      borderColor: (theme) => theme.palette.primary.main
                    },
                    '&.Mui-focused fieldset': { //khi focus thi border co mau ...,
                      borderColor: (theme) => theme.palette.primary.main
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    borderRadius: 1
                  }
                }}
              />
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Button
                  data-no-dnd='true'
                  onClick={addNewCard}
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
                  }}>Add</Button>
                <CloseIcon
                  fontSize='small'
                  sx={{
                    color: (theme) => theme.palette.warning.light,
                    cursor: 'pointer'
                  }}
                  onClick={toggleNewCardForm} // Đóng trạng thái thêm Card mới và clear input
                />
              </Box>
            </Box>
          }
        </Box>
      </Box>
    </div>
  )
}

export default Column
