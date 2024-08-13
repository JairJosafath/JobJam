import { vtlSerializer } from "../../lib/utils/vtl";

const test = vtlSerializer({
  TableName: "tablename",
  Item: {
    pk: {
      S: "Job#123",
    },
    sk: {
      S: "Application#123",
    },
    Title: {
      S: "Solutions Architect",
    },
    Skills: {
      SS: `[#foreach($skill in $input.path('$.requiredSkills'))"$skill"#if($foreach.hasNext),#end#end]`,
    },
  },
});

// console.log(test);

// output should be

/**
 
 {
    "TableName": "tablename",
    "Item": {
        "pk": {
            "S": "Job#123"
        },
        "sk": {
            "S": "Application#123"
        },
        "Title": {
            "S": "Solutions Architect"
        },
        "Skills": {
            "SS": [#foreach($skill in $input.path('$.requiredSkills'))"$skill"#if($foreach.hasNext),#end#end
            ]
        }
    }
}
 */

console.log(
  vtlSerializer({
    TableName:
      "jobjamstack-dev-JobJamDatabaseJobJamTable351A4D0F-1AUYX73YMXHT5",
    IndexName: "$input.params('index')",
    ExpressionAttributeValues: {
      ":pk": {
        S: `#if($input.params('value')!="")$input.params('value')#{else}$util.parseJson($context.authorizer.claims).email#end`,
      },
      ":sk": {
        S: "Application#",
      },
    },
    ExpressionAttributeNames: {
      "#pk": "$input.params('key')",
      "#sk": "sk",
    },
    KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
  })
);
