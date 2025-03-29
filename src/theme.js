import { experimental_extendTheme as extendTheme } from '@mui/material/styles'
// Create a theme instance.
// Dung extendTheme thay cho createTheme de tranh truong hop bi loi nhap nhay (bug flickering)
const theme = extendTheme({
  trello:{
    appBarHeight: 58,
    boardBarHeight: 60
  },
  // Extend the theme with some custom colors
  colorSchemes: {
    // light: {
    //   palette: {
    //     primary: teal,
    //     secondary: deepOrange
    //   }
    // },
    // dark: {
    //   palette: {
    //     primary: cyan,
    //     secondary: orange
    //   }
    // }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            with: 8,
            height: 8
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#dcdde1',
            borderRadius: 8
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'white',
            borderRadius: 8
          }
        }
      }
    },
    // Name of the component
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', //huy in hoa,
          borderWidth: '0.5px',
          '&:hover': {
            borderWidth: '2px'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: () => ({
          // color: theme.palette.primary.main,
          // Khi input không focus thì label sẽ có màu ...
          fontSize: '0.875rem'
        })
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: () => ({
          // color: theme.palette.primary.main,
          // Khi input không focus thì border sẽ có màu ...
          fontSize: '0.875rem',
          // Khi input không focus thì border sẽ có màu ...
          // '.MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.primary.light
          // },
          // // Khi hover vào input thì border sẽ chuyển sang màu ...
          // '&:hover .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.primary.main
          // },
          '& fieldset': { // khi ko focus thi border co mau ...,
            borderWidth: '0.5px !important'
          },
          '&:hover fieldset': { // khi hover thi border co mau ...,
            borderWidth: '2px !important'
          },
          '&.Mui-focused fieldset': { // khi hover thi border co mau ...,
            borderWidth: '3px !important'
          }
        })
      }
    }
  }
})

export default theme