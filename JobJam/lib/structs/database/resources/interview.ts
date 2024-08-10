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

export class InterviewResource extends Construct {
	constructor(
		scope: Construct,
		id: string,
		api: RestApi,
		userPool: UserPool,
		clientId: string,
		dynamoDBTable: TableV2,
		authorizer: RequestAuthorizer
	) {
		super(scope, id);

		const listInterviewsRole = new Role(this, "ListInterviewsRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for hiring manager or interviewer to list interviews",
			inlinePolicies: {
				listInterviewsPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:Query"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});

		const interviewResource = api.root.addResource("interviews");
		// interviewResource.addMethod(
		// 	"GET",
		// 	new AwsIntegration({
		// 		service: "dynamodb",
		// 		integrationHttpMethod: "POST",
		// 		action: "Query",
		// 		options: {
		// 			credentialsRole: listInterviewsRole,
		// 			requestTemplates: {
		// 				"application/json": vtlSerializer({
		// 					TableName: dynamoDBTable.tableName,
		// 					KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
		// 					ExpressionAttributeValues: {
		// 						":pk": {
		// 							S: "Job#$input.params('jobId')",
		// 						},
		// 						":sk": {
		// 							S: "Interview#",
		// 						},
		// 					},
		// 				}),
		// 			},
		// 			passthroughBehavior: PassthroughBehavior.NEVER,
		// 			integrationResponses: [
		// 				{
		// 					statusCode: "200",
		// 					selectionPattern: "2\\d{2}",
		// 				},
		// 				{
		// 					statusCode: "500",
		// 					selectionPattern: "5\\d{2}",
		// 				},
		// 				{
		// 					statusCode: "400",
		// 					selectionPattern: "4\\d{2}",
		// 				},
		// 			],
		// 		},
		// 	}),
		// 	{
		// 		authorizer,
		// 	}
		// );

		const queryInterviewsByInterviewerRole = new Role(
			this,
			"QueryInterviewsByInterviewerRole",
			{
				assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
				description: "Role for interviewer to query interviews by interviewer",
				inlinePolicies: {
					queryInterviewsByInterviewerPolicy: new PolicyDocument({
						statements: [
							new PolicyStatement({
								actions: ["dynamodb:Query"],
								resources: [
									dynamoDBTable.tableArn,
									`${dynamoDBTable.tableArn}/index/InterviewsByInterviewer`,
								],
							}),
						],
					}),
				},
			}
		);

		interviewResource.addMethod(
			"GET",
			new AwsIntegration({
				service: "dynamodb",
				integrationHttpMethod: "POST",
				action: "Query",
				options: {
					credentialsRole: queryInterviewsByInterviewerRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							IndexName: "$input.params('index')",
							ExpressionAttributeValues: {
								":pk": {
									S: "$input.params('key')",
								},
								":sk": {
									S: "Interview#",
								},
							},
							ExpressionAttributeNames: {
								"#pk": "$input.params('key')",
								"#sk": "sk",
							},
							KeyConditionExpression: "#pk = :pk and begins_with(#sk, :sk)",
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

		const createInterviewRole = new Role(this, "CreateInterviewRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for hiringmanager to create interview",
			inlinePolicies: {
				createInterviewPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:PutItem"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});

		interviewResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "dynamodb",
				integrationHttpMethod: "POST",
				action: "PutItem",
				options: {
					credentialsRole: createInterviewRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							Item: {
								pk: { S: "Job#$input.path('jobId')" },
								sk: { S: "Interview#$context.requestId" },
								InterviewerId: { S: "$input.path('interviewerId')" },
								ApplicationId: { S: "$input.path('applicationId')" },
								Date: { S: "$input.path('date')" },
								Time: { S: "$input.path('time')" },
								Location: { S: "$input.path('location')" },
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

		const updateInterviewRole = new Role(this, "UpdateInterviewRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description: "Role for interviewer to update interview",
			inlinePolicies: {
				updateInterviewPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["dynamodb:UpdateItem"],
							resources: [dynamoDBTable.tableArn],
						}),
					],
				}),
			},
		});

		interviewResource.addResource("{interviewId}").addMethod(
			"PATCH",
			new AwsIntegration({
				service: "dynamodb",
				integrationHttpMethod: "POST",
				action: "UpdateItem",
				options: {
					credentialsRole: updateInterviewRole,
					requestTemplates: {
						"application/json": vtlSerializer({
							TableName: dynamoDBTable.tableName,
							Key: {
								pk: { S: "Job#$input.path('jobId')" },
								sk: { S: "Interview#$method.request.path.interviewId" },
							},
							UpdateExpression:
								"SET #Date = :date, #Time = :time, #Location = :location, #lastUpdated = :lastUpdated",
							ExpressionAttributeValues: {
								":date": { S: "$input.path('date')" },
								":time": { S: "$input.path('time')" },
								":location": { S: "$input.path('location')" },
								":lastUpdated": { S: "$context.requestTime" },
							},
							ExpressionAttributeNames: {
								"#Date": "Date",
								"#Time": "Time",
								"#Location": "Location",
								"#lastUpdated": "lastUpdated",
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
