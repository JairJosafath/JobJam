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

export class ApplicationResource extends Construct {
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

		const applicationResource = api.root.addResource("applications");

		const createApplicationRole = new Role(this, "CreateApplicationRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for applicant to apply for job",
			inlinePolicies: {
				createApplicationPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:PutItem"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});

		applicationResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "dynamodb",
				action: "PutItem",
				options: {
					credentialsRole: createApplicationRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							Item: {
								pk: {
									S: "Job#$input.path('$.jobId')",
								},
								sk: {
									S: "Application#$context.requestId",
								},
								ApplicationId: {
									S: "$context.requestId",
								},
								JobId: {
									S: "$input.path('$.jobId')",
								},

								ApplicantId: {
									S: "#if($context.authorizer.claims.sub)$context.authorizer.claims.sub#{else}unauthenticated#end",
								},
								ApplicantEmail: {
									S: "#if($context.authorizer.claims.email)$context.authorizer.claims.email#{else}unauthenticated#end",
								},
								Status: {
									S: "PENDING",
								},
								Resume: {
									S: "$input.path('$.resume')",
								},
								CoverLetter: {
									S: "$input.path('$.coverLetter')",
								},
								Contact: {
									M: {
										email: {
											S: "$input.path('$.contact.email')",
										},
										phone: {
											S: "$input.path('$.contact.phone')",
										},
									},
								},
								datecreated: {
									S: "$context.requestTime",
								},
								lastupdated: {
									S: "$context.requestTime",
								},
							},
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							responseTemplates: {
								"application/json": JSON.stringify({
									applicationId: "$context.requestId",
								}),
							},
						},
						{
							selectionPattern: "4\\d{2}",
							statusCode: "400",
						},
						{
							selectionPattern: "5\\d{2}",
							statusCode: "500",
						},
					],
				},
			}),
			{
				authorizationType: AuthorizationType.COGNITO,
				authorizer,
			}
		);

		const getApplicationsRole = new Role(this, "GetApplicationsRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for applicant to get their applications",
			inlinePolicies: {
				getApplicationsPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:Query"],
							resources: [
								`${dynamoDBTable.tableArn}/index/*`,
								dynamoDBTable.tableArn,
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
					credentialsRole: getApplicationsRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
							ExpressionAttributeValues: {
								":pk": {
									S: "Job#$input.params('jobId')",
								},
								":sk": {
									S: "Application#",
								},
							},
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
						},
						{
							selectionPattern: "4\\d{2}",
							statusCode: "400",
						},
						{
							selectionPattern: "5\\d{2}",
							statusCode: "500",
						},
					],
				},
			}),
			{
				authorizer: lambdaAuthorizer,
			}
		);

		const updateApplicationRole = new Role(this, "UpdateApplicationRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for applicant to update their application",
			inlinePolicies: {
				updateApplicationPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:UpdateItem"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});

		applicationResource.addResource("{applicationId}").addMethod(
			"PATCH",
			new AwsIntegration({
				service: "dynamodb",
				action: "UpdateItem",
				options: {
					credentialsRole: updateApplicationRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							Key: {
								pk: {
									S: "Job#$input.path('$.jobId')",
								},
								sk: {
									S: "Application#$method.request.path.applicationId",
								},
							},
							UpdateExpression: "SET #status = :status and #l = :l",
							ExpressionAttributeNames: {
								"#status": "Status",
								"#l": "lastupdated",
							},
							ExpressionAttributeValues: {
								":status": {
									S: "$input.path('$.status')",
								},
								":l": {
									S: "$context.requestTime",
								},
							},
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
						},
						{
							selectionPattern: "4\\d{2}",
							statusCode: "400",
						},
						{
							selectionPattern: "5\\d{2}",
							statusCode: "500",
						},
					],
				},
			}),
			{
				authorizer: lambdaAuthorizer,
			}
		);
	}
}
