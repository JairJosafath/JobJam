import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import {
  AuthorizationType,
  AwsIntegration,
  CognitoUserPoolsAuthorizer,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import {
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";

export class StorageStruct extends Construct {
  readonly bucket: Bucket;

  constructor(scope: Construct, id: string, api: RestApi, userPool: UserPool) {
    super(scope, id);
    const authorizer = new CognitoUserPoolsAuthorizer(this, "PoolAuthorizer", {
      cognitoUserPools: [userPool],
    });
    this.bucket = new Bucket(this, "JobJamStorageBucket", {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const credentialsRole = new Role(this, "S3IntegrationRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: "Role for S3 integration",
      inlinePolicies: {
        createJobPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ["s3:PutObject", "s3:GetObject"],
              resources: [this.bucket.bucketArn],
            }),
          ],
        }),
      },
    });

    const fileResource = api.root
      .addResource("files")
      .addResource("{applicationId}")
      .addResource("{key+}");

    fileResource.addMethod(
      "POST",
      new AwsIntegration({
        service: "s3",
        integrationHttpMethod: "PUT",
        path: `${this.bucket.bucketName}/{applicationId}/{key}`,
        options: {
          credentialsRole,
          passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
          requestParameters: {
            "integration.request.path.key": "method.request.path.key",
            "integration.request.path.applicationId":
              "method.request.path.applicationId",
            "integration.request.header.Content-Type":
              "method.request.header.Content-Type",
          },
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
        requestParameters: {
          "method.request.path.key": true,
          "method.request.header.Content-Type": true,
        },
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
      }
    );

    fileResource.addMethod(
      "GET",
      new AwsIntegration({
        service: "s3",
        integrationHttpMethod: "GET",
        path: `${this.bucket.bucketName}/{key}`,
        options: {
          credentialsRole,
          requestParameters: {
            "integration.request.path.key": "method.request.path.key",
            "integration.request.path.applicationId":
              "method.request.path.applicationId",
            "integration.request.header.Content-Type":
              "method.request.header.Content-Type",
          },
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
        requestParameters: {
          "method.request.path.key": true,
          "method.request.header.Content-Type": true,
        },
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
      }
    );
  }
}
