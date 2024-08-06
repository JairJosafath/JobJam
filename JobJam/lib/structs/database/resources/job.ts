import {
	AwsIntegration,
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

export class JobResource extends Construct {
	constructor(
		scope: Construct,
		id: string,
		api: RestApi,
		userPool: UserPool,
		clientId: string,
		dynamoDBTable: TableV2
	) {
		super(scope, id);

		const authorizer = new RequestAuthorizer(this, "JobAuthorizer", {
			handler: new Function(this, "JobAuthorizerFunction", {
				runtime: Runtime.NODEJS_20_X,
				handler: "index.handler",
				code: Code.fromAsset(path.join(__dirname, "authorizer")),
				environment: {
					COGNITO_USER_POOL_ID: userPool.userPoolId,
					COGNITO_CLIENT_ID: clientId,
				},
			}),
			identitySources: ["method.request.header.Authorization"],
		});

		const jobResource = api.root.addResource("jobs");
		const createJobRole = new Role(this, "CreateJobRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for hiring manager to create job",
			inlinePolicies: {
				createJobPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:PutItem"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});
		jobResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "dynamodb",
				integrationHttpMethod: "POST",
				action: "PutItem",
				options: {
					credentialsRole: createJobRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							Item: {
								pk: {
									S: "Job#$context.requestId",
								},
								sk: {
									S: "Info",
								},
								Title: {
									S: "$input.path('$.title')",
								},
								Department: {
									S: "$input.path('$.department')",
								},
								Location: {
									S: "$input.path('$.location')",
								},
								Type: {
									S: "$input.path('$.type')",
								},
								Level: {
									S: "$input.path('$.level')",
								},
								SalaryRange: {
									M: {
										min: {
											N: "$input.path('$.salaryRange.min')",
										},
										max: {
											N: "$input.path('$.salaryRange.max')",
										},
										currency: {
											S: "$input.path('$.salaryRange.currency')",
										},
									},
								},
								JobDescription: {
									S: "$input.path('$.jobDescription')",
								},
								RequiredSkills: {
									SS: `[#foreach($skill in $input.path('$.requiredSkills'))"$skill"#if($foreach.hasNext),#end#end]`,
								},
								Education: {
									SS: `[#foreach($edu in $input.path('$.Education'))"$edu"#if($foreach.hasNext),#end#end]`,
								},
								Deadline: {
									S: "$input.path('$.deadline')",
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
							selectionPattern: "2\\d{2}",
							responseTemplates: {
								"application/json": JSON.stringify({
									jobId: "$context.requestId",
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
			{ authorizer }
		);

		const listJobsRole = new Role(this, "ListJobsRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for hiring manager to list jobs",
			inlinePolicies: {
				listJobsPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:Query"],
							resources: [`${dynamoDBTable.tableArn}/index/JobsBy*`],
							effect: Effect.ALLOW,
						}),
					],
				}),
			},
		});

		jobResource.addMethod(
			"GET",
			new AwsIntegration({
				service: "dynamodb",
				integrationHttpMethod: "POST",
				action: "Query",
				options: {
					credentialsRole: listJobsRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							IndexName: "$input.params('index')",
							ExpressionAttributeValues: {
								":pk": {
									S: "$input.params('value')",
								},
								":sk": {
									S: "Info",
								},
							},
							ExpressionAttributeNames: {
								"#pk": "$input.params('key')",
								"#sk": "sk",
							},
							KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
							Limit: 10,
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							selectionPattern: "2\\d{2}",
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
			{}
		);
	}
}
