import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

import { useState } from 'react'

import TextField from '@mui/material/TextField'
import CloseIcon from '@mui/icons-material/Close'

import { toast } from 'react-toastify'

// The <SortableContext> component requires that you pass it the sorted array of
// the unique identifiers associated to each sortable item via the items prop.
// This array should look like ["1", "2", "3"], not [{id: "1"}, {id: "2}, {id: "3}].
// All you have to do is map your items array to an array of strings that represent the unique identifiers for each item:
// https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512
// Nếu không đúng thì vẫn kéo thả được nhưng không có hiệu ứng animation

function ListColumns({ columns, createNewColumn, createNewCard }) {
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

    // Tạo dữ liệu Column để gọi API
    const newColumnData = {
      title: newColumnTitle
    }
    /**
     * Gọi lên props function createNewColumn nằm ở component cha cao nhất (board/_id.jsx)
     * Lưu ý: Về sau ở học phần MERN Stack Advanced thì chúng ta sẽ đưa dữ liệu Board ra ngoài Redux Global State
     * và lúc này chúng ta có thể gọi API luon ở đây là xong thay vì phải lần lượt gọi ngược lên những
     * component cha phía bên trên (Đối với component con nằm càng sâu thì càng khổ)
     * Việc sử dụng Redux như vậy thì code sẽ Clean chuẩn chỉnh hơn rất nhiều
     */
    await createNewColumn(newColumnData)

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
          <Column key={column._id} column={column} createNewCard={createNewCard}/>
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
