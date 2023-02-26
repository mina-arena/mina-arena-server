export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => {return '_' + c.toLowerCase()});
}

export function camelToScreamingSnake(str) {
  return camelToSnake(str).toUpperCase();
}

// Given an array, return an array containing only one
// instance of each unique element found in the input array
export function unique(array: any[]): any[] {
  return array.filter(function(value, index, arr) {
    return array.indexOf(value) === index;
  });
}
