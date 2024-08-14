import {
  AwsIntegration,
  MockIntegration,
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
import { AssetCode, Runtime, Function, Code } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import path = require("path");

export class AuthAdminResource extends Construct {
  constructor(
    scope: Construct,
    id: string,
    api: RestApi,
    userPool: UserPool,
    clientId: string,
    authorizer: RequestAuthorizer
  ) {
    super(scope, id);

    const adminResource = api.root.addResource("admin");

    const interviewerResource = adminResource.addResource("interviewer");
    const addUserRole = new Role(this, "AddInterviewerRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: "Role to add interviewer",
      inlinePolicies: {
        addInterviewerPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["cognito-idp:AdminCreateUser"],
              resources: [userPool.userPoolArn],
            }),
          ],
        }),
      },
    });
    interviewerResource.addMethod(
      "POST",
      new AwsIntegration({
        service: "cognito-idp",
        action: "AdminCreateUser",
        integrationHttpMethod: "POST",
        options: {
          credentialsRole: addUserRole,
          requestTemplates: {
            "application/json": JSON.stringify({
              UserPoolId: userPool.userPoolId,
              Username: "$input.path('$.username')",
              MessageAction: "SUPPRESS",
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
                {
                  Name: "custom:department",
                  Value: "$input.path('$.department')",
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
      }),
      { authorizer }
    );

    const hiringManagerResource = adminResource.addResource("hiring-manager");
    hiringManagerResource.addMethod(
      "POST",
      new AwsIntegration({
        service: "cognito-idp",
        action: "AdminCreateUser",
        integrationHttpMethod: "POST",
        options: {
          credentialsRole: addUserRole,
          requestTemplates: {
            "application/json": JSON.stringify({
              UserPoolId: userPool.userPoolId,
              Username: "$input.path('$.username')",
              MessageAction: "SUPPRESS",
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
                  Value: "hiring-manager",
                },
                {
                  Name: "custom:department",
                  Value: "$input.path('$.department')",
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
                  message: "Hiring Manager created",
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
