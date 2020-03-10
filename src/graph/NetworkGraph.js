import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import IconButton from '@material-ui/core/Button';
import PauseIcon from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';

class NetworkGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			graph: {
				nodes: [],
				links: [],
			},
			loading: false,
			target: [],
			active: true
		}
		this.fetchGraph = this.fetchGraph.bind(this);
		this.handlePausePlay = this.handlePausePlay.bind(this);
	}

	onUnload = e => {
		e.preventDefault();
		e.returnValue = '';

		if (this.props.target !== []) {
			console.log('sending close request')
			fetch('http://127.0.0.1:5000/detach?obj1=' + this.state.target[0] + '&obj2=' + this.state.target[1]).catch(() => {
				console.log('there was an error')
			})
		}
	}

	componentDidMount() {
		console.log('this did mount')
		this.fetchGraph();
		this.timer = setInterval(() => this.fetchGraph(), 10000);

		window.addEventListener("beforeunload", this.onUnload);
	}

	componentDidUpdate(oldProps) {
		//this is to make sure that the props changed
		if (oldProps.target !== this.props.target) {
			console.log('updating the graph targets to ', this.props.target)
			this.setState({ target: this.props.target })

			if (this.props.target !== []) {
				console.log('sending close request')
				fetch('http://127.0.0.1:5000/detach?obj1=' + this.state.target[0] + '&obj2=' + this.state.target[1]).catch(() => {
					console.log('there was an error')
				})
			}
		}
	}

	fetchGraph() {
		if (this.state.target[0] === undefined || this.state.target[1] === undefined) {
			return
		}

		console.log('fetching the graph')
		this.setState({ loading: true })


		fetch('http://127.0.0.1:5000/poll?obj1=' + this.state.target[0] + '&obj2=' + this.state.target[1]).then(response => {
			if (response.ok) {
				return response.json()
			} else {
				throw new Error("Data fetched incorrectly")
			}
		}).then(data => {
			this.setState({ graph: data, error: false })
			console.log(this.state.graph)
		}).catch(error => {
			console.log(error)
			this.setState({ error, loading: false })
		})
	}

	handlePausePlay() {
		console.log('pausing and playiing')
		if (this.state.active) {
			clearInterval(this.timer)
		} else {
			this.timer = setInterval(() => this.fetchGraph(), 10000);
		}

		this.setState({ active: !this.state.active })
	}

	render() {
		const { error, graph, loading, active } = this.state

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
			<div style={custom_style} >
				<IconButton
					onClick={this.handlePausePlay}
					disabled={!loading}>
					{active ? <PauseIcon /> : <PlayArrow />}
				</IconButton>
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
		);
	}
}

export default NetworkGraph;