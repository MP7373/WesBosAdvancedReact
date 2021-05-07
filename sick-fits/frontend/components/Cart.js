import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import User from './User';
import CartItem from './CartItem';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';

const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Composed = adopt({
  user: ({ render }) => <User>{render}</User>,
  toggleCart: ({ render }) => (
    <Mutation mutation={TOGGLE_CART_MUTATION}>{render}</Mutation>
  ),
  localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = () => (
  <Composed>
    {({
      user: {
        data: { me },
      },
      toggleCart,
      localState: {
        data: { cartOpen },
      },
    }) => {
      if (!me) return null;
      return (
        <CartStyles open={cartOpen}>
          <header>
            <CloseButton onClick={toggleCart} title="close">
              &times;
            </CloseButton>
            <Supreme>
              {`${me.name}'s `}
              Cart
            </Supreme>
            <p>
              You Have
              {` ${me.cart.length} `}
              Item
              {me.cart.length > 1 ? 's ' : ' '}
              in your cart.
            </p>
          </header>
          <ul>
            {me.cart.map((cartItem) => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </ul>
          <footer>
            <p>
              {formatMoney(
                me.cart.reduce(
                  (sum, cartItem) =>
                    !cartItem.item
                      ? sum
                      : sum + cartItem.quantity * cartItem.item.price,
                  0
                )
              )}
            </p>
            {me.cart.length && (
              <TakeMyMoney>
                <SickButton>Checkout</SickButton>
              </TakeMyMoney>
            )}
          </footer>
        </CartStyles>
      );
    }}
  </Composed>
);

export { LOCAL_STATE_QUERY, TOGGLE_CART_MUTATION };
export default Cart;