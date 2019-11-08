import React from 'react';
import { Query } from 'react-apollo';
import styled from 'styled-components';
import Item from './Item';
import Pagination from './Pagination';
import ALL_ITEMS_QUERY from '../graphql-queries/ALL_ITEMS_QUERY';

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${(props) => props.theme.maxWidth};
  margin: 0 auto;
`;

export default function Items({ page }) {
  return (
    <Center>
      <Pagination page={page} />
      <Query query={ALL_ITEMS_QUERY}>
        {({ data, error, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>{error.message}</p>;
          return (
            <ItemsList>
              {data.items.map((item) => <Item key={item.id} item={item} />)}
            </ItemsList>
          );
        }}
      </Query>
      <Pagination page={page} />
    </Center>
  );
}
