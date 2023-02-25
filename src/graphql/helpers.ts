export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (c) => {return '_' + c.toLowerCase()});
}

export function camelToScreamingSnake(str) {
  return camelToSnake(str).toUpperCase();
}