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
import { mapOrder } from '~/utils/sorts'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Column({ column, createNewCard }) {
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

  // Sắp xếp lại thứ tự của các card trong column theo thứ tự đã được lưu trong DB
  const orderedCards = mapOrder(column?.cards, column?.cardOrderIds, '_id')
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

    /**
     * Gọi lên props function createNewCard nằm ở component cha cao nhất (board/_id.jsx)
     * Lưu ý: Về sau ở học phần MERN Stack Advanced thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global State
     * và lúc này chúng ta có thể gọi API luon ở đây là xong thay vì phải lần lượt gọi ngược lên những
     * component cha phía bên trên (Đối với component con nằm càng sâu thì càng khổ)
     * Việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
     */
    await createNewCard(newCardData)

    // Đóng trạng thái thêm Card mới và clear input
    toggleNewCardForm()
    setnewCardTitle('')
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
              MenuListProps={{
                'aria-labelledby': 'basic-button-dropdown"'
              }}
            >
              <MenuItem>
                <ListItemIcon>
                  <AddCardIcon fontSize="small" />
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
              <MenuItem>
                <ListItemIcon>
                  <DeleteForeverIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Remove this column</ListItemText>
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
