import { RemovalPolicy } from "aws-cdk-lib";
import {
  AttributeType,
  StreamViewType,
  TableV2,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DatabaseStruct extends Construct {
  readonly dynamoDBTable: TableV2;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.dynamoDBTable = new TableV2(this, "JobJamTable", {
      partitionKey: { name: "pk", type: AttributeType.STRING },
      sortKey: { name: "sk", type: AttributeType.STRING },
      globalSecondaryIndexes: [
        {
          indexName: "JobsByDepartment",
          partitionKey: { name: "Department", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "JobsByTitle",
          partitionKey: { name: "Title", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "JobsByType",
          partitionKey: { name: "Type", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "JobsByLevel",
          partitionKey: { name: "Level", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "JobsByLocation",
          partitionKey: { name: "Location", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "JobsByStatus",
          partitionKey: { name: "Status", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
        {
          indexName: "ApplicationsByStatus",
          partitionKey: { name: "Status", type: AttributeType.STRING },
          sortKey: { name: "sk", type: AttributeType.STRING },
        },
        {
          indexName: "ApplicationsByApplicant",
          partitionKey: { name: "ApplicantEmail", type: AttributeType.STRING },
          sortKey: { name: "sk", type: AttributeType.STRING },
        },
        {
          indexName: "InterviewsByInterviewer",
          partitionKey: {
            name: "InterviewerEmail",
            type: AttributeType.STRING,
          },
          sortKey: { name: "sk", type: AttributeType.STRING },
        },
        {
          indexName: "UsersByRole",
          partitionKey: { name: "Role", type: AttributeType.STRING },
          sortKey: { name: "pk", type: AttributeType.STRING },
        },
      ],
      removalPolicy: RemovalPolicy.DESTROY,
      dynamoStream: StreamViewType.NEW_AND_OLD_IMAGES,
    });
  }
}
