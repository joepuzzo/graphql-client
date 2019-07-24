import { useState, useContext } from 'react';
import ApolloClientContext from './ApolloClientContext';
import { ApolloError } from 'apollo-client';

/**
 * A hook for making graphql queries
 *
 * @param {string} query - the graphql query string
 * @param {Object} variables - variables for the query
 * @param {boolean} block - prevents query from fireing on mount
 */
const useMutation = ({ mutation, success, failure }) => {

  const client = useContext(ApolloClientContext);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [_, throwError] = useState();

  const dealWithError = (err) => {
    //console.log('ERROR', err);
    if(err){
      const apolloError = new ApolloError(err);
      setError(apolloError);
    }
  };

  const mutate = async (props) => {
    // We are loading
    setLoading(true);
    // Clear out old errors
    setError(undefined);
    try {
      const { data: result, errors } = await client.mutate({
        mutation,
        errorPolicy: 'all',
        ...props
      });
      // Set the data
      setData(result);
      // Check for errors
      const err = errors ? { graphQLErrors: errors } : undefined;
      dealWithError(err);
      // Call success function
      if ( success && !errors) success(result);
    }
    catch (err) {
      dealWithError(err)
      // Call failure function
      if ( failure ) failure(err);
    }
    setLoading(false);
  };

  const reset = () => {
    setError(null);
    setData(null);
    setLoading(false);
  };

  return {
    loading,
    data,
    error,
    mutate,
    reset
  };
};

export default useMutation;
