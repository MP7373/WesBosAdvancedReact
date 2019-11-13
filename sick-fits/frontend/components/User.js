import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import { userInfo } from 'os';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
    }
  }
`;

const User = (props) => (
  <Query {...props} query={CURRENT_USER_QUERY}>
    {(payload) => props.children(payload)}
  </Query>
);

// eslint-disable-next-line react/no-typos
User.PropTypes = {
  children: PropTypes.func.isRequired,
};

export { CURRENT_USER_QUERY };
export default User;
