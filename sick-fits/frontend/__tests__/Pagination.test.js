import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Pagination, { PAGINATION_QUERY } from '../components/Pagination';
import { MockedProvider } from 'react-apollo/test-utils';
import Router from 'next/router';

Router.router = {
  push() {},
  prefetch() {},
};

function generateMocks(numberOfMocks) {
  return [
    {
      request: { query: PAGINATION_QUERY },
      result: {
        data: {
          itemsConnection: {
            __typename: 'aggregate',
            aggregate: {
              __typename: 'count',
              count: numberOfMocks,
            },
          },
        },
      },
    },
  ];
}

describe('<Pagination />', () => {
  it('displays a loading message', async () => {
    const wrapper = mount(
      <MockedProvider mocks={generateMocks(1)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    expect(wrapper.text()).toContain('Loading...');
  });

  it('renders pagination for 18 items', async () => {
    const wrapper = mount(
      <MockedProvider mocks={generateMocks(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find('.totalPages').text()).toBe('5');
    const pagination = wrapper.find('div[data-test="pagination"]');
    expect(toJSON(pagination)).toMatchSnapshot();
  });

  it('disables prev button on first page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={generateMocks(18)}>
        <Pagination page={1} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find('a.prev').prop('aria-disabled')).toBe(true);
    expect(wrapper.find('a.next').prop('aria-disabled')).toBe(false);
  });

  it('disables next button on last page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={generateMocks(18)}>
        <Pagination page={5} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find('a.prev').prop('aria-disabled')).toBe(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toBe(true);
  });

  it('enables all buttons on a middle page', async () => {
    const wrapper = mount(
      <MockedProvider mocks={generateMocks(18)}>
        <Pagination page={2} />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.find('a.prev').prop('aria-disabled')).toBe(false);
    expect(wrapper.find('a.next').prop('aria-disabled')).toBe(false);
  });
});
