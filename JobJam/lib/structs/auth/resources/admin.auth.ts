import {
	AwsIntegration,
	MockIntegration,
	PassthroughBehavior,
	RequestAuthorizer,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { AssetCode, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class AuthAdminResource extends Construct {
	constructor(
		scope: Construct,
		id: string,
		api: RestApi,
		userPool: UserPool,
		clientId: string
	) {
		super(scope, id);
		const credentialsRole = new Role(this, "AuthenticationRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoPowerUser"),
			],
		});

		const authorizer = new RequestAuthorizer(
			this,
			"AdminAndInterviewerAuthorizer",
			{
				handler: new Function(this, "AdminANDInterviewerAuthorizerFunction", {
					runtime: Runtime.NODEJS_20_X,
					handler: "index.handler",
					code: AssetCode.fromAsset("authorizer"),
				}),
				identitySources: ["method.request.header.Authorization"],
			}
		);

		const interviewerResource = api.root.addResource("interviewer");
		interviewerResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "AdminCreateUser",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							UserPoolId: userPool.userPoolId,
							Username: "$input.path('$.username')",
							TemporaryPassword: "$input.path('$.password')",
							UserAttributes: [
								{
									Name: "email",
									Value: "$input.path('$.email')",
								},
								{
									Name: "email_verified",
									Value: "true",
								},
								{
									Name: "custom:role",
									Value: "interviewer",
								},
							],
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "Interviewer created",
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
			})
		);

		const mockResource = api.root.addResource("interviewer/mock");
		// test lambda authorizer with mock integration
		mockResource.addMethod(
			"GET",
			new MockIntegration({
				passthroughBehavior: PassthroughBehavior.NEVER,
				requestTemplates: {
					"application/json": JSON.stringify({
						statusCode: 200,
					}),
				},
				integrationResponses: [
					{
						statusCode: "200",
						responseTemplates: {
							"application/json": JSON.stringify({
								message: "Mock integration successful",
							}),
						},
					},
					{
						statusCode: "400",
						selectionPattern: "4\\d{2}",
						responseTemplates: {
							"application/json": JSON.stringify({
								message: "$input.path('$.message')",
							}),
						},
					},
					{
						statusCode: "500",
						selectionPattern: "5\\d{2}",
						responseTemplates: {
							"application/json": JSON.stringify({
								message: "$input.path('$.message')",
							}),
						},
					},
				],
			}),
			{
				authorizer,
			}
		);
	}
}
