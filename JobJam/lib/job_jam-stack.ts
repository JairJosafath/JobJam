import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApiStruct } from "./structs/rest-api";

export class JobJamStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const restApiConstruct = new RestApiStruct(this, "JobJamRestApi");
	}
}
