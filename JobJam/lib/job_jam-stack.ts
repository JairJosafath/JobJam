import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApiStruct } from "./structs/rest-api";
import { AuthStruct } from "./structs/auth/auth";
import { AuthResource } from "./structs/auth/resources/auth";
import { DatabaseStruct } from "./structs/database/database";
import { JobResource } from "./structs/database/resources/job";
import { ApplicationResource } from "./structs/database/resources/application";

export class JobJamStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const restApiConstruct = new RestApiStruct(this, "JobJamRestApi");
		const authConstruct = new AuthStruct(this, "JobJamAuth");
		const databaseConstruct = new DatabaseStruct(this, "JobJamDatabase");

		const authResources = new AuthResource(
			this,
			"JobJamAuthResources",
			restApiConstruct.restApi,
			authConstruct.userPool,
			authConstruct.clientId.userPoolClientId
		);
		const jobResources = new JobResource(
			this,
			"JobJamJobResources",
			restApiConstruct.restApi,
			authConstruct.userPool,
			authConstruct.clientId.userPoolClientId,
			databaseConstruct.dynamoDBTable
		);

		const applicationResources = new ApplicationResource(
			this,
			"JobJamApplicationResources",
			restApiConstruct.restApi,
			authConstruct.userPool,
			authConstruct.clientId.userPoolClientId,
			databaseConstruct.dynamoDBTable
		);
	}
}
