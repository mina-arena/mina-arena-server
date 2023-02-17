import { randomBytes } from 'crypto';
class Message {
    constructor(id, content, author) {
        this.id = id;
        this.content = content;
        this.author = author;
    }
}
// For now create a mock database keyed on object IDs
var fakeDatabase = {};
// Define resolver functions for each GraphQL API operation
export default {
    getMessage: (args) => {
        if (!fakeDatabase[args.id]) {
            throw new Error('no message exists with id ' + args.id);
        }
        return fakeDatabase[args.id];
    },
    createMessage: (args) => {
        // Create a random id for our "database".
        var id = randomBytes(10).toString('hex');
        var msg = new Message(id, args.input.content, args.input.author);
        fakeDatabase[id] = msg;
        return msg;
    },
    updateMessage: (args) => {
        if (!fakeDatabase[args.id]) {
            throw new Error('no message exists with id ' + args.id);
        }
        var msg = new Message(args.id, args.input.content, args.input.author);
        fakeDatabase[args.id] = msg;
        return msg;
    },
    quoteOfTheDay: () => {
        return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
    },
    random: () => {
        return Math.random();
    },
    rollDice: (args) => {
        var output = [];
        for (var i = 0; i < args.numDice; i++) {
            output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
        }
        return output;
    }
};
//# sourceMappingURL=resolvers.js.map