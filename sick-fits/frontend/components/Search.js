/* eslint-disable react/destructuring-assignment */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import Downshift, { resetIdCounter } from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEMS_QUERY = gql`
  query SEARCH_ITEMS_QUERY($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      image
      title
    }
  }
`;

function routeToItem(item) {
  Router.push({
    pathname: '/item',
    query: {
      id: item.id,
    },
  });
}

class AutoComplete extends React.Component {
  constructor() {
    super();

    this.state = {
      items: [],
      loading: false,
      attemptedSearches: {},
      lastCompletedSearch: [''],
    };

    this.onChange = debounce(this.onChange.bind(this), 350);
  }

  async onChange(e, client) {
    const res = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: e.target.value },
    });

    this.setState((prevState) => ({
      items: e.target.value !== '' ? res.data.items : [],
      loading: false,
      attemptedSearches: {
        ...prevState.attemptedSearches,
        [e.target.value]: true,
      },
      lastCompletedSearch: [e.target.value],
    }));
  }

  render() {
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift
          onChange={routeToItem}
          itemToString={(item) => (item == null ? '' : item.title)}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex,
          }) => (
            <div>
              <ApolloConsumer>
                {(client) => (
                  <input
                    type="search"
                    {...getInputProps({
                      type: 'search',
                      placeholder: 'Seach For An Item',
                      id: 'search',
                      className: this.state.loading ? 'loading' : '',
                      onChange: (e) => {
                        e.persist();
                        console.log('Searching...');
                        this.setState((prevState) => ({
                          loading: true,
                          lastCompletedSearch: [
                            ...prevState.lastCompletedSearch,
                            e.target.value,
                          ],
                        }));
                        this.onChange(e, client);
                      },
                    })}
                  />
                )}
              </ApolloConsumer>
              {isOpen && (
                <DropDown>
                  {inputValue !== '' &&
                    !this.state.lastCompletedSearch.includes('') &&
                    this.state.items.map((item, index) => (
                      <DropDownItem
                        {...getItemProps({ item })}
                        key={item.id}
                        highlighted={index === highlightedIndex}
                      >
                        <img width="50" src={item.image} alt={item.title} />
                        {item.title}
                      </DropDownItem>
                    ))}
                </DropDown>
              )}
              {!this.state.items.length &&
                !this.state.items.loading &&
                inputValue !== '' &&
                this.state.attemptedSearches[inputValue] && (
                  <DropDownItem>Nothing Found For {inputValue}</DropDownItem>
                )}
            </div>
          )}
        </Downshift>
      </SearchStyles>
    );
  }
}

export default AutoComplete;
