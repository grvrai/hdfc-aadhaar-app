import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import NotificationsActiveIcon from "@material-ui/icons/NotificationsActive";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import PeakPwa from "./../../services/peakpwa";
import { useHistory } from "react-router";
import { Avatar, Box, IconButton } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    // maxWidth: 345,
    // backgroundColor: '#',
    marginBottom: "1rem",
  },
  media: {
    // height: 140,
  },
}));

export default function RecentNotification() {
  const classes = useStyles();
  const [isLoading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);

  let history = useHistory();

  React.useEffect(async () => {
    console.log("useEffect");
    let notifs = await PeakPwa.webapp.getNotifications(true);
    console.log(notifs);
    setNotif(notifs[0]);
  }, []);

  React.useEffect(async () => {
    navigator.serviceWorker.addEventListener("message", async (e) => {
      console.log("handlePushReceived - RecentNotification");
      console.log(e.data);
      let notifs = await PeakPwa.webapp.getNotifications(true);
      console.log(notifs);
      setNotif(notifs[0]);
    });
  }, []);

  //   const handleClick = (e) => {
  //     setLoading(true);
  //     PeakPwa.requestNotificationPermissionAndSubscribe();
  //   }

  return (
    <div>
      {notif ? (
        <Card className={classes.root}>
          <Box bgcolor="success.main" color="primary.contrastText">
            <CardContent>
              {/* <Typography gutterBottom variant="h6">
                  Push Notification
              </Typography> */}
              <Grid container spacing={3}>
                <Grid item xs={2}>
                  <Avatar style={{ color: "white" }}>
                    <NotificationsActiveIcon color="inherit" />
                  </Avatar>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" component="p">
                    {notif.changeTitle}
                  </Typography>
                  <Typography variant="body2" component="p">
                    {notif.changeMessage}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    size="small"
                    color="inherit"
                    onClick={() => {
                      history.push("/notifications/");
                    }}>
                    <ArrowForwardIosIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Box>
        </Card>
      ) : (
        ""
      )}
    </div>
  );
}
