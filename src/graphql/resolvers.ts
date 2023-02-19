import { randomBytes } from 'crypto';

class Message {
  id: string;
  content: string;
  author: string;

  constructor(id: string, content: string, author: string) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

// For now create a mock database keyed on object IDs
var fakeDatabase = {};

export default {
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
      var msg = new Message(id, args.input.content, args.input.author);
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
      var msg = new Message(args.id, args.input.content, args.input.author);
      fakeDatabase[args.id] = msg;
      return msg;
    },
  }
};