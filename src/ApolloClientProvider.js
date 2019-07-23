import React from 'react';
import { ApolloConsumer } from 'react-apollo';
import ApolloClientContext from './ApolloClientContext';

const ApolloClientProvider = ({ children }) => (
  <ApolloConsumer>
    { client => (
      <ApolloClientContext.Provider value={client}>
        {children}
      </ApolloClientContext.Provider>
    )}
  </ApolloConsumer>
);


export default ApolloClientProvider;
