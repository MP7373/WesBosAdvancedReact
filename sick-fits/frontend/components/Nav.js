/* eslint-disable import/no-duplicates */
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import NavStyles from './styles/NavStyles';
import User from './User';
import { CURRENT_USER_QUERY } from './User';
import { TOGGLE_CART_MUTATION } from './Cart';
import CartCount from './CartCount';

const SIGN_OUT_MUTATION = gql`
  mutation {
    signout {
      message
    }
  }
`;

const Nav = () => (
  <User>
    {({ data }) => (
      <NavStyles>
        <Link href="/">
          <button type="button">Items</button>
        </Link>
        {data && data.me && data.me.name ? (
          <>
            <Link href="/sell">
              <button type="button">Sell</button>
            </Link>
            <Link href="/orders">
              <button type="button">Orders</button>
            </Link>
            <Link href="/me">
              <button type="button">Account</button>
            </Link>
            <Mutation
              mutation={SIGN_OUT_MUTATION}
              refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
              {(signout) => (
                <button type="button" onClick={() => signout()}>
                  Sign Out
                </button>
              )}
            </Mutation>
            <Mutation mutation={TOGGLE_CART_MUTATION}>
              {(toggleCart) => (
                <button type="button" onClick={toggleCart}>
                  Cart
                  <CartCount count={data.me.cart.reduce((sum, item) => sum + item.quantity, 0)} />
                </button>
              )}
            </Mutation>
          </>
        ) : (
          <Link href="/signup">
            <button type="button">Sign In</button>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
);

export default Nav;
