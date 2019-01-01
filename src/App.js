import React, { Component } from 'react';
import './App.css';
import logo from './awslogo.png';

import { API, graphqlOperation } from 'aws-amplify';
import { listRestaurants } from './graphql/queries';

class App extends Component {
  state = { restaurants: [] }
  async componentDidMount() {
    try {
      const apiData = await API.graphql(graphqlOperation(listRestaurants))
      const restaurants = apiData.data.listRestaurants.items
      this.setState({ restaurants })
    } catch (err) {
      console.log('error: ', err)
    }
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="aws_logo" alt="logo" />
          <h1>Restaurant List API</h1>
        </div>
        {
          this.state.restaurants.map((rest, i) => (
            <div style={styles.item}>
              <p style={styles.name}>{rest.name}</p>
              <p style={styles.description}>{rest.description}</p>
            </div>
          ))
        }
      </div>
    );
  }
}

const styles = {
  item: {
    marginLeft: 200,
    marginRight: 200,
    padding: 10,
    borderBottom: '2px solid #ddd'
  },
  name: { fontSize: 22 },
  description: { color: 'rgba(0, 0, 0, .45)' }
}

export default App;
