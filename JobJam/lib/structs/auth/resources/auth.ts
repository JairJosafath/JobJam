import {
	AwsIntegration,
	PassthroughBehavior,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class AuthResource extends Construct {
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

		const loginResource = api.root.addResource("login");
		loginResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "InitiateAuth",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							AuthParameters: {
								USERNAME: "$input.path('$.username')",
								PASSWORD: "$input.path('$.password')",
							},
							AuthFlow: "USER_PASSWORD_AUTH",
							ClientId: clientId,
							UserPoolId: userPool.userPoolId,
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

		const confirmResource = api.root.addResource("confirm");
		confirmResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ConfirmSignUp",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							Username: "$input.path('$.username')",
							ConfirmationCode: "$input.path('$.confirmationCode')",
							ClientId: clientId,
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "User confirmed",
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

		const resetPasswordResource = api.root.addResource("reset-password");
		resetPasswordResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ForgotPassword",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							ClientId: clientId,
							Username: "$input.path('$.username')",
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "Password reset code sent",
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

		const confirmResetResource = api.root.addResource("confirm");
		confirmResetResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ConfirmForgotPassword",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							ClientId: clientId,
							Username: "$input.path('$.username')",
							ConfirmationCode: "$input.path('$.confirmationCode')",
							Password: "$input.path('$.password')",
						}),
					},
					passthroughBehavior: PassthroughBehavior.NEVER,
					integrationResponses: [
						{
							statusCode: "200",
							responseTemplates: {
								"application/json": JSON.stringify({
									message: "Password reset",
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

		const authChallengeResource = api.root.addResource("challenge");
		authChallengeResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "RespondToAuthChallenge",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							ClientId: clientId,
							ChallengeName: "$input.path('$.challengeName')",
							ChallengeResponses: {
								USERNAME: "$input.path('$.username')",
								NEW_PASSWORD: "$input.path('$.newPassword')",
							},
							Session: "$input.path('$.session')",
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
	}
}
