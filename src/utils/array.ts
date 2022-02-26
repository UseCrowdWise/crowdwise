export const indexOfObjectArr = <T>(arr: T[], element: T) => {
  return arr.map((val) => JSON.stringify(val)).indexOf(JSON.stringify(element));
};
