import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

var _ = require('lodash');

function NetworkGraph(props) {
	const [focusNode, setFocusNode] = React.useState('')
	const [graph, setGraph] = React.useState({ nodes: [], links: [] })

	//does the graph parsing from rawData
	React.useEffect(() => {
		var nodes = []
		var links = []

		let all_nodes = _.cloneDeep(props.data.nodes)
		let all_links = _.cloneDeep(props.data.links)
		let paths = _.cloneDeep(props.data.paths)

		//if we have paths selected we only load from those paths
		if (props.selectedPaths.length !== 0) {
			paths = props.selectedPaths
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
					if (!props.hide) {
						all_nodes[id].color = '#d9d9d9'
					} else {
						all_nodes[id].visibility = false
					}
				}
			}

			for (let i = 0; i < colored_links.length; i++) {
				if (!props.hide) {
					all_links[colored_links[i]].color = '#666666'
				} else {
					all_links[colored_links[i]].visibility = true
				}
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
	}, [focusNode, props.data, props.hide, props.selectedPaths])

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

	let custom_style = {
		position: 'absolute',
		top: 0,
		left: 0,
		'zIndex': -1
	}

	return (
		<div>
			<div style={custom_style} >
				{props.hide && focusNode !== '' ?
					<ForceGraph2D
						graphData={graph}
						nodeLabel="label"
						linkLabel="label"
						nodeAutoColorBy="distance"
						nodeVisibility={(node) => { return node.visibility !== false }}
						linkVisibility={(link) => { return link.visibility === true }}
						enableNodeDrag={true} //this doesn't seem to have that big of a performance hit
						nodeCanvasObject={drawNode}
						onNodeClick={(node, event) => { setFocusNode(node.id) }}
						onBackgroundClick={() => setFocusNode('')}
					/>
					:
					< ForceGraph2D
						graphData={graph}
						nodeLabel="label"
						linkLabel="label"
						nodeAutoColorBy="distance"
						enableNodeDrag={true} //this doesn't seem to have that big of a performance hit
						nodeCanvasObject={drawNode}
						onNodeClick={(node, event) => { setFocusNode(node.id) }}
						onBackgroundClick={() => setFocusNode('')}
					/>}
			</div>
		</div>
	);
}

export default NetworkGraph;