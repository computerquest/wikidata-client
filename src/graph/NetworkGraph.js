import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import GraphController from '../search/GraphController.js'
var _ = require('lodash');

function NetworkGraph(props) {
	const [loading, setLoading] = React.useState(false)
	const [active, setActive] = React.useState(true)
	const [target, setTarget] = React.useState([])
	const [error, setError] = React.useState(false)
	const [focusNode, setFocusNode] = React.useState('')
	const [rawData, setRawData] = React.useState({ nodes: {}, links: {}, checked: 0, frontier: 0, paths: [] }) //this is the graph to be rendered
	const [graph, setGraph] = React.useState({ nodes: [], links: [] })
	const [displayInfo, setDisplayInfo] = React.useState('')
	const [pathFilter, setPathFilter] = React.useState((path) => { return true })

	//does the rawData polling
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
				setRawData(data)
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

	//does the graph parsing from rawData
	React.useEffect(() => {
		var nodes = []
		var links = []

		let all_nodes = _.cloneDeep(rawData.nodes)
		let all_links = _.cloneDeep(rawData.links)
		let paths = _.cloneDeep(rawData.paths)

		console.log(pathFilter)
		//filters the relevant paths based on the filter criteria
		for (let i = paths.length - 1; i >= 0; i--) {
			if (!pathFilter(paths[i])) {
				paths.splice(i, 1)
				i++ //this is to counter the subtraction
			}
		}

		//for the click coloring
		if (focusNode !== '') {
			let colored_nodes = []
			let colored_links = []
			for (let i = 0; i < paths.length; i++) {
				if (paths[i].includes(focusNode)) {
					colored_nodes.push(...paths[i])

					for (let a = 0; a < paths[i].length - 1; a++) {
						colored_links.push((paths[i][a] < paths[i][a + 1]) ? paths[i][a + 1] + paths[i][a] : paths[i][a] + paths[i][a + 1])
					}
				}
			}

			console.log(colored_nodes, colored_links)

			for (const id in all_nodes) {
				let included = false

				for (let i = 0; i < colored_nodes.length; i++) {
					if (colored_nodes[i] === id) {
						included = true
						break
					}
				}

				if (!included) {
					all_nodes[id].last_color = all_nodes[id].color
					all_nodes[id].color = '#d9d9d9'
				}
			}

			for (let i = 0; i < colored_links.length; i++) {
				all_links[colored_links[i]].color = '#666666'
			}
		}

		//this is for adding the nodes and links to the graph
		for (const prop in all_nodes) {
			nodes.push(all_nodes[prop])
		}

		for (const prop in all_links) {
			links.push(all_links[prop])
		}

		setGraph({ 'nodes': nodes, 'links': links })
	}, [focusNode, rawData, pathFilter])

	let drawNode = (node, ctx, globalScale) => {
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
	}

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
				<GraphController
					active={active}
					setTarget={setTarget}
					setActive={setActive}
					loading={loading}
					displayInfo={'testing'}
					setPathFilter={setPathFilter}
				/>
				{error && <h3>There has been an error</h3>}
			</div>
			<div style={custom_style} >
				<ForceGraph2D
					graphData={graph}
					nodeLabel="label"
					linkLabel="label"
					nodeAutoColorBy="distance"
					//nodeVisibility="visibility"
					enableNodeDrag={false}
					nodeCanvasObject={drawNode}
					onNodeClick={(node, event) => { setFocusNode(node.id) }}
					onBackgroundClick={() => setFocusNode('')}
				/>
			</div>
		</div>
	);
}

export default NetworkGraph;