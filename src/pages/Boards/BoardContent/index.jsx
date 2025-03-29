import Box from '@mui/material/Box'
import theme from '../../../theme'

function index() {
  return (
    <Box sx={{
      bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
      width: '100%',
      height: `calc(100vh - ${theme.trello.appBarHeight + theme.trello.boardBarHeight}px)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // center the content horizontally
      alignItems: 'center'
    }}>
      Content here
    </Box>
  )
}

export default index
