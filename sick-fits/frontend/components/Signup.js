import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
export default class Signup extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      name: '',
      password: '',
    };

    this.saveToState = this.saveToState.bind(this);
  }

  saveToState(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const { email, name, password } = this.state;

    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await signup();
              console.log(res);
              this.setState({ name: '', email: '', password: '' });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign Up for An Account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={email}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="name">
                Name
                <input
                  type="text"
                  name="name"
                  placeholder="name"
                  value={name}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={password}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Signup</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}
