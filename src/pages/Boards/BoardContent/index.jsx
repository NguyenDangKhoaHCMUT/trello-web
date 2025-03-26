import Box from '@mui/material/Box'
import theme from '../../../theme'

function index() {
  return (
    <Box sx={{
      backgroundColor: 'primary.light',
      width: '100%',
      height: `calc(100vh - ${theme.trello.appBarHeight + theme.trello.boardBarHeight}px)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // center the content horizontally
      alignItems: 'center'
    }}>
      <Box sx={{
        backgroundColor: 'secondary.main',
        width: '90%', // 80% of parent width
        height: '40%', // 80% of parent height
        margin: 'auto', // center the box horizontally
        display: 'flex',
        alignItems: 'center', // center the content vertically
        justifyContent: 'center', // center the content horizontally
        marginBottom: '1rem'
      }}>
        Content here
      </Box>

      <Box sx={{
        backgroundColor: 'secondary.main',
        width: '90%', // 80% of parent width
        height: '40%', // 80% of parent height
        margin: 'auto', // center the box horizontally
        display: 'flex',
        alignItems: 'center', // center the content vertically
        justifyContent: 'center' // center the content horizontally
      }}>
        Content here
      </Box>
    </Box>
  )
}

export default index
