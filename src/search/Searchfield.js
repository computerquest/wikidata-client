// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import 'isomorphic-fetch';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
let wikidataLookup = require('wikidata-entity-lookup');

export default function Asynchronous(props) {
	const [open, setOpen] = React.useState(false);
	const [options, setOptions] = React.useState([]);
	const [text, setText] = React.useState('')
	const [loading, setLoading] = React.useState(false)

	React.useEffect(() => {
		if (text === '') {
			return
		}

		let active = true;

		(async () => {
			setLoading(true)
			let init_text = text
			let ans = [...(await wikidataLookup.findPerson(init_text)), ...(await wikidataLookup.findRS(init_text)), ...(await wikidataLookup.findOrganization(init_text)),
			...(await wikidataLookup.findPlace(init_text)), ...(await wikidataLookup.findTitle(init_text))]

			//if (active) {
			let list = []
			const map = new Map();
			for (const item of ans) {
				if (!map.has(item.id)) {
					map.set(item.id, true);    // set any value to Map
					list.push({ name: item.name + ' (' + item.description + ')', value: item.id.match(/Q\d*$/g) });
				}
			}

			if (text === init_text && active) {
				setLoading(false)
				setOptions(list);
			}
		})()

		return () => {
			active = false;
		};
	}, [text]);

	React.useEffect(() => {
		if (!open) {
			setOptions([]);
		}
	}, [open]);


	let passUp = (info, value) => {
		if (value != null) {
			props.onChange(props.id, value.value[0])
		}
	}

	let handleChange = (event, value, reason) => {
		setText(value)
	}

	return (
		<Autocomplete
			id="asynchronous"
			xs={12}
			open={open}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
			}}
			freeSolo={false}
			onInputChange={handleChange}
			onChange={passUp}
			getOptionSelected={(option, value) => option.name === value.name}
			getOptionLabel={option => option.name}
			options={options}
			loading={loading}
			noOptionsText={'No Options '}
			renderInput={params => (
				<TextField
					{...params}
					label={props.label}
					fullWidth
					variant="outlined"
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<React.Fragment>
								{loading ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</React.Fragment>
						),
					}}
				/>
			)}
		/>
	);
}