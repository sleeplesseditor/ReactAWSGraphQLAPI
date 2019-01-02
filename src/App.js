import React, { Component } from 'react';
import './App.css';
import logo from './awslogo.png';

import { API, graphqlOperation } from 'aws-amplify';
import { listRestaurants } from './graphql/queries';
import { createRestaurant } from './graphql/mutations';
import { onCreateRestaurant } from './graphql/subscriptions';

class App extends Component {
  state = {
    name: '', 
    description: '', 
    restaurants: [] 
  };

  async componentDidMount() {
    try {
      const apiData = await API.graphql(graphqlOperation(listRestaurants))
      const restaurants = apiData.data.listRestaurants.items
      this.setState({ restaurants })
    } catch (err) {
      console.log('error: ', err)
    }

    this.subscription = API.graphql(
      graphqlOperation(onCreateRestaurant)
    ).subscribe({
      next: restaurantData => {
        const restaurant = restaurantData.value.data.onCreateRestaurant
        const restaurants = [
          ...this.state.restaurants.filter(r => {
            return (
              r.name !== restaurant.name && r.description !== restaurant.description
            )
          }),
          restaurant
        ]
        this.setState({ restaurants })
      }
    })
  };

  componentWillUnmount() {
    this.subscription.unsubscribe()
  };

  onChange = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  createRestaurant = async () => {
    const { name, description } = this.state
    if (name === '' || description === '') return
    try {
      const restaurant = { name, description }
      const restaurants = [...this.state.restaurants, restaurant]
      this.setState({ 
        restaurants, 
        name: '', 
        description: '' 
      })
      await API.graphql(graphqlOperation(createRestaurant, {input: restaurant}))
      console.log('restaurant successfully created!')
    } catch (err) {
      console.log('error: ', err)
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="aws_logo" alt="logo" />
          <h1>Restaurant List API</h1>
        </div>

        <div style={styles.inputContainer}>
          <input
            name='name'
            placeholder='Restaurant Name'
            onChange={this.onChange}
            value={this.state.name}
            style={styles.input}
          />
          <input
            name='description'
            placeholder='Restaurant Description'
            onChange={this.onChange}
            value={this.state.description}
            style={styles.input}
          />
        </div>
        <button
          className="submit_button"
          onClick={this.createRestaurant}
        >
          Create Restaurant
        </button>

        {
          this.state.restaurants.map((rest, i) => (
            <div style={styles.item} key={rest.name}>
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
  inputContainer: {
    margin: '0 auto', 
    display: 'flex', 
    flexDirection: 'column', 
    width: 300
  },
  input: {
    fontSize: 18,
    border: 'none',
    margin: 10,
    height: 25,
    backgroundColor: "#ddd",
    padding: 8
  },
  item: {
    padding: 10,
    marginLeft: 200,
    marginRight: 200,
    borderBottom: '2px solid #ddd'
  },
  name: { 
    fontSize: 22 
  },
  description: { 
    color: 'rgba(0, 0, 0, .45)' 
  }
}

export default App;
