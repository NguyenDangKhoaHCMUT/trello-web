import Box from '@mui/material/Box'
import Column from './Column/Column'
import Button from '@mui/material/Button'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

// The <SortableContext> component requires that you pass it the sorted array of
// the unique identifiers associated to each sortable item via the items prop.
// This array should look like ["1", "2", "3"], not [{id: "1"}, {id: "2}, {id: "3}].
// All you have to do is map your items array to an array of strings that represent the unique identifiers for each item:
// https://github.com/clauderic/dnd-kit/issues/183#issuecomment-812569512

function ListColumns({ columns }) {
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
          <Column key={column._id} column={column}/>
        ))}


        <Box sx={{
          minWidth: 200,
          maxWidth: 200,
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
      </Box>
    </SortableContext>
  )
}

export default ListColumns
