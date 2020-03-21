import React from 'react'
import Button from '@material-ui/core/Button';
import Searchfield from './Searchfield.js'
import IconButton from '@material-ui/core/Button';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import NetworkGraph from '../graph/NetworkGraph.js';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

export default function GraphController(props) {
	const [terms, setTerms] = React.useState({})
	const [inverted, setInverted] = React.useState(false)
	const [pathLength, setPathLength] = React.useState([1, 9])
	const [sliderBounds, setSliderBounds] = React.useState([0, 10])
	const [rawData, setRawData] = React.useState({ nodes: {}, links: {}, checked: 0, frontier: 0, paths: [] }) //this is the graph to be rendered
	const [error, setError] = React.useState(false)
	const [target, setTarget] = React.useState([])
	const [active, setActive] = React.useState(false)
	const [data, setData] = React.useState({ nodes: {}, links: {}, paths: [] })
	const [hide, setHide] = React.useState(false)
	const [selectedPaths, setSelectedPaths] = React.useState([])

	React.useEffect(() => {
		let fetchData = () => {
			if (target[0] === undefined || target[1] === undefined) {
				return
			}

			console.log('fetching the graph')

			fetch('http://127.0.0.1:5000/poll?obj1=' + target[0] + '&obj2=' + target[1]).then(response => {
				if (response.ok) {
					return response.json()
				} else {
					throw new Error("Data fetched incorrectly")
				}
			}).then(data => {
				setRawData(data)
				setError(false)
			}).catch(error => {
				console.log(error)
				setError(true)
			})
		}

		let detach = () => {
			fetch('http://127.0.0.1:5000/detach?obj1=' + target[0] + '&obj2=' + target[1]).catch(() => {
				console.log('there was an error')
			})

			return 'detaching'
		}

		let interval = undefined;

		if (active) {
			fetch('http://127.0.0.1:5000/start?obj1=' + target[0] + '&obj2=' + target[1]).then(() => {
				console.log('start request done successfully')
				setError(false)
			}).catch((e) => {
				console.log('error sending the start request from search')
				console.log(e)
				setError(true)
			})

			fetchData();

			interval = setInterval(fetchData, 10000)

			window.addEventListener('beforeunload', detach)
		}
		return () => {
			console.log('clearing the interval and detaching', target)

			if (active) {
				clearInterval(interval)
				detach()

				window.removeEventListener('beforeunload', detach)
			}
		}
	}, [active, target])

	React.useEffect(() => {
		let min = 10000
		let max = 0
		for (let i = 0; i < rawData.paths.length; i++) {
			if (rawData.paths[i].length < min) {
				min = rawData.paths[i].length
			}

			if (rawData.paths[i].length > max) {
				max = rawData.paths[i].length
			}
		}

		setSliderBounds([min, max])

		setPathLength([min, max])
	}, [rawData])

	React.useEffect(() => {
		let paths = []
		let nodes = {}
		let links = {}

		if (selectedPaths.length === 0) {
			let valid_path = true
			if (inverted) {
				valid_path = (path) => {
					return path.length >= pathLength[1] | path.length <= pathLength[0]
				}
			} else {
				valid_path = (path) => {
					return path.length <= pathLength[1] & path.length >= pathLength[0]
				}
			}

			//gets the valid paths
			for (let i = 0; i < rawData.paths.length; i++) {
				if (valid_path(rawData.paths[i])) {
					paths.push(rawData.paths[i])
				}
			}
		} else {
			paths = selectedPaths
		}

		//gets the relevant links and nodes
		for (let i = 0; i < paths.length; i++) {

			for (let a = 0; a < paths[i].length - 1; a++) {
				nodes[paths[i][a]] = rawData.nodes[paths[i][a]]
				let key = paths[i][a] > paths[i][a + 1] ? paths[i][a] + paths[i][a + 1] : paths[i][a + 1] + paths[i][a]
				links[key] = rawData.links[key]
			}
			nodes[paths[i][paths[i].length - 1]] = rawData.nodes[paths[i][paths[i].length - 1]]
		}

		console.log('setting data to ', nodes, links, paths)
		setData({ nodes: nodes, links: links, paths: paths })
	}, [rawData, pathLength, inverted, selectedPaths])

	const handleSubmit = (event) => {
		setTarget([terms.first, terms.second])
		setActive(true)

		event.preventDefault();
	}

	const handleTyping = (who, event) => {
		let c = terms
		c[who] = event
		setTerms(c)
	}

	return (
		<div>
			<Grid container justify="flex-end" alignItems="center" xs={5} style={{ margin: '20px', float: 'right' }} spacing={2}>

				<Grid item xs={4}><Searchfield id='first' label={'First Object'} onChange={handleTyping} /></Grid>
				<Grid item xs={4}><Searchfield id='second' label={'Second Object'} onChange={handleTyping} /></Grid>

				<Grid item xs={2}><Button color="primary" type="submit" onClick={handleSubmit}>Search</Button></Grid>
				<Grid item xs={2}>
					<IconButton
						onClick={() => setActive(!active)}
						disabled={target.length === 0}>
						{active ? <PauseIcon /> : <PlayArrow />}
					</IconButton>
				</Grid>
				<Grid item xs={10}>
					<Typography id="range-slider" gutterBottom>Path Length Range</Typography>
					<Slider
						disabled={target.length === 0}
						min={sliderBounds[0]}
						max={sliderBounds[1]}
						value={pathLength}
						onChange={(event, value) => { setPathLength(value) }}
						valueLabelDisplay="auto"
						track={inverted ? 'inverted' : 'normal'}
						aria-labelledby="range-slider"
					/>
				</Grid>
				<Grid item xs={2}>
					<Checkbox
						disabled={target.length === 0}
						checked={inverted}
						onChange={() => { setInverted(!inverted) }}
						inputProps={{ 'aria-label': 'primary checkbox' }}
					/>
					Inverted
				</Grid>
				<Grid item xs={12}>
					<Autocomplete
						multiple
						disabled={target.length === 0}
						id="tags-standard"
						options={rawData.paths}
						getOptionLabel={option => {
							let ans = ''
							for (let i = 1; i < option.length - 1; i++) {
								ans += rawData.nodes[option[i]].label + '/'
							}
							return ans
						}}
						onChange={(event, value) => {
							setSelectedPaths(value)
							console.log('this bitch changed')
						}}
						//defaultValue={[top100Films[13]]}
						renderInput={params => (
							<TextField
								{...params}
								variant="standard"
								label="Multiple values"
								placeholder="Favorites"
							/>
						)}
					/>
				</Grid>
				<Grid item>
					<Checkbox
						disabled={target.length === 0}
						checked={hide}
						onChange={() => { setHide(!hide) }}
						inputProps={{ 'aria-label': 'primary checkbox' }}
					/>
					Hide others on click
			</Grid>
			</Grid>

			{error}
			<NetworkGraph data={data} hide={hide} selectedPaths={selectedPaths} />
		</div>
	);
}