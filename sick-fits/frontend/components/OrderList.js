import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';
import Error from './ErrorMessage';
import { format } from 'date-fns';
import formatMoney from '../lib/formatMoney';
import Order from './Order';
import OrderStyles from './styles/OrderStyles';

const USER_ORDERS_QUERY = gql`
  query ALL_ORDERS_QUERY {
    orders(orderBy: createdAt_DESC) {
      id
      total
      createdAt
    }
  }
`;

export default class OrderList extends Component {
  onClick = (id) => {
    console.log('object');
    Router.push({
      pathname: '/order',
      query: {
        id,
      },
    });
  };

  render() {
    return (
      <Query query={USER_ORDERS_QUERY}>
        {({ data: { orders }, loading, error }) => (
          <React.Fragment>
            <h2>You have {orders ? orders.length : 0} orders</h2>
            {orders.map((order) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <Error error={error} />;
              return (
                <OrderStyles key={order.id}>
                  <button onClick={() => this.onClick(order.id)}>
                    View Details
                  </button>
                  <p>
                    <span>Order ID:</span>
                    <span>{order.id}</span>
                  </p>
                  <p>
                    <span>Date</span>
                    <span>
                      {format(order.createdAt, 'MMMM d, YYYY h:mm a')}
                    </span>
                  </p>
                  <p>
                    <span>Order Total</span>
                    <span>{formatMoney(order.total)}</span>
                  </p>
                </OrderStyles>
              );
            })}
          </React.Fragment>
        )}
      </Query>
    );
  }
}
