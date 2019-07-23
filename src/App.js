import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import ApolloClientProvider from './ApolloClientProvider';
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import useWatchQuery from './useWatchQuery';
import { Query } from "react-apollo";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import './App.css';

const client = new ApolloClient({
  uri: "http://localhost:8090/graphql",
});


const DOG = gql`
  query dog( $id: ID! ){
    dog(id: $id) {
      id
      name
      owner {
        name
        id
      }
    }
  }
`;

const OWNER = gql`
  query owner( $id: ID! ){
    owner(id: $id) {
      id
      name
    }
  }
`;

const Data = ({data}) => (
  <div className="section data">{JSON.stringify(data, null, 2)}</div>
)

const Error = ({error}) => (
  <div className="section error">{`Error! ${error.message}`}{console.log('ERR', error.message)}</div>
)

const NoData = () => (
  <div className="section nodata">'No data was found :('</div>
);

const Label = ({label}) => (
  <div className="label">{label}</div>
);

const DogView = ({error, loading, data }) => {

  if( loading ){
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="block dog">
      <Label label="Dog"/>
      {error ? <Error error={error}/> : null}
      {data ? <Data data={data.dog} /> : <NoData /> }
    </div>
  );
};

const OwnerView = ({error, loading, data }) => {
  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="block owner">
      <Label label="Owner"/>
      {error ? <Error error={error}/> : null}
      {data ? <Data data={data.owner} /> : <NoData /> }
    </div>
  );
};

const Dog = ({ id }) => (
  <Query 
    query={DOG} 
    variables={{
      id
    }} 
    errorPolicy="all">
    {({ loading, error, data }) => {
      return <DogView loading={loading} error={error} data={data} />
    }}
  </Query>
);

const Owner = ({ id }) => (
  <Query 
    query={OWNER} 
    variables={{
      id
    }} 
    errorPolicy="all">
    {({ loading, error, data }) => {
      return <OwnerView loading={loading} error={error} data={data} />
    }}
  </Query>
);

// const Dog = ({id}) => {
//   const {
//     loading,
//     data,
//     error,
//     query
//   } = useWatchQuery({
//     query: DOG,
//     variables: {
//       id,
//     },
//   });
//   return <DogView loading={loading} error={error} data={data} />
// };

// const Owner = ({id}) => {
//   const {
//     loading,
//     data,
//     error,
//     query
//   } = useWatchQuery({
//     query: OWNER,
//     variables: {
//       id,
//     },
//   });
//   return <OwnerView loading={loading} error={error} data={data} />
// }


const Dogs = () => {
  return (
    <>
      <Dog id="1A" />
      <Dog id="2A" />
      <Dog id="1A" />
      <Dog id="3A" />
      <Dog id="4A" />
      <Owner id="1B" />
    </>
  );
}

const Home = () => <h1>You are home!</h1>;

function App() {
  return (
    <ApolloProvider client={client}>
      <ApolloClientProvider>
        <Router>
          <div className="nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/dog">Dog</NavLink>
          </div>
          <div className="content">
            <Route path="/dog" exact component={Dogs} />
            <Route path="/" exact component={Home} />
          </div>
        </Router>
      </ApolloClientProvider>
    </ApolloProvider>
  );
}


export default App;
