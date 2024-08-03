import { Construct } from "constructs";
import {
	RestApi,
	AwsIntegration,
	Authorizer,
	CognitoUserPoolsAuthorizer,
	AuthorizationType,
	RequestAuthorizer,
} from "aws-cdk-lib/aws-apigateway";
import { CfnOutput } from "aws-cdk-lib";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { AssetCode, Function, Runtime } from "aws-cdk-lib/aws-lambda";

export class AdminAuthResources extends Construct {
	constructor(scope: Construct, id: string, api: RestApi, userPoolId: string) {
		super(scope, id);

		const credentialsRole = new Role(this, "CognitoAdminRole", {
			assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
			description:
				"Role for the API Gateway to create interviewers in the Cognito User Pool",
			managedPolicies: [
				ManagedPolicy.fromAwsManagedPolicyName("AmazonCognitoPowerUser"),
			],
		});

		const authorizer = new RequestAuthorizer(this, "AdminAuthorizer", {
			handler: new Function(this, "AdminANDInterviewerAuthorizerFunction", {
				runtime: Runtime.NODEJS_20_X,
				handler: "index.handler",
				code: AssetCode.fromAsset("authorizer"),
			}),
			identitySources: ["method.request.header.Authorization"],
		});

		const interviewerResource = api.root.addResource("interviewer");
		interviewerResource.addMethod(
			"POST",
			new AwsIntegration({
				service: "cognito-idp",
				action: "AdminCreateUser",
				options: {
					credentialsRole: credentialsRole,
					requestTemplates: {
						"application/json": JSON.stringify({
							UserPoolId: userPoolId,
							Username: "$input.path('$.username')",
							DesiredDeliveryMediums: ["EMAIL"],
							UserAttributes: [
								{
									Name: "email",
									Value: "$input.path('$.email')",
								},
								{
									Name: "custom:role",
									Value: "interviewer",
								},
							],
							TemporaryPassword: "$input.path('$.password')",
						}),
					},
					integrationResponses: [
						{
							statusCode: "200",
							selectionPattern: "2\\d{2}",
							responseTemplates: {
								"application/json": JSON.stringify({
									status: "success",
								}),
							},
						},
						{
							statusCode: "400",
							selectionPattern: "4\\d{2}",
							responseTemplates: {
								"application/json": JSON.stringify({
									status: "unauthorized",
								}),
							},
						},
						{
							statusCode: "500",
							selectionPattern: "5\\d{2}",
							responseTemplates: {
								"application/json": JSON.stringify({
									status: "error",
								}),
							},
						},
					],
				},
			}),
			{
				authorizer: authorizer,
			}
		);

		new CfnOutput(this, "PostInterviewerEndpointURL", {
			value: api.urlForPath(interviewerResource.path),
		}).overrideLogicalId("PostInterviewerEndpointURL");
	}
}
