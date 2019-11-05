import Link from 'next/link';
import NavStyles from './styles/NavStyles';

const Nav = () => (
  <NavStyles>
    <Link href="/">
      <button type="button">Items</button>
    </Link>
    <Link href="/sell">
      <button type="button">Sell</button>
    </Link>
    <Link href="/signup">
      <button type="button">SignUp</button>
    </Link>
    <Link href="/orders">
      <button type="button">Orders</button>
    </Link>
    <Link href="/me">
      <button type="button">Account</button>
    </Link>
  </NavStyles>
);

export default Nav;
