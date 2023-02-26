export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => {return '_' + c.toLowerCase()});
}

export function camelToScreamingSnake(str) {
  return camelToSnake(str).toUpperCase();
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
