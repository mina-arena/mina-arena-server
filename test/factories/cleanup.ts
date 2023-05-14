import * as Models from '../../src/models';

export default async function cleanup() {
  let modelNames = Object.keys(Models);
  for (const modelName of modelNames) {
    let model = Models[modelName];
    await model.destroy({ where: {} });
  }
}