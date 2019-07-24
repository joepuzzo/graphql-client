import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "react-apollo";
import ApolloClientProvider from './ApolloClientProvider';
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";
import useWatchQuery from './useWatchQuery';
import useMutation from './useMutation';
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
      rand
      age
      owner {
        name
        id
        rand
      }
    }
  }
`;

const OWNER = gql`
  query owner( $id: ID! ){
    owner(id: $id) {
      id
      name
      rand
    }
  }
`;

const DOG_PARK = gql`
  query {
    dogPark {
      name
      averageAge
      dogs { 
        id
        name
        rand
        age
      }
    }
  }
`;

const DOG_PARK_BY_NAME = gql`
  query dogParkByName( $name: String! ){
    dogParkByName( name: $name ) {
      name
      averageAge
      dogs { 
        id
        name
        rand
        age
      }
    }
  }
`;


const CHANGE_DOG_AGE = gql`
  mutation changeDogAge($id: ID!, $age: Int!) {
    changeDogAge(id: $id, age: $age){
      id
      age
    }
  }
`;


const Data = ({data}) => (
  <div className="section data">{JSON.stringify(data, null, 2)}</div>
)

const Error = ({error}) => (
  <div className="section error">
    {`Error! ${error.message}`}
    {console.log('ERROR', error)}
    {console.log('ERR1', error.graphQLErrors)}
    {console.log('ERR2', error.networkError)}
  </div>
)

const NoData = () => (
  <div className="section nodata">'No data was found :('</div>
);

const Label = ({label}) => (
  <div className="label">{label}</div>
);

const DogView = ({error, loading, data, refetch, changeDogAge }) => {

  const [age, setAge] = useState(0);

  if( loading ){
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  const onChange = (e) => {
    setAge(e.target.value);
  };

  const ageChange = () => changeDogAge( { 
    variables: { 
      id: data.dog.id, 
      age: +age 
    },
    refetchQueries: [{
      query: DOG_PARK,
    }]
  });

  return (
    <div className="block dog">
      <Label label="Dog"/>
      {error ? <Error error={error}/> : null}
      {data ? <Data data={data.dog} /> : <NoData /> }
      <button className="button" type="button" onClick={refetch}>Refetch</button>
      <input type="number" onChange={onChange} value={age}/>
      <button className="button" type="button" onClick={ageChange}>Change Age</button>
    </div>
  );
};

const OwnerView = ({error, loading, data, refetch }) => {
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
      <button className="button" type="button" onClick={refetch}>Refetch</button>
    </div>
  );
};

const DogParkView = ({error, loading, data, refetch }) => {
  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="block owner">
      <Label label="Dog Park"/>
      {error ? <Error error={error}/> : null}
      {data ? <Data data={data.dogPark || data.dogParkByName} /> : <NoData /> }
      <button className="button" type="button" onClick={refetch}>Refetch</button>
    </div>
  );
};

// const Dog = ({ id }) => (
//   <Query 
//     query={DOG} 
//     fetchPolicy="cache-and-network"
//     variables={{
//       id
//     }} 
//     errorPolicy="all">
//     {({ loading, error, data }) => {
//       return <DogView loading={loading} error={error} data={data} />
//     }}
//   </Query>
// );

// const Owner = ({ id }) => (
//   <Query 
//     query={OWNER}
//     fetchPolicy="cache-and-network"
//     variables={{
//       id
//     }} 
//     errorPolicy="all">
//     {({ loading, error, data }) => {
//       return <OwnerView loading={loading} error={error} data={data} />
//     }}
//   </Query>
// );

const Dog = ({id}) => {
  const {
    loading,
    data,
    error,
    refetch
  } = useWatchQuery({
    query: DOG,
    variables: {
      id,
    },
  });

  const {
    loading: mutating,
    mutate
  } = useMutation({
    mutation: CHANGE_DOG_AGE,
  });

  return <DogView loading={loading || mutating} error={error} data={data} refetch={refetch} changeDogAge={mutate} />
};

const Owner = ({id}) => {
  const {
    loading,
    data,
    error,
    refetch
  } = useWatchQuery({
    query: OWNER,
    variables: {
      id,
    },
  });
  return <OwnerView loading={loading} error={error} data={data} refetch={refetch} />
}

const DogPark = ({id}) => {
  const {
    loading,
    data,
    error,
    refetch
  } = useWatchQuery({
    query: DOG_PARK,
  });
  return <DogParkView loading={loading} error={error} data={data} refetch={refetch} />
}

const DogParkByName = ({id}) => {
  const {
    loading,
    data,
    error,
    refetch
  } = useWatchQuery({
    query: DOG_PARK_BY_NAME,
    variables: {
      name: 'FOOBAR'
    }
  });
  return <DogParkView loading={loading} error={error} data={data} refetch={refetch} />
}


const Dogs = () => {
  return (
    <>
      <Dog id="1A" />
      <Dog id="2A" />
      <Dog id="1A" />
      <Dog id="3A" />
      <Dog id="4A" />
      <Owner id="1B" />
      <DogPark />
      <DogParkByName />
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
