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

    const writeOfferRole = new Role(this, "WriteOfferRole", {
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

    const offerResource = api.root.addResource("offer");

    offerResource.addMethod(
      "POST",
      new AwsIntegration({
        service: "dynamodb",
        integrationHttpMethod: "POST",
        action: "UpdateItem",
        options: {
          credentialsRole: writeOfferRole,
          requestTemplates: {
            "application/json": vtlSerializer({
              TableName: dynamoDBTable.tableName,
              Key: {
                pk: { S: "$input.path('jobId')" },
                sk: { S: "$input.path('applicationId')" },
              },
              UpdateExpression: "set #s = :s, #lu = :lu, #o = :o",
              ExpressionAttributeValues: {
                ":s": { S: "OFFER_MADE" },
                ":lu": { S: "$context.requestTime" },
                ":o": { S: "$input.path('offer')" },
              },
              ExpressionAttributeNames: {
                "#s": "Status",
                "#lu": "LastUpdated",
                "#o": "Offer",
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

    offerResource.addMethod(
      "PATCH",
      new AwsIntegration({
        service: "dynamodb",
        integrationHttpMethod: "POST",
        action: "UpdateItem",
        options: {
          credentialsRole: writeOfferRole,
          requestTemplates: {
            "application/json": vtlSerializer({
              TableName: dynamoDBTable.tableName,
              Key: {
                pk: { S: "$input.path('jobId')" },
                sk: { S: "$input.path('applicationId')" },
              },
              UpdateExpression: "set #s = :s, #lu = :lu, #o = :o",
              ExpressionAttributeValues: {
                ":s": { S: "$input.path('status')" },
                ":lu": { S: "$context.requestTime" },
                ":o": { S: "$input.path('offer')" }, // this is the offer with the signatures indicating the acceptance of the offer
              },
              ExpressionAttributeNames: {
                "#s": "Status",
                "#lu": "LastUpdated",
                "#o": "Offer",
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
