import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import GroupIcon from '@mui/icons-material/Group'
import ModeCommentIcon from '@mui/icons-material/ModeComment'
import AttachFileIcon from '@mui/icons-material/AttachFile'

import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import theme from '~/theme'

function Card({ card }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card._id, data: {
    ...card
  } }) // id = column._id
  const dndKitCardStyles = {
    // touchAction: 'none', //Dành cho sensor default dạng PointerSensor
    //Nếu sử dụng CSS.transform thì sẽ bị lỗi stretch
    transform: CSS.Translate.toString(transform), // chuyen thanh translate
    transition,
    opacity: isDragging ? 0.5 : undefined, // Nếu đang kéo thì cho nó mờ đi 50%
    border: isDragging? '1px solid #2ecc71' : undefined // Nếu đang kéo thì cho nó có border
  }
  return (
    <MuiCard
      ref={setNodeRef}
      style={dndKitCardStyles}
      {...attributes}
      {...listeners}
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
        overflow: 'unset',
        display: card?.FE_PlaceholderCard ? 'none' : 'block',
        border: '1px solid transparent',
        '&:hover': {
          borderColor: (theme) => theme.palette.primary.main
        }

      }}>
      {card?.cover &&
        <CardMedia
          sx={{ height: 140 }}
          image={card?.cover}
        />
      }
      <CardContent sx={{ p: 1.5, '&:last-child': { p : 1.5 } }}>
        <Typography>{card.title}</Typography>
      </CardContent>
      {
        (card?.memberIds?.length > 0 ||
        card?.comments?.length > 0 ||
        card?.attachments?.length > 0) &&
        <CardActions sx={{ p: '0 4px 8px 4px' }}>
          {card?.memberIds?.length > 0 &&
            <Button size="small" startIcon={<GroupIcon/>}>
              {card?.memberIds?.length}
            </Button>
          }
          {card?.comments?.length > 0 &&
            <Button size="small" startIcon={<ModeCommentIcon/>}>
              {card?.comments?.length}
            </Button>
          }
          {card?.attachments?.length > 0 &&
            <Button size="small" startIcon={<AttachFileIcon/>}>
              {card?.attachments?.length}
            </Button>
          }
        </CardActions>
      }
    </MuiCard>
  )
}

export default Card
