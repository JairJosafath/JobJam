import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApiStruct } from "./structs/rest-api";
import { AuthStruct } from "./structs/auth/auth";
import { AuthResource } from "./structs/auth/resources/auth";

export class JobJamStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const restApiConstruct = new RestApiStruct(this, "JobJamRestApi");
		const authConstruct = new AuthStruct(this, "JobJamAuth");

		const authResources = new AuthResource(
			this,
			"JobJamAuthResources",
			restApiConstruct.restApi,
			authConstruct.userPool,
			authConstruct.clientId.userPoolClientId
		);
	}
}
