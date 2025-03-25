import Box from '@mui/material/Box'
import theme from '../../../theme'

function index() {
  return (
    <Box sx={{
      backgroundColor: 'primary.light',
      width: '100%',
      height: `calc(100vh - ${theme.trello.appBarHeight + theme.trello.boardBarHeight}px)`,
      display: 'flex',
      alignItems: 'center'
    }}>
      Content
    </Box>
  )
}

export default index
