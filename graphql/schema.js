import { buildSchema } from 'graphql';

// Construct a schema, using GraphQL schema language
export default buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    getMessage(id: ID!): Message
    quoteOfTheDay: String
    random: Float!
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);
