export function vtlSerializer(data: object): string;
/** remove quotations from values in VTL when using JSON.stringify
 * for example {"SS": "[\"JavaScript\", \"React\", \"Node.js\"]"} becomes {"SS": ["JavaScript", "React", "Node.js"]}
 * this is necessary for DynamoDB to accept the data
 */

export function vtlSerializer(data: object) {
  const json = JSON.stringify(data);
  const regex = /"SS":\s*"\[(.*?)\]"/g;
  const result = json.replace(regex, (match, p1) => {
    return match.replace(/"\[/g, "[").replace(/\]"/g, "]").replace(/\\"/g, '"');
  });
  return result;
}
