import { readFileSync } from 'fs';

const schemaPath = './src/graphql/schema.graphql';

export default readFileSync(schemaPath, { encoding: 'utf-8' });
