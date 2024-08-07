import {
	AwsIntegration,
	PassthroughBehavior,
	RequestAuthorizer,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
	ManagedPolicy,
	PolicyDocument,
	PolicyStatement,
	Role,
	ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { AuthAdminResource } from "./admin.auth";
import { CfnOutput } from "aws-cdk-lib";

export class AuthResource extends Construct {
	constructor(
		scope: Construct,
		id: string,
		api: RestApi,
		userPool: UserPool,
		clientId: string,
		authorizer: RequestAuthorizer
	) {
		super(scope, id);

		new AuthAdminResource(
			scope,
			"AdminAuthResource",
			api,
			userPool,
			clientId,
			authorizer
		);
		const loginResource = api.root.addResource("login");
		const loginRole = new Role(this, "LoginRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				LoginPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:InitiateAuth"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		loginResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "InitiateAuth",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: loginRole,
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

		const confirmResource = api.root.addResource("confirm-signup");
		const confirmSignupRole = new Role(this, "ConfirmSignupRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				ConfirmSignupPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:ConfirmSignUp"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		confirmResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ConfirmSignUp",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: confirmSignupRole,
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
		const resetPasswordRole = new Role(this, "ResetPasswordRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				ResetPasswordPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:ForgotPassword"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		resetPasswordResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ForgotPassword",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: resetPasswordRole,
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

		const confirmResetResource = api.root.addResource("confirm-reset");
		const confirmResetRole = new Role(this, "ConfirmResetRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				ConfirmResetPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:ConfirmForgotPassword"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		confirmResetResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "ConfirmForgotPassword",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: confirmResetRole,
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
		const authChallengeRole = new Role(this, "AuthChallengeRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				AuthChallengePolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:RespondToAuthChallenge"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		authChallengeResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "RespondToAuthChallenge",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: authChallengeRole,
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

		const signupResource = api.root.addResource("signup");
		const signupRole = new Role(this, "SignupRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to authenticate users in the Cognito User Pool",
			inlinePolicies: {
				SignupPolicy: new PolicyDocument({
					statements: [
						new PolicyStatement({
							actions: ["cognito-idp:SignUp"],
							resources: [userPool.userPoolArn],
						}),
					],
				}),
			},
		});
		signupResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "SignUp",
				integrationHttpMethod: "POST",
				options: {
					credentialsRole: signupRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							ClientId: clientId,
							Username: "$input.path('$.username')",
							Password: "$input.path('$.password')",
							UserAttributes: [
								{
									Name: "email",
									Value: "$input.path('$.email')",
									"custom:role": "applicant",
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
									message: "User signed up",
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
