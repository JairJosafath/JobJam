/**
 * 
a hiring manager should be able to create jobs. A Job has the following attributes

Name: Job

Title: string

Department: string

Location: string

Type: Enum(full-time, part-time, contract, freelancer, volunteer, internship)

Level: Enum(entry, mid, senior, executive)

SalaryRange: map{min:int, max:int, currnecy:string}

JobDescription: String

RequiredSkills: String[]

Education: String[]

Deadline: String[]

Contact: map{email:string,phone:string}

datecreated

lastupdated

This will be under the PK = Department#<id> SK = Job#<id>#Info

 */
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
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

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

		const jobResource = api.root.addResource("job");
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
						"application/json": JSON.stringify({
							TableName: dynamoDBTable.tableName,
							Item: {
								pk: {
									S: "Department#$input.path('$.department')",
								},
								sk: {
									S: "Job#$context.requestId#Info",
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
									SS: "$input.path('$.requiredSkills')",
								},
								Education: {
									SS: "$input.path('$.education')",
								},
								Deadline: {
									SS: "$input.path('$.deadline')",
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
									message: "Job created successfully",
								}),
							},
						},
						{
							selectionPattern: "4\\d{2}",
							statusCode: "400",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "$input.path('$.message')",
								}),
							},
						},
						{
							selectionPattern: "5\\d{2}",
							statusCode: "500",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "$input.path('$.message')",
								}),
							},
						},
					],
				},
			}),
			{ authorizer }
		);
	}
}
