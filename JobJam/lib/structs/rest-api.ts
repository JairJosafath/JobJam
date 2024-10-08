import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import {
  MethodLoggingLevel,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { LoggingLevel } from "aws-cdk-lib/aws-chatbot";
import { Construct } from "constructs";

export class RestApiStruct extends Construct {
  readonly restApi: RestApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.restApi = new RestApi(this, "JobJamRestApi", {
      restApiName: "JobJamRestApi",
      description: "JobJam Rest API",
      cloudWatchRole: true,
      cloudWatchRoleRemovalPolicy: RemovalPolicy.DESTROY,
      binaryMediaTypes: ["application/pdf"],
      deployOptions: {
        dataTraceEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
      },
      defaultMethodOptions: {
        methodResponses: [
          {
            statusCode: "200",
          },
          {
            statusCode: "400",
          },
          {
            statusCode: "500",
          },
        ],
      },
    });

    // add a mock integration for VTL mapping output testing
    this.restApi.root.addMethod(
      "POST",
      new MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
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
        passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
      })
    );

    // output the rest api id

    // output the test get endpoint
    new CfnOutput(this, "APIMockEndpointURL", {
      value: this.restApi.urlForPath("/"),
    }).overrideLogicalId("APIMockEndpointURL");
  }
}
