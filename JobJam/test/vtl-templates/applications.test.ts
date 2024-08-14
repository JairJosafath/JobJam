import { vtlSerializer } from "../../lib/utils/vtl";

const output = vtlSerializer({
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

test('VTL Serializer removes "" around array', () => {
  expect(output).toEqual(
    `{"TableName":"tablename","Item":{"pk":{"S":"Job#123"},"sk":{"S":"Application#123"},"Title":{"S":"Solutions Architect"},"Skills":{"SS":[#foreach($skill in $input.path('$.requiredSkills'))"$skill"#if($foreach.hasNext),#end#end]}}}`
  );
});
