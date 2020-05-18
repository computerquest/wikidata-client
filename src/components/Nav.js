import React from 'react';
import {
    FacebookShareButton,
    TwitterShareButton,
    RedditShareButton,
    LinkedinShareButton
} from "react-share";
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import RedditIcon from '@material-ui/icons/Reddit';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';

function Nav() {
    let message = '6 degrees of wikidata'
    let url = window.location.href
    return (
        <div style={{ position: "absolute", left: "10px", top: "10px" }}>
            <Grid container spacing={1} direction="column" alignItems="flex-start" >
                <Grid item><Link color="primary" component="a" underline="none" href="/about" style={{ padding: "0px", margin: "0", "alignContent": "left", "font-weight": "bold" }}><h3>About</h3></Link></Grid>
                <Grid item><FacebookShareButton
                    url={url}
                    quote={message}
                >         <FacebookIcon color="primary" /></FacebookShareButton>
                </Grid>
                <Grid item>
                    <TwitterShareButton
                        url={url}
                        quote={message}
                    ><TwitterIcon color="primary" /></TwitterShareButton>
                </Grid>
                <Grid item>
                    <RedditShareButton
                        url={url}
                        quote={message}
                    ><RedditIcon color="primary" /></RedditShareButton>
                </Grid>
                <Grid item>
                    <LinkedinShareButton
                        url={url}
                        quote={message}
                    ><LinkedInIcon color="primary" /></LinkedinShareButton>
                </Grid>
            </Grid>
        </div>
    )
}

export default Nav;