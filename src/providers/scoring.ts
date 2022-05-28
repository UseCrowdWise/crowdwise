const HOST =
  "https://crowdwise-ml-jhhom.ondigitalocean.app/api/score_documents";
const THRESHOLD = -5.0;
const HEADERS = {
  "X-API-KEY": "5b58147b-d869-465a-ab43-41c2ffc29ae0",
  "Content-Type": "application/json",
  accept: "application/json",
};

export const filterDocuments = async (
  documents: string[][]
): Promise<boolean[]> => {
  const response = await fetch(HOST, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(documents),
  });
  const scores: number[] = await response.json();
  console.log(scores);
  return scores.map((score) => score > THRESHOLD);
};
