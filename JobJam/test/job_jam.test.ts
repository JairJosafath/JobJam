import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as JobJam from "../lib/job_jam-stack";

// example test. To run these tests, uncomment this file along with the
// example resource in lib/job_jam-stack.ts
test("SQS Queue Created", () => {
	// const app = new cdk.App();
	// // WHEN
	// const stack = new JobJam.JobJamStack(app, "jobjamstack-dev");
	// // THEN
	// const template = Template.fromStack(stack);
	// template.hasResourceProperties("AWS::SQS::Queue", {
	// 	VisibilityTimeout: 300,
	// });
});
