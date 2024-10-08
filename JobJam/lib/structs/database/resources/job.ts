import {
  AwsIntegration,
  PassthroughBehavior,
  RequestAuthorizer,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { vtlSerializer } from "../../../utils/vtl";

export class JobResource extends Construct {
  constructor(
    scope: Construct,
    id: string,
    api: RestApi,
    dynamoDBTable: TableV2,
    authorizer: RequestAuthorizer
  ) {
    super(scope, id);

    const jobResource = api.root.addResource("jobs");
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
            "application/json": vtlSerializer({
              TableName: dynamoDBTable.tableName,
              Item: {
                pk: {
                  S: "Job#$context.requestId",
                },
                sk: {
                  S: "Info",
                },
                JobId: {
                  S: "$context.requestId",
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
                Status: {
                  S: "$input.path('$.status')",
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
                  SS: `[#foreach($skill in $input.path('$.requiredSkills'))"$skill"#if($foreach.hasNext),#end#end]`,
                },
                Education: {
                  SS: `[#foreach($edu in $input.path('$.Education'))"$edu"#if($foreach.hasNext),#end#end]`,
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
                HiringManagerEmail: {
                  S: "$util.parseJson($context.authorizer.claims).email",
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
            },
            {
              selectionPattern: "4\\d{2}",
              statusCode: "400",
            },
            {
              selectionPattern: "5\\d{2}",
              statusCode: "500",
            },
          ],
        },
      }),
      { authorizer }
    );

    const listJobsRole = new Role(this, "ListJobsRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: "Role for hiring manager to list jobs",
      inlinePolicies: {
        listJobsPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["dynamodb:Query"],
              resources: [`${dynamoDBTable.tableArn}/index/*`],
              effect: Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    jobResource.addMethod(
      "GET",
      new AwsIntegration({
        service: "dynamodb",
        integrationHttpMethod: "POST",
        action: "Query",
        options: {
          credentialsRole: listJobsRole,
          requestTemplates: {
            "application/json": vtlSerializer({
              TableName: dynamoDBTable.tableName,
              IndexName: "$input.params('index')",
              ExpressionAttributeValues: {
                ":pk": {
                  S: "$input.params('value')",
                },
                ":sk": {
                  S: "Job#",
                },
              },
              ExpressionAttributeNames: {
                "#pk": "$input.params('key')",
                "#sk": "pk",
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
              selectionPattern: "4\\d{2}",
              statusCode: "400",
            },
            {
              selectionPattern: "5\\d{2}",
              statusCode: "500",
            },
          ],
        },
      }),
      {}
    );
  }
}
