import * as cdk from "aws-cdk-lib";
import { JobJamStack } from "../../lib/job_jam-stack";
import { Template } from "aws-cdk-lib/assertions";

describe("JobJamStack", () => {
	test("synthesizes the way we expect", () => {
		const app = new cdk.App();
		const stack = new JobJamStack(app, "Stack");
		const template = Template.fromStack(stack);
		//  s3 storage bucket is created
		expect(template.hasResourceProperties("AWS::S3::Bucket", {}));
	});
});
