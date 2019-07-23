import { useState, useContext, useEffect, useRef } from 'react';
import ApolloClientContext from './ApolloClientContext';

const FETCH_POLICIES = {
  CACHE_AND_NETWORK: 'cache-and-network',
  NETWORK_ONLY: 'network-only',
  NO_CACHE: 'no-cache',
  CACHE_ONLY: 'cache-only',
  CACHE_FIRST: 'cache-first'
};

/**
 * A hook for making graphql queries
 *
 * @param {string} query - the graphql query string
 * @param {Object} variables - variables for the query
 * @param {boolean} block - prevents query from fireing on mount
 * @param {string} fetchPolicy - the fetch policy to use when executing the query
 */
const useWatchQuery = ({
  query, variables, block, fetchPolicy = FETCH_POLICIES.CACHE_AND_NETWORK
}) => {
  const client = useContext(ApolloClientContext);

  const querySubscription = useRef();

  const [loading, setLoading] = useState(!block);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [_, throwError] = useState();

  const dealWithError = (err) => {
    console.log('ERROR', err);
    setError(err);
  };

  useEffect( () => {
    const params = {
      query,
      variables
    };

    if ( !block ) {

      querySubscription.current = client.watchQuery({
        ...params,
        errorPolicy: 'all',
        fetchPolicy
      });

      const initialResult = querySubscription.current.currentResult();
      // Set data
      setData(Object.keys(initialResult.data).length === 0 ? undefined : initialResult.data);
      // Set loading
      setLoading(initialResult.loading);
      // Get the error out
      const er = initialResult.errors ? { graphQLErrors: initialResult.errors } : undefined;
      // Deal with the error
      dealWithError(er);

      // Subscribe for updates
      querySubscription.current.subscribe({
        next: (result) => {
          // Set data
          setData(result.data);
          // Set loading
          setLoading(result.loading);
          // Get the error out
          const err = result.errors ? { graphQLErrors: result.errors } : undefined;
          // Deal with the error
          dealWithError(err);
        },
        error: (errr) => {
          querySubscription.current.resetLastResults();
          dealWithError(errr);
        }
      });

      // Cleanup function
      return () => {
        if ( querySubscription.current.unsubscribe ) {
          querySubscription.current.unsubscribe();
          querySubscription.current.resetLastResults();
        }
      };
    }
  }, []);

  const refetch = () => {
    setLoading(true);
    querySubscription.current.refetch(variables);
  };

  return {
    loading,
    data,
    error,
    query: vars => querySubscription.current.refetch( vars ),
    refetch
  };
};

export default useWatchQuery;
