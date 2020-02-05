import React from 'react'
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

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

		this.handleChangeFirst = this.handleChangeFirst.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChangeSecond = this.handleChangeSecond.bind(this);
	}

	handleChangeFirst(event) {
		this.setState({ first: event.target.value });
	}

	handleChangeSecond(event) {
		this.setState({ second: event.target.value });
	}

	handleSubmit(event) {
		alert('A name was submitted: ' + this.state.value);
		event.preventDefault();
	}

	render() {
		const { classes } = this.props;
		return (
			<form onSubmit={this.handleSubmit} xs={12} className={classes.root}>
				<Grid container spacing={1}>
					<Grid item xs={4}>
						<TextField
							id="first"
							label="First"
							variant="outlined"
							value={this.state.first}
							onChange={this.handleChangeFirst}
							className={classes.textField}
						/>
					</Grid>
					<Grid item xs={2}><h2>and</h2></Grid>
					<Grid item xs={4}><TextField
						id="second"
						label="Second"
						variant="outlined"
						value={this.state.second}
						onChange={this.handleChangeSecond}
						className={classes.textField}
					/></Grid>
					<Grid item xs={2}><Button color="primary" type="submit">Search</Button></Grid>
				</Grid>
			</form>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Search);