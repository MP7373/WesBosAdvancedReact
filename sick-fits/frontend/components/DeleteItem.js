/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import ALL_ITEMS_QUERY from '../graphql-queries/ALL_ITEMS_QUERY';

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
export default class DeleteItem extends Component {
  static update(cache, payload) {
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
    data.items = data.items.filter((item) => item.id !== payload.data.deleteItem.id);

    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  }

  render() {
    const { id, children } = this.props;

    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id }}
        update={DeleteItem.update}
      >
        {(deleteItem) => (
          <button
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete this item?')) {
                deleteItem();
              }
            }}
          >
            {children}
          </button>
        )}
      </Mutation>
    );
  }
}
