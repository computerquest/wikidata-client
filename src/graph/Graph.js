import React from 'react';
import { Sigma, RandomizeNodePositions, RelativeSize } from 'react-sigma';
//https://github.com/dunnock/react-sigma

class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			graph: null,
			loading: false
		}
		this.fetchGraph = this.fetchGraph.bind(this);
	}

	componentDidMount() {
		console.log('this did mount')
		this.fetchGraph();
		this.timer = setInterval(() => this.fetchGraph(), 5000);
	}

	fetchGraph() {
		console.log('fetching the graph')
		this.setState({ loading: true })

		fetch('http://127.0.0.1:5001/poll?obj1=Q76&obj2=Q13133').then(response => {
			if (response.ok) {
				return response.json()
			} else {
				throw new Error("Data fetched incorrectly")
			}
		}).then(data => {
			this.setState({ graph: data, loading: false })
			console.log(data)
		}).catch(error => this.setState({ error, loading: false }))
	}

	render() {
		const { error, graph, loading } = this.state

		if (error) {
			return (<div><p>There has been an error</p></div>);
		}

		return (
			<div>
				<Sigma graph={graph} settings={{ drawEdges: true, clone: false }}>
					<RelativeSize initialSize={15} />
					<RandomizeNodePositions />
				</Sigma>
				<h1>{loading}</h1>
			</div>
		);
	}
}

export default Graph;