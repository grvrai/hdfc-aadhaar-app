import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'


export default function LoadingButton({isLoading, btnText, loadingText, ...props}) {
    return (
        <Button {...props} disabled={isLoading}>
            {isLoading 
                ?   <Grid container alignItems="center" justify="center">
                        {loadingText} <CircularProgress color="primary" size={16} style={{marginLeft: '1rem', }}/> 
                    </Grid>
                :  btnText
            }
        </Button>
    );
}             

                   
 