import { Resolvers, Message } from './__generated__/resolvers-types';
import { randomBytes } from 'crypto';

// For now create a mock database keyed on object IDs
var fakeDatabase = {};

const resolvers: Resolvers = {
  Query: {
    getMessage: (
      parent,
      args: { id: string },
      contextValue,
      info
    ): Message => {
      if (!fakeDatabase[args.id]) {
        throw new Error('no message exists with id ' + args.id);
      }
      return fakeDatabase[args.id];
    },
    quoteOfTheDay: (): string => {
      return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    random: (): number => {
      return Math.random();
    },
    rollDice: (
      parent,
      args: { numDice: number, numSides: number },
      contextValue,
      info
    ): number[] => {
      var output: number[] = [];
      for (var i = 0; i < args.numDice; i++) {
        output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
      }
      return output;
    },
  },
  Mutation: {
    createMessage: (
      parent,
      args: { input: { content: string, author: string }},
      contextValue,
      info
    ): Message => {
      // Create a random id for our "database".
      var id = randomBytes(10).toString('hex');
      var msg: Message = { id, author: args.input.author, content: args.input.content };
      fakeDatabase[id] = msg;
      return msg;
    },
    updateMessage: (
      parent,
      args: { id: string, input: { content: string, author: string }},
      contextValue,
      info
    ): Message => {
      if (!fakeDatabase[args.id]) {
        throw new Error('no message exists with id ' + args.id);
      }
      var msg: Message = { id: args.id, author: args.input.author, content: args.input.content };
      fakeDatabase[args.id] = msg;
      return msg;
    },
  }
};

export default resolvers;