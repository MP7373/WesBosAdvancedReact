import Link from 'next/link';
import styled from 'styled-components';
import Router from 'next/router';
import NProgress from 'nprogress';
import Nav from './Nav';
import Cart from './Cart';
import Search from './Search';

Router.onRouteChangeStart = () => {
  NProgress.start();
};

Router.onRouteChangeComplete = () => {
  NProgress.done();
};

Router.onRouteChangeError = () => {
  NProgress.done();
};


const Logo = styled.h1`
  font-size: 4em;
  margin: 0 10px 10px 40px;
  position: relative;
  z-index: 2;
  transform: skew(-7deg);
  button {
    font-size: 1em;
    padding: 0.5rem 1rem;
    box-shadow: none;
    border: none;
    background: ${(props) => props.theme.red};
    color: white;
    text-transform: uppercase;
    text-decoration: none;
  }
  @media (max-width: 1300px) {
    margin: 0 0 0 30px;
    text-align: center;
  }
  @media (max-width: 400px) {
    font-size: 2em;
    margin: 0 0 0 5px;
  }
`;

const StyledHeader = styled.header`
  .bar {
    border-bottom: 10px solid ${(props) => props.theme.black};
    display: grid;
    grid-auto-columns: auto 1fr;
    justify-content: space-between;
    align-items: stretch;
    @media (max-width: 1300px) {
      grid-auto-columns: 1fr;
      justify-content: center;
    }
    @media (max-width: 400px) {
      font-size: .5em;
    }
  }

  .sub-bar {
    display: grid;
    grid-template-columns: 1fr auto;
    border-bottom: 10px solid ${(props) => props.theme.lightgrey};
  }
`;

const Header = () => (
  <StyledHeader>
    <div className="bar">
      <Logo>
        <Link href="/">
          <button type="button">Sick Fits</button>
        </Link>
      </Logo>
      <Nav />
    </div>
    <div className="sub-bar">
      <Search />
    </div>
    <Cart />
  </StyledHeader>
);

export default Header;
