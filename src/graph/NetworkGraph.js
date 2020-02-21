import React from 'react';
import { Graph } from "react-d3-graph";

class NetworkGraph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			graph: {
				nodes: [{ id: "Harry" }, { id: "Sally" }, { id: "Alice" }],
				links: [{ source: "Harry", target: "Sally" }, { source: "Harry", target: "Alice" }],
			},
			loading: false
		}
		this.fetchGraph = this.fetchGraph.bind(this);
	}

	componentDidMount() {
		console.log('this did mount')
		this.fetchGraph();
		this.timer = setInterval(() => this.fetchGraph(), 10000);
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
			console.log(data)
			this.setState({ graph: data, loading: false })
		}).catch(error => this.setState({ error, loading: false }))
	}

	render() {
		const { error, graph, loading } = this.state

		if (error) {
			return (<div><p>There has been an error</p></div>);
		}

		const myConfig =
		{
			height: 1000,
			width: 1000,
			node: {
				"labelProperty": "label",
				//"size": 10
			},
		};


		return (
			<div>
				<Graph
					id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
					data={graph}
					config={myConfig}
				/>;
				<h1>{loading}</h1>
			</div>
		);
	}
}

export default NetworkGraph;