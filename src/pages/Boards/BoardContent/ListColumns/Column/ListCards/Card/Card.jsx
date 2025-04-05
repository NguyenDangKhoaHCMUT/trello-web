import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import GroupIcon from '@mui/icons-material/Group'
import ModeCommentIcon from '@mui/icons-material/ModeComment'
import AttachFileIcon from '@mui/icons-material/AttachFile'

import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'

function Card({ temporaryHideMedia }) {
  if (temporaryHideMedia) {
    return (
      <MuiCard sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
        overflow: 'unset'
      }}>
        <CardContent sx={{ p: 1.5, '&:last-child': { p : 1.5 } }}>
          <Typography>Card Test 01</Typography>
        </CardContent>
      </MuiCard>
    )
  }
  return (
    <MuiCard sx={{
      cursor: 'pointer',
      boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
      overflow: 'unset'
    }}>
      <CardMedia
        sx={{ height: 140 }}
        image='https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-6/472216957_1924617648026190_5823984232582036858_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGhfUvwlJn7Uq3b3j5yplmEl_szgKf1KTKX-zOAp_UpMth3c9rqnFKjlwb9ZUEAgNnkW60p7eSV_D8onxTLgx7L&_nc_ohc=0h4Sn3echA0Q7kNvgFngwZE&_nc_oc=AdkIYl5DxlAZFX6kZ0utWqOs1LwrsRYRAkDMTJPYh8J8acQpvM-HrjlupfKagqtT-70&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=2FUrLzxo5RY-w2oYgzzNhQ&oh=00_AYHREaJ1rBjv3TB8ZQ1GuBzjbFceT7ptiO4AFk1qtgC83g&oe=67E96688'
        title="green iguana"
      />
      <CardContent sx={{ p: 1.5, '&:last-child': { p : 1.5 } }}>
        <Typography>Arsenal</Typography>
      </CardContent>
      <CardActions sx={{ p: '0 4px 8px 4px' }}>
        <Button size="small" startIcon={<GroupIcon/>}>20</Button>
        <Button size="small" startIcon={<ModeCommentIcon/>}>15</Button>
        <Button size="small" startIcon={<AttachFileIcon/>}>10</Button>
      </CardActions>
    </MuiCard>
  )
}

export default Card
