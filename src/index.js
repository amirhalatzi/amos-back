import { typeDefs } from "./graphql-schema";
import { ApolloServer } from "apollo-server";
// import express from "express";
import { v1 as neo4j } from "neo4j-driver";
import { makeAugmentedSchema } from "neo4j-graphql-js";
import dotenv from "dotenv";
// import bodyParser from "body-parser";

// set environment variables from ../.env
dotenv.config();

// const app = express();

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */

const schema = makeAugmentedSchema({
  typeDefs
});

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
  process.env.NEO4J_URI || "bolt://localhost:7687",
  neo4j.auth.basic(
    process.env.NEO4J_USER || "neo4j",
    process.env.NEO4J_PASSWORD || "neo4j"
  )
);

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  context: { driver },
  schema: schema,
  introspection: true,
  playground: true
});

server.listen({port: 4001}).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});

// Specify port and path for GraphQL endpoint
// const port = process.env.GRAPHQL_LISTEN_PORT || 4001;
// const path = "/graphql";

/*
* Optionally, apply Express middleware for authentication, etc
* This also also allows us to specify a path for the GraphQL endpoint
*/
// server.applyMiddleware({app, path});

// app.use(bodyParser.json());

// const submitReview = (req, res) => {
//   // console.log('asdf', req)
//   // console.log('req.body', req.body)
//   // console.log('zxcv', res)
//   const {links, topics, requirements} = req.body
//   if (links) {
//     console.log('links', links)
//   }
//   res.send('success')
// }

// app.post('/submit-review', submitReview)

// app.listen({port, path}, () => {
//   console.log(`GraphQL server ready at http://localhost:${port}${path}`);
// });
