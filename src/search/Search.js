import React from 'react'
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";
import Searchfield from './Searchfield.js'

const styles = theme => ({
	root: {
		margin: 10,
		display: 'flex',
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
			console.log('start request done successfully')
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
			<form position="absolute" top={0} onSubmit={this.handleSubmit} display="block" flexDirection="row-reverse" width={1 / 4} className={classes.root}>
				<div><Searchfield id='first' label={'First Object'} onChange={this.handleNewSearch} /></div>
				<div><Searchfield id='second' label={'Second Object'} onChange={this.handleNewSearch} /></div>
				<div><Button color="primary" type="submit">Search</Button></div>
			</form>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Search);