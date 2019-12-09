/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const REMOVE_FROM_CART_MUTATION = gql`
  mutation removeFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`;

export { REMOVE_FROM_CART_MUTATION };

const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover {
    color: ${({ theme }) => theme.red};
    cursor: pointer;
  }
`;

class RemoveFromCart extends Component {
  constructor() {
    super();
    this.update = this.update.bind(this);
  }

  update(cache, payload) {
    console.log('in remove from cart update fn');
    const data = cache.readQuery({ query: CURRENT_USER_QUERY });
    console.log(data);
    const cartItemId = payload.data.removeFromCart.id;
    data.me.cart = data.me.cart.filter((cartIem) => cartIem.id !== cartItemId);
    cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  }

  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={REMOVE_FROM_CART_MUTATION}
        variables={{ id }}
        update={this.update}
        optimisticResponse={{
          __typename: 'Mutation',
          removeFromCart: {
            __typename: 'CartItem',
            id,
          },
        }}
      >
        {(removeFromCart, { loading, error }) => (
          <BigButton
            title="Delete Item"
            disabled={loading}
            onClick={() => {
              removeFromCart().catch((err) => alert(err.message));
            }}
          >
            &times;
          </BigButton>
        )}
      </Mutation>
    );
  }
}

RemoveFromCart.propTypes = {
  id: PropTypes.string.isRequired,
};

export default RemoveFromCart;
