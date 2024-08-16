import { App, Resource } from "aws-cdk-lib";
import { JobJamStack } from "../../lib/job_jam-stack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import { Policy } from "aws-cdk-lib/aws-iam";

const app = new App();

const stack = new JobJamStack(app, "jobjamstack-dev");

const template = Template.fromStack(stack);
const policyNames = [
  { name: "SignupPolicy", action: ["cognito-idp:SignUp"] },
  { name: "LoginPolicy", action: ["cognito-idp:InitiateAuth"] },
  { name: "createJobPolicy", action: ["s3:PutObject", "s3:GetObject"] },
  // you can add more as needed
];

policyNames.forEach((policyName) => {
  const capture = new Capture();

  template.hasResourceProperties("AWS::IAM::Role", {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.anyValue(),
      Version: Match.anyValue(),
    }),
    Description: Match.anyValue(),
    Policies: Match.arrayWith([
      {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            {
              Action: capture,
              Effect: "Allow",
              Resource: Match.anyValue(),
            },
          ]),
        }),
        PolicyName: policyName.name,
      },
    ]),
  });

  test(
    "verify created roles have the correct permissions " + policyName.name,
    () => {
      if (policyName.action.length === 1) {
        console.log(
          `Policy Name: ${policyName.name} has action: ${capture.asString()}`
        );
        expect(capture.asString()).toEqual(policyName.action[0]);
      } else if (policyName.action.length > 1) {
        console.log(
          `Policy Name: ${policyName.name} has action: ${capture.asArray()}`
        );
        expect(capture.asArray()).toEqual(policyName.action);
      }
    }
  );
});
