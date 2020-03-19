import React from 'react'
import Button from '@material-ui/core/Button';
import Searchfield from './Searchfield.js'
import IconButton from '@material-ui/core/Button';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Grid from '@material-ui/core/Grid';

export default function GraphController(props) {
	const [terms, setTerms] = React.useState({})

	const handleSubmit = (event) => {
		console.log('submissin is handled', terms)
		props.setTarget([terms.first, terms.second])

		event.preventDefault();
	}

	const handleTyping = (who, event) => {
		let c = terms
		c[who] = event
		setTerms(c)
	}


	return (
		<Grid container justify="flex-end" alignItems="center">
			<Grid item >
				<Grid container spacing={1} >
					<Grid item xs={6}><Searchfield id='first' label={'First Object'} onChange={handleTyping} /></Grid>
					<Grid item xs={6}><Searchfield id='second' label={'Second Object'} onChange={handleTyping} /></Grid>
				</Grid>
			</Grid>
			<Grid item >
				<Grid container>
					<Grid item xs={12}><Button color="primary" type="submit" onClick={handleSubmit}>Search</Button></Grid>
					<Grid item xs={12}><IconButton
						onClick={() => props.setActive(!props.active)}
						disabled={!props.loading}>
						{props.active ? <PauseIcon /> : <PlayArrow />}
					</IconButton></Grid>
				</Grid>
			</Grid>
			<Grid item xs={12}>
				{props.displayInfo}
			</Grid>
		</Grid>
	);
}