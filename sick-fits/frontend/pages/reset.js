/* eslint-disable react/destructuring-assignment */
import Reset from '../components/Reset';

const ResetPage = ({ query: { resetToken } }) => (
  <div>
    <p>{`Reset Your Password ${resetToken}`}</p>
    <Reset resetToken={resetToken} />
  </div>
);

export default ResetPage;
