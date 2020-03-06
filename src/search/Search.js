import React from 'react'
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Searchfield from './Searchfield.js'

const styles = theme => ({
	root: {
		margin: 10,
		display: 'flex',
		flexDirection: 'row',
	},
	textField: {
		margin: 5,
	},
})

class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			first: 'Tyler McGinnis',
			second: 'Merrick Christensen'
		};

		this.handleNewSearch = this.handleNewSearch.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		//this.handleChangeSecond = this.handleChangeSecond.bind(this);
	}

	handleNewSearch(who, event) {
		let dict = {}
		dict[who] = event
		this.setState(dict);
		console.log('state is ', this.state, dict)
	}

	handleSubmit(event) {
		alert('http://127.0.0.1:5000/start?obj1=' + this.state.first + '&obj2=' + this.state.second);

		fetch('http://127.0.0.1:5000/start?obj1=' + this.state.first + '&obj2=' + this.state.second).then(() => {
			this.props.updateTarget(this.state.first, this.state.second)
		}).catch((e) => {
			console.log('error sending the start request from search')
			console.log(e)
		})
		event.preventDefault();
	}

	render() {
		const { classes } = this.props;
		return (
			<form onSubmit={this.handleSubmit} xs={12} className={classes.root}>
				<Grid container spacing={1}>
					<Grid item xs={4}>
						<Searchfield id='first' label={'First Object'} onChange={this.handleNewSearch} />
					</Grid>
					<Grid item xs={2}><h2>and</h2></Grid>
					<Grid item xs={4}>
						<Searchfield id='second' label={'Second Object'} onChange={this.handleNewSearch} />
					</Grid>
					<Grid item xs={2}><Button color="primary" type="submit">Search</Button></Grid>
				</Grid>
			</form>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Search);