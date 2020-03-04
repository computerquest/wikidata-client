// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import 'isomorphic-fetch';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function Asynchronous() {
	const [open, setOpen] = React.useState(false);
	const [options, setOptions] = React.useState([]);
	const loading = open && options.length === 0;

	React.useEffect(() => {
		let active = true;

		if (!loading) {
			return undefined;
		}

		(async () => {
			const response = await fetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=Google&language=en&format=json',
				{
					headers: {
						'User-Agent': 'bot (testing this)',
						'Access-Control-Allow-Origin': '*'
					},
					mode: 'cors' // no-cors, *cors, same-origin
				},

			);
			const countries = await response.json();

			if (active) {
				setOptions(Object.keys(countries).map(key => countries[key].item[0]));
			}
		})();

		return () => {
			active = false;
		};
	}, [loading]);

	React.useEffect(() => {
		if (!open) {
			setOptions([]);
		}
	}, [open]);

	return (
		<Autocomplete
			id="asynchronous-demo"
			style={{ width: 300 }}
			open={open}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
			}}
			getOptionSelected={(option, value) => option.name === value.name}
			getOptionLabel={option => option.name}
			options={options}
			loading={loading}
			renderInput={params => (
				<TextField
					{...params}
					label="Asynchronous"
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