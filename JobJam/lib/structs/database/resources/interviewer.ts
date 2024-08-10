import {
	AuthorizationType,
	AwsIntegration,
	CognitoUserPoolsAuthorizer,
	MockIntegration,
	PassthroughBehavior,
	RequestAuthorizer,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Function, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import path = require("path");
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
	Effect,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { vtlSerializer } from "../../../utils/vtl";
import { Application } from "aws-cdk-lib/aws-appconfig";
import { Aws } from "aws-cdk-lib";

export class InterviewerResource extends Construct {
	constructor(
		scope: Construct,
		id: string,
		api: RestApi,
		userPool: UserPool,
		clientId: string,
		dynamoDBTable: TableV2,
		lambdaAuthorizer: RequestAuthorizer
	) {
		super(scope, id);
		const authorizer = new CognitoUserPoolsAuthorizer(this, "PoolAuthorizer", {
			cognitoUserPools: [userPool],
		});

		const applicationResource = api.root.addResource("interviewers");

		// query interviewers by department
		const queryInterviewersRole = new Role(this, "QueryInterviewersRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for hiring manager to query interviewers by department",
			inlinePolicies: {
				queryInterviewersPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:Query"],
							resources: [
								dynamoDBTable.tableArn,
								`${dynamoDBTable.tableArn}/index/InterviewersByDepartment`,
							],
						}),
					],
				}),
			},
		});

		applicationResource.addMethod(
			"GET",
			new AwsIntegration({
				service: "dynamodb",
				action: "Query",
				options: {
					credentialsRole: queryInterviewersRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							TableName: dynamoDBTable.tableName,
							IndexName: "InterviewersByDepartment",
							KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
							ExpressionAttributeValues: {
								":pk": {
									S: "$input.params('department')",
								},
								":sk": {
									S: "Interviewer#",
								},
							},
							ExpressionAttributeNames: {
								"#pk": "Department",
								"#sk": "pk",
							},
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							selectionPattern: "2\\d{2}",
						},
						{
							statusCode: "400",
							selectionPattern: "4\\d{2}",
						},
						{
							statusCode: "500",
							selectionPattern: "5\\d{2}",
						},
					],
				},
			}),
			{ authorizer }
		);
	}
}
