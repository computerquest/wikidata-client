import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import IconButton from '@material-ui/core/Button';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Search from '../search/Search.js'

function NetworkGraph(props) {
	const [graph, setGraph] = React.useState({ nodes: [], links: [], checked: 0, frontier: 0 })
	const [loading, setLoading] = React.useState(false)
	const [active, setActive] = React.useState(true)
	const [target, setTarget] = React.useState([])
	const [error, setError] = React.useState(false)

	//does the graph polling
	React.useEffect(() => {
		let fetchGraph = () => {
			if (target[0] === undefined || target[1] === undefined) {
				return
			}

			console.log('fetching the graph')
			setLoading(true)

			fetch('http://127.0.0.1:5000/poll?obj1=' + target[0] + '&obj2=' + target[1]).then(response => {
				if (response.ok) {
					return response.json()
				} else {
					throw new Error("Data fetched incorrectly")
				}
			}).then(data => {
				setGraph(data)
				setError(false)
				console.log(data)
			}).catch(error => {
				console.log(error)
				setError(true)
				setLoading(false)
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

			fetchGraph();

			interval = setInterval(fetchGraph, 10000)

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

	if (error) {
		return (<div><p>There has been an error</p></div>);
	}

	let custom_style = {
		position: 'absolute',
		top: 0,
		left: 0,
		'zIndex': -1
	}

	return (
		<div>
			<div>
				<Search updateTarget={setTarget} />
				<IconButton
					onClick={() => { setActive(!active) }}
					disabled={!loading}>
					{active ? <PauseIcon /> : <PlayArrow />}
				</IconButton>
				{error && <h3>There has been an error</h3>}
			</div>
			<div style={custom_style} >
				<ForceGraph2D
					graphData={graph}
					nodeLabel="label"
					linkLabel="label"
					nodeAutoColorBy="distance"
					enableNodeDrag={false}
					nodeCanvasObject={(node, ctx, globalScale) => {
						const label = node.label;
						const fontSize = 12 / globalScale;
						ctx.font = `${fontSize}px Sans-Serif`;
						const textWidth = ctx.measureText(label).width;
						const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

						ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
						ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillStyle = node.color;
						ctx.fillText(label, node.x, node.y);
					}}
				/>
			</div>
		</div>
	);
}

export default NetworkGraph;