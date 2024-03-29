export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => {return '_' + c.toLowerCase()});
}

export function camelToScreamingSnake(str) {
  return camelToSnake(str).toUpperCase();
}

export function snakeToCamel(str: string): string {
  return str
    .split("_")
    .reduce(
      (res, word, i) =>
        i === 0
          ? word.toLowerCase()
          : `${res}${word.charAt(0).toUpperCase()}${word
              .substr(1)
              .toLowerCase()}`,
      ""
    );
}

export function diceRoll() {
  return randomInt(1, 6);
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

export function randomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function shuffle(array: any[]): any[] {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Given an array, return an array containing only one
// instance of each unique element found in the input array
export function unique(array: any[]): any[] {
  return array.filter(function(value, index, arr) {
    return array.indexOf(value) === index;
  });
}

// Given an input object and an array of keys,
// enforce that exactly one key has a value provided.
// If yes, return nothing.
// If no, raise an exception.
export function enforceOneOf(input: Object, keys: string[]): void {
  let keysWithValues = [];
  for (const key of keys) {
    let keyValue = input[key];
    if (keyValue) keysWithValues.push(key);
  }
  if (keysWithValues.length > 1) {
    throw new Error(
      `Exactly one of [${keys.join(', ')}] must be provided, but received ` +
      `keys [${keysWithValues.join(', ')}] on input ${JSON.stringify(input)}`
    );
  }
}
