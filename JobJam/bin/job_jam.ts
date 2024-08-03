#!/usr/bin/env node
/**
 * Understanding the Stack construct
 * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stack.html#class-stack-construct
 * https://docs.aws.amazon.com/cdk/v2/guide/stacks.html
 *
 */
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { JobJamStack } from "../lib/job_jam-stack";

const app = new cdk.App();
new JobJamStack(app, "JobJamStack-dev", {
	description: "JobJam stack for dev environment",
	tags: {
		env: "dev",
		project: "jobjam",
	},
});

new JobJamStack(app, "JobJamStack-prod", {
	description: "JobJam stack for prod environment",
	tags: {
		env: "prod",
		project: "jobjam",
	},
	terminationProtection: true,
});
