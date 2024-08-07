import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApiStruct } from "./structs/rest-api";
import { AuthStruct } from "./structs/auth/auth";
import { AuthResource } from "./structs/auth/resources/auth";
import { DatabaseStruct } from "./structs/database/database";
import { JobResource } from "./structs/database/resources/job";
import { ApplicationResource } from "./structs/database/resources/application";
import { NotificationStruct } from "./structs/notification/notification";
import { RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import path = require("path");

export class JobJamStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const restApiConstruct = new RestApiStruct(this, "JobJamRestApi");
		const authConstruct = new AuthStruct(this, "JobJamAuth");
		const databaseConstruct = new DatabaseStruct(this, "JobJamDatabase");
		const notificationConstruct = new NotificationStruct(
			this,
			"JobJamNotification",
			databaseConstruct.dynamoDBTable
		);

		const authorizer = new RequestAuthorizer(this, "JobAuthorizer", {
			handler: new Function(this, "JobAuthorizerFunction", {
				runtime: Runtime.NODEJS_20_X,
				handler: "index.handler",
				code: Code.fromAsset(path.join(__dirname, "authorizer")),
				environment: {
					COGNITO_USER_POOL_ID: authConstruct.userPool.userPoolId,
					COGNITO_CLIENT_ID: authConstruct.clientId.userPoolClientId,
				},
			}),
			identitySources: ["method.request.header.Authorization"],
		});

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
			databaseConstruct.dynamoDBTable,
			authorizer
		);

		const applicationResources = new ApplicationResource(
			this,
			"JobJamApplicationResources",
			restApiConstruct.restApi,
			authConstruct.userPool,
			authConstruct.clientId.userPoolClientId,
			databaseConstruct.dynamoDBTable,
			authorizer
		);
	}
}
