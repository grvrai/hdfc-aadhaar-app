
import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#004c8f',
      light: '#61dafb',
      dark: '#21a1c4',
    },
    secondary: {
      main: '#004c8f',
      light: '#61dafb',
      dark: '#21a1c4',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f3f3f3',
    },
  },
  overrides: {
    MuiContainer: {
      root: {
        paddingTop: '56px',
        paddingBottom: '56px',
      }
    },
    MuiPaper: {
      root: {
        // padding: '20px 10px',
        // margin: '10px',
        // backgroundColor: '#fff', // 5d737e
      },
    },
    MuiButton: {
      root: {
        // margin: '5px',
      },
    },
  },
});
export default theme;