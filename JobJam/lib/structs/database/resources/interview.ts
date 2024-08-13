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
                  S: `#if($input.params('value')!='')$input.params('value')#{else}$util.parseJson($context.authorizer.claims).email#end`,
                },
                ":sk": {
                  S: "Application#",
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
      {
        authorizer,
      }
    );

    const createInterviewRole = new Role(this, "CreateInterviewRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: "Role for hiringmanager to create interview",
      inlinePolicies: {
        createInterviewPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["dynamodb:UpdateItem"],
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
        action: "UpdateItem",
        options: {
          credentialsRole: createInterviewRole,
          requestTemplates: {
            "application/json": vtlSerializer({
              TableName: dynamoDBTable.tableName,
              Key: {
                pk: { S: "Job#$input.path('jobId')" },
                sk: { S: "Application#$input.path('applicationId')" },
              },
              UpdateExpression:
                "set #iv = :iv, #ie = :ie, #ae = :ae, #lu = :lu, #s = :s",
              ExpressionAttributeValues: {
                ":iv": { M: { Date: { S: "TBD" }, Time: { S: "TBD" } } },
                ":ie": { S: "$input.path('interviewerEmail')" },
                ":ae": { S: "$input.path('applicantEmail')" },
                ":lu": { S: "$context.requestTime" },
                ":s": { S: "PENDING_INTERVIEW" },
              },
              ExpressionAttributeNames: {
                "#iv": "Interview",
                "#ie": "InterviewerEmail",
                "#ae": "ApplicantEmail",
                "#lu": "LastUpdated",
                "#s": "Status",
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

    interviewResource.addMethod(
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
                pk: { S: "$input.path('jobId')" },
                sk: { S: "$input.path('applicationId')" },
              },
              UpdateExpression: "set #iv = :iv, #lu = :lu, #s = :s",
              ExpressionAttributeValues: {
                ":iv": {
                  M: {
                    Date: { S: "$input.path('date')" },
                    Time: { S: "$input.path('time')" },
                    Location: { S: "$input.path('location')" },
                  },
                },
                ":lu": { S: "$context.requestTime" },
                ":s": { S: "INTERVIEW_SCHEDULED" },
              },
              ExpressionAttributeNames: {
                "#iv": "Interview",
                "#lu": "LastUpdated",
                "#s": "Status",
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

    interviewResource.addResource("feedback").addMethod(
      "POST",
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
                pk: { S: "$input.path('jobId')" },
                sk: { S: "$input.path('applicationId')" },
              },
              UpdateExpression: "set #iv.#f = :f, #lu = :lu, #s = :s",
              ExpressionAttributeValues: {
                ":f": { S: "$input.path('feedback')" },
                ":lu": { S: "$context.requestTime" },
                ":s": { S: "INTERVIEW_COMPLETED" },
              },
              ExpressionAttributeNames: {
                "#iv": "Interview",
                "#f": "Feedback",
                "#lu": "LastUpdated",
                "#s": "Status",
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
      {
        authorizer,
      }
    );

    const offerResource = interviewResource.addResource("offer");

    offerResource.addMethod(
      "POST",
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
          credentialsRole: updateInterviewRole,
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
