
import { red } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      // main: '#004c8f',
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    error: {
      main: red.A400,
    },
    background: {
      // default: '#f3f3f3',
      default: '#3f51b5',
    },
  },

  props: {
    MuiListItemText: {
      primaryTypographyProps: {
        variant: 'button',
        // color: 'textSecondary'
      },
    }
  },
  
  overrides: {
    MuiCircularProgress:{
      colorSecondary: {
        color: '#fff'
      }
    },
    MuiTypography: {
      colorTextSecondary: {
        // color: '#fff'
      }
    },
    // MuiListItemText: {
    //   primaryTypographyProps: {

    //   },
    //   root: {
    //     fontWeight: 500,
    //     textTransform: 'uppercase'
    //   },
    // },
    // MuiListItem: {
    //   root: {
    //     fontWeight: 500,
    //     textTransform: 'uppercase'
    //   },
    //   button: {
    //     fontWeight: 'bold'
    //   }
    // },
    MuiSnackbar: {

      root: {
        bottom : 90,
        marginBottom: 56
      }
    },
    // MuiSnackbar: {
    //   root: {
    //     bottom: '56px',
    //     marginBottom: '56px'
    //   }
    // },
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