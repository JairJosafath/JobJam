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
							responseTemplates: {
								"application/json": JSON.stringify({
									accessToken:
										"$util.escapeJavaScript($input.path('$.AuthenticationResult.AccessToken'))",
									idToken:
										"$util.escapeJavaScript($input.path('$.AuthenticationResult.IdToken'))",
									refreshToken:
										"$util.escapeJavaScript($input.path('$.AuthenticationResult.RefreshToken'))",
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
	}
}
