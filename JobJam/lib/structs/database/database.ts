import { RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DatabaseStruct extends Construct {
	readonly dynamoDBTable: TableV2;
	constructor(scope: Construct, id: string) {
		super(scope, id);
		this.dynamoDBTable = new TableV2(this, "JobJamTable", {
			partitionKey: { name: "pk", type: AttributeType.STRING },
			sortKey: { name: "sk", type: AttributeType.STRING },
			removalPolicy: RemovalPolicy.DESTROY,
		});
	}
}
