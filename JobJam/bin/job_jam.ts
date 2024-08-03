#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { JobJamStack } from "../lib/job_jam-stack";

const app = new cdk.App();
new JobJamStack(app, "JobJamStack-dev", {
	tags: {
		env: "dev",
		project: "jobjam",
	},
});

new JobJamStack(app, "JobJamStack-prod", {
	tags: {
		env: "prod",
		project: "jobjam",
	},
});
