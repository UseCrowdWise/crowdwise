// Generic function to call
export async function callApi(url: string, isJson: boolean = true) {
  const result = await fetch(url);
  if (isJson) {
    return result.json();
  } else {
    return result.text();
  }
}
