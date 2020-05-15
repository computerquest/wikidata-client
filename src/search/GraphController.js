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
import MuiAlert from '@material-ui/lab/Alert';

//var url = 'https://wikidata-server.herokuapp.com'
var url = 'http://127.0.0.1:5000'
export default function GraphController(props) {
	const [terms, setTerms] = React.useState({})
	const [inverted, setInverted] = React.useState(false)
	const [pathLength, setPathLength] = React.useState([1, 9])
	const [sliderBounds, setSliderBounds] = React.useState([0, 10])
	const [rawData, setRawData] = React.useState({ nodes: {}, links: {}, paths: [] }) //this is the graph to be rendered
	const [stats, setStats] = React.useState({ checked: 0, frontier: 0, num_paths: 0 })
	const [error, setError] = React.useState(false)
	const [target, setTarget] = React.useState([])
	const [active, setActive] = React.useState(false)
	const [data, setData] = React.useState({ nodes: {}, links: {}, paths: [] })
	const [hide, setHide] = React.useState(false)
	const [selectedPaths, setSelectedPaths] = React.useState([])

	React.useEffect(() => {
		function fetchData() {
			if (typeof fetchData.num_paths == 'undefined') {
				fetchData.num_paths = 0;
			}
			if (target[0] === undefined || target[1] === undefined) {
				return
			}
			console.log(url + '/poll?obj1=' + target[0] + '&obj2=' + target[1] + '&received=' + fetchData.num_paths)
			fetch(url + '/poll?obj1=' + target[0] + '&obj2=' + target[1] + '&received=' + fetchData.num_paths).then(response => {
				if (response.ok) {
					console.log(response)
					return response.json()
				} else {
					console.log(response)
					setError(true)
					throw new Error("Data fetched incorrectly")
				}
			}).then(data => {
				if (data.paths.length > 0) {
					console.log('the paths have updated', data)
					setRawData(current => {
						return { nodes: { ...current.nodes, ...data.nodes }, links: { ...current.links, ...data.links }, paths: current.paths.concat(data.paths) }
					})
				}
				setStats(old => { return { checked: data.checked, frontier: data.frontier, num_paths: old.num_paths + data.paths.length } })
				fetchData.num_paths += data.paths.length
				setError(false)
			}).catch(error => {
				console.log(error)
				setError(true)
			})
		}

		let detach = () => {
			fetch(url + '/detach?obj1=' + target[0] + '&obj2=' + target[1]).catch(() => {
				console.log('there was an error')
			})

			return 'detaching'
		}

		let interval = undefined;

		if (active) {
			fetch(url + '/start?obj1=' + target[0] + '&obj2=' + target[1]).then(() => {
				console.log('start request done successfully')
				setError(false)
			}).catch((e) => {
				console.log('error sending the start request from search')
				console.log(e)
				setError(true)
			})

			fetchData();

			interval = setInterval(fetchData, 5000)

			window.addEventListener('beforeunload', detach)
		}
		return () => {

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
		console.log(terms.first, terms.second)
		setTarget([terms.first, terms.second])
		setActive(true)

		event.preventDefault();
	}

	const handleTyping = (who, event) => {
		let c = {}
		c[who] = event

		setTerms(prevState => {
			return { ...prevState, ...c };
		})
	}

	const pathLabel = (option) => {
		let ans = ''

		for (let i = 0; i < option.length - 1; i++) {
			let key = option[i + 1] > option[i] ? option[i + 1] + option[i] : option[i] + option[i + 1]
			console.log(rawData.links[key].source, option[i])
			let link = rawData.links[key].source === option[i] ? ' --' + rawData.links[key].label + '> ' : ' <' + rawData.links[key].label + '-- '
			ans += rawData.nodes[option[i]].label + link
		}
		ans += rawData.nodes[option[option.length - 1]].label

		return ans
	}

	// const pathLengths = []
	// for (let i = 0; i < rawData.paths.length; i++) {
	// 	pathLengths.push(rawData.paths[i].length)
	// }
	// console.log('pathLengths', pathLengths)

	return (
		<div>
			<Grid container justify="flex-end" alignItems="center" xs={5} style={{ margin: '20px', float: 'right' }} spacing={2}>
				<Grid item xs={4}><Searchfield id='first' label={'First Object'} onChange={handleTyping} /></Grid>
				<Grid item xs={4}><Searchfield id='second' label={'Second Object'} onChange={handleTyping} /></Grid>

				<Grid item xs={2}><Button color="primary" type="submit" onClick={handleSubmit} disabled={!(/Q\d*$/.test(terms.first) && /Q\d*$/.test(terms.second))}>Search</Button></Grid>
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
						getOptionLabel={option => pathLabel(option)}
						onChange={(event, value) => {
							setSelectedPaths(value)
							console.log('this bitch changed')
						}}
						//defaultValue={[top100Films[13]]}
						renderInput={params => (
							<TextField
								{...params}
								variant="standard"
								label="Paths to show"
								placeholder="Favorites"
							/>
						)}
					/>
				</Grid>
				<Grid item container justify="flex-end" alignItems="center" spacing={3}>
					<Grid item>Total Paths: {stats.num_paths}</Grid>
					<Grid item>Total Nodes: {Object.keys(rawData.nodes).length}</Grid>
					<Grid item>Total Edges: {Object.keys(rawData.links).length}</Grid>
					<Grid item>Checked: {stats.checked}</Grid>
					<Grid item> In Queue (frontier): {stats.frontier}</Grid>
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
			</Grid>

			{error && <MuiAlert elevation={6} variant="filled" severity="error" style={{ width: "100%", position: "absolute", bottom: "0px" }}>Problem fetching data</MuiAlert>}
			<NetworkGraph data={data} hide={hide} selectedPaths={selectedPaths} />
		</div >
	);
}