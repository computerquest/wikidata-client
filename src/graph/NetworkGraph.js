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
	const [graph, setGraph] = React.useState({ nodes: [], links: [], checked: 0, frontier: 0, paths: [] }) //this is the graph to be rendered
	const [renderGraph, setRenderGraph] = React.useState({ nodes: [], links: [], checked: 0, frontier: 0, paths: [] })

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
				setRenderGraph(data) //not copy so it can scoop up the auto coloring
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

	//this sets the color property for nodes not involved and darkens edges involved
	// eslint-disable-next-line
	React.useEffect(() => {
		if (focusNode === '') {
			return
		}

		let newG = _.cloneDeep(graph)
		console.log('starting', newG)

		let links = newG.links
		let nodes = newG.nodes
		let paths = newG.paths

		let colored_links = []
		let colored_nodes = []

		//gets all of the things to be colored
		for (let i = 0; i < paths.length; i++) {
			if (paths[i].includes(focusNode)) {
				for (let a = 0; a < paths[i].length - 1; a++) {
					colored_nodes.push(paths[i][a])
					colored_links.push(paths[i][a] + paths[i][a + 1])
					colored_links.push(paths[i][a + 1] + paths[i][a])
				}
				colored_nodes.push(paths[i][paths[i].length - 1])
			}
		}

		let actually_colored = []
		for (let i = 0; i < nodes.length; i++) {
			let index = false
			for (let a = 0; a < colored_nodes.length; a++) {
				if (nodes[i].id === colored_nodes[a]) {
					index = true
					break
				}
			}
			if (!index) {
				nodes[i].last_color = nodes[i].color
				nodes[i].color = '#d9d9d9'
				actually_colored.push(nodes[i])
			}
		}

		colored_nodes = actually_colored

		for (let i = 0; i < links.length; i++) {
			let index = -1
			for (let a = 0; a < colored_links.length; a++) {
				if (links[i].id === colored_links[a]) {
					index = a
					colored_links[a] = links[i]
					break
				}
			}
			if (index !== -1) {
				colored_links[index].color = '#666666'
			}
		}

		setRenderGraph(_.cloneDeep(newG))
		console.log('ast set', colored_nodes)

		// return (() => {
		// 	console.log(colored_nodes)
		// 	for (let i = 0; i < colored_nodes.length; i++) {
		// 		console.log(colored_nodes[i].last_color)
		// 		colored_nodes[i].color = colored_nodes[i].last_color
		// 	}

		// 	for (let i = 0; i < colored_links.length; i++) {
		// 		delete colored_links[i].color
		// 	}

		// 	setRenderGraph(graph)
		// })
	}, [focusNode, graph])

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
				<GraphController active={active} setTarget={setTarget} setActive={setActive} loading={loading} />
				{error && <h3>There has been an error</h3>}
			</div>
			<div style={custom_style} >
				<ForceGraph2D
					graphData={renderGraph}
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