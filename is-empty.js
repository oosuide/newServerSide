// the code below is a return statement; it returns based on seperate possiblities. If the return value of a possibility is true, the function terminates, else it moves on to the next condition.
const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

module.exports = isEmpty;
