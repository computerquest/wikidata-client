import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import GraphController from '../search/GraphController.js'

function NetworkGraph(props) {
	const [graph, setGraph] = React.useState({ nodes: [], links: [], checked: 0, frontier: 0, paths: [] })
	const [loading, setLoading] = React.useState(false)
	const [active, setActive] = React.useState(true)
	const [target, setTarget] = React.useState([])
	const [error, setError] = React.useState(false)
	const [focusNode, setFocusNode] = React.useState('')

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

	//this sets the color property for nodes not involved and darkens edges involved
	React.useEffect(() => {
		if (focusNode === '') {
			return
		}

		console.log('doing the focus nnoe stuff')

		const colorEdge = (start, end) => {
			console.log('coloring', start, end)
			let key = start + end
			let link = -1
			for (let i = 0; i < graph.links.length; i++) {
				if (graph.links[i].id === key) {
					link = i
					break
				}
			}
			if (link === -1) {
				key = end + start
				for (let i = 0; i < graph.links.length; i++) {
					if (graph.links[i].id === key) {
						link = i
						break
					}
				}
			}
			console.log(link)
			graph.links[link].color = 'red'
		}

		const paths = graph.paths
		for (let i = 0; i < paths.length; i++) {
			// const find = paths[i].findIndex((el) => el === focusNode)
			// if (find !== -1) {
			// 	if(find > 0) {
			// 		colorEdge(paths[i][find], paths[i][find-1])
			// 	}

			// 	if(find < paths[i].length -1) {
			// 		colorEdge(paths[i][find], paths[i][find +1])
			// 	}
			// }

			if (paths[i].includes(focusNode)) {
				for (let a = 0; a < paths[i].length - 1; a++) {
					console.log(paths[i][a], i, a)
					for (let b = 0; b < graph.nodes.length; b++) {
						if (graph.nodes[b].id === paths[i][a]) {
							console.log('colored node')
							graph.nodes[b].color = 'red'
							break
						}
					}
					colorEdge(paths[i][a], paths[i][a + 1])
				}

				for (let b = 0; b < graph.nodes.length; b++) {
					if (graph.nodes[b].id === paths[i][paths[i].length - 1]) {
						console.log('colored node')
						graph.nodes[b].color = 'red'
						break
					}
				}
			}
		}

		return () => {
			console.log('clearing the coloring')
			const clearEdge = (start, end) => {
				console.log('coloring', start, end)
				let key = start + end
				let link = -1
				for (let i = 0; i < graph.links.length; i++) {
					if (graph.links[i].id === key) {
						link = i
						break
					}
				}
				if (link === -1) {
					key = end + start
					for (let i = 0; i < graph.links.length; i++) {
						if (graph.links[i].id === key) {
							link = i
							break
						}
					}
				}
				console.log(link)
				delete graph.links[link].color
			}

			for (let i = 0; i < paths.length; i++) {
				if (paths[i].includes(focusNode)) {
					for (let a = 0; a < paths[i].length - 1; a++) {
						for (let b = 0; b < graph.nodes.length; b++) {
							if (graph.nodes[b].id === paths[i][a]) {
								console.log('deleting', graph.nodes[b])
								delete graph.nodes[b].color
								break
							}
						}
						clearEdge(paths[i][a], paths[i][a + 1])
					}

					for (let b = 0; b < graph.nodes.length; b++) {
						if (graph.nodes[b].id === paths[i][paths[i].length - 1]) {
							console.log('colored node')
							delete graph.nodes[b].color
							break
						}
					}
				}
			}

		}
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

	// const activeNode = (node, event) => {
	// 	setFocusNode(node.id)

	// 	event.preventDefault()
	// }


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
					graphData={graph}
					nodeLabel="label"
					linkLabel="label"
					nodeAutoColorBy="distance"
					//linkAutoColorBy="label"
					enableNodeDrag={false}
					nodeCanvasObject={drawNode}
					onNodeClick={(node, event) => setFocusNode(node.id)}
					onBackgroundClick={() => setFocusNode('')}
				/>
			</div>
		</div>
	);
}

export default NetworkGraph;