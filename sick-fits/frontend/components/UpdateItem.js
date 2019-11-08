import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      image
    }
  }
`;

const UPDATE_ITEM_MUTATION = gql`
  mutation UPDATE_ITEM_MUTATION(
    $id: ID!
    $title: String
    $description: String
    $price: Int
    $image: String
    $largeImage: String
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`;

const UPDATE_ITEM_MUTATION_NO_IMAGE = gql`
  mutation UPDATE_ITEM_MUTATION_NO_IMAGE(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(
      id: $id
      title: $title
      description: $description
      price: $price
    ) {
      id
      title
      description
      price
    }
  }
`;

class UpdateItem extends Component {
  constructor() {
    super();
    this.state = {
      image: '',
      largeImage: '',
    };

    this.handleChage = this.handleChage.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.updateItem = this.updateItem.bind(this);
  }

  handleChage(e) {
    const { name, type, value } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    this.setState({ [name]: val });
  }

  async updateItem(e, updateItemMutation) {
    e.preventDefault();
    const { id } = this.props;
    const vars = { ...this.state };

    if (vars.image === '') {
      delete vars.image;
    }

    if (vars.largeImage === '') {
      delete vars.largeImage;
    }

    await updateItemMutation({
      variables: {
        id,
        ...vars,
      },
    });

    if (vars.image === '') {
      window.location.reload(false);
    }
  }

  async uploadFile(e) {
    console.log('uploading file');
    const { files } = e.target;
    const data = new FormData();
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dkvv4u6rm/image/upload',
      {
        method: 'POST',
        body: data,
      },
    );

    const { secure_url: secureUrl, eager } = await res.json();
    this.setState({
      image: secureUrl,
      // eslint-disable-next-line react/no-unused-state
      largeImage: eager && eager[0].secure_url,
    });
  }

  render() {
    const { image } = this.state;
    const { id } = this.props;

    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id }}>
        {({ data, loadingOuter }) => {
          if (loadingOuter) {
            return <p>Loading...</p>;
          }

          if (!data || !data.item) {
            return (
              <p>
                No item found for the ID:
                {` ${id}`}
              </p>
            );
          }

          return (
            <Mutation
              mutation={image ? UPDATE_ITEM_MUTATION : UPDATE_ITEM_MUTATION_NO_IMAGE}
              variables={this.state}
            >
              {(updateItem, { loading, error }) => (
                <Form onSubmit={(e) => {
                  e.preventDefault();
                  this.updateItem(e, updateItem);
                }}
                >
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="file">
                      Image
                      <input
                        type="file"
                        id="file"
                        name="file"
                        placeholder="Upload an image"
                        defaultValue=""
                        onChange={this.uploadFile}
                      />
                      {(data.item.image || image) && <img src={image || data.item.image} alt="Upload Preview" />}
                    </label>

                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        defaultValue={data.item.title}
                        onChange={this.handleChage}
                      />
                    </label>

                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        defaultValue={data.item.price}
                        onChange={this.handleChage}
                      />
                    </label>

                    <label htmlFor="description">
                      Description
                      <input
                        type="text"
                        id="description"
                        name="description"
                        placeholder="Enter A Description"
                        required
                        defaultValue={data.item.description}
                        onChange={this.handleChage}
                      />
                    </label>

                    <button type="submit">
                      Updat
                      {loading ? 'ing' : 'e'}
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export { UPDATE_ITEM_MUTATION };
export default UpdateItem;
