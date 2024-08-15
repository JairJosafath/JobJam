import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApiStruct } from "./structs/rest-api";
import { AuthStruct } from "./structs/auth/auth";
import { AuthResource } from "./structs/auth/resources/auth";
import { DatabaseStruct } from "./structs/database/database";
import { JobResource } from "./structs/database/resources/job";
import { ApplicationResource } from "./structs/database/resources/application";
import { NotificationStruct } from "./structs/notification/notification";
import { RequestAuthorizer } from "aws-cdk-lib/aws-apigateway";
import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import path = require("path");
import { InterviewResource } from "./structs/database/resources/interview";
import { InterviewerResource } from "./structs/database/resources/interviewer";
import { StorageStruct } from "./structs/storage";
import { OfferResource } from "./structs/database/resources/offer";

export class JobJamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApiConstruct = new RestApiStruct(this, "JobJamRestApi");
    const authConstruct = new AuthStruct(this, "JobJamAuth");
    const databaseConstruct = new DatabaseStruct(this, "JobJamDatabase");
    const notificationConstruct = new NotificationStruct(
      this,
      "JobJamNotification",
      databaseConstruct.dynamoDBTable
    );
    const storage = new StorageStruct(
      this,
      "JobJamStorage",
      restApiConstruct.restApi,
      authConstruct.userPool
    );
    const authorizer = new RequestAuthorizer(this, "JobAuthorizer", {
      handler: new Function(this, "JobAuthorizerFunction", {
        runtime: Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: Code.fromAsset(path.join(__dirname, "structs/auth/authorizer")),
        environment: {
          COGNITO_USER_POOL_ID: authConstruct.userPool.userPoolId,
          COGNITO_CLIENT_ID: authConstruct.clientId.userPoolClientId,
        },
        logRetention: 7,
      }),
      identitySources: ["method.request.header.Authorization"],
    });

    databaseConstruct.dynamoDBTable.grantReadWriteData(
      authConstruct.lambdaTrigger
    );

    authConstruct.lambdaTrigger.addEnvironment(
      "DYNAMODB_TABLE_NAME",
      databaseConstruct.dynamoDBTable.tableName
    );

    const val = props?.tags?.env;

    authConstruct.lambdaTrigger.addEnvironment("ENV", val || "");

    const authResources = new AuthResource(
      this,
      "JobJamAuthResources",
      restApiConstruct.restApi,
      authConstruct.userPool,
      authConstruct.clientId.userPoolClientId,
      authorizer
    );
    const jobResources = new JobResource(
      this,
      "JobJamJobResources",
      restApiConstruct.restApi,
      databaseConstruct.dynamoDBTable,
      authorizer
    );

    const applicationResources = new ApplicationResource(
      this,
      "JobJamApplicationResources",
      restApiConstruct.restApi,
      authConstruct.userPool,
      authConstruct.clientId.userPoolClientId,
      databaseConstruct.dynamoDBTable,
      authorizer
    );

    const InterviewResources = new InterviewResource(
      this,
      "JobJamInterviewResources",
      restApiConstruct.restApi,
      databaseConstruct.dynamoDBTable,
      authorizer
    );

    const InterviewerResources = new InterviewerResource(
      this,
      "JobJamInterviewerResources",
      restApiConstruct.restApi,
      authConstruct.userPool,
      authConstruct.clientId.userPoolClientId,
      databaseConstruct.dynamoDBTable,
      authorizer
    );

    const OfferResources = new OfferResource(
      this,
      "JobJamOfferResources",
      restApiConstruct.restApi,
      authConstruct.userPool,
      authConstruct.clientId.userPoolClientId,
      databaseConstruct.dynamoDBTable,
      authorizer
    );
  }
}
