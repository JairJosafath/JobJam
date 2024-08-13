import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
	Code,
	FilterCriteria,
	FilterRule,
	Function,
	Runtime,
	StartingPosition,
} from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { ConfigurationSet, EmailIdentity, Identity } from "aws-cdk-lib/aws-ses";
import { Subscription, SubscriptionFilter, Topic } from "aws-cdk-lib/aws-sns";
import { LambdaSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import path = require("path");
import { config } from "dotenv";
import { RemovalPolicy } from "aws-cdk-lib";
config();
const EMAIL = process.env.EMAIL || "";

export class NotificationStruct extends Construct {
	constructor(scope: Construct, id: string, dynamoDBTable: TableV2) {
		super(scope, id);

		// if you don't want your email in the resulting cloudformation,
		// manualy set your secrets or ssm paramters and use them here
		// for this project, i am using .env

		new EmailIdentity(this, "JobJamEmailIdentity", {
			identity: Identity.email(EMAIL.replace("@", "+admin@"))
		}).applyRemovalPolicy(RemovalPolicy.DESTROY);

		new EmailIdentity(this, "JobJamEmailIdentity2", {
			identity: Identity.email(EMAIL.replace("@", "+interviewer@")),
		}).applyRemovalPolicy(RemovalPolicy.DESTROY);

		new EmailIdentity(this, "JobJamEmailIdentity3", {
			identity: Identity.email(EMAIL.replace("@", "+hiringmanager@")),
		}).applyRemovalPolicy(RemovalPolicy.DESTROY);

		const notifier = new Function(this, "JobJamNotificationFunction", {
			runtime: Runtime.NODEJS_20_X,
			handler: "index.handler",
			code: Code.fromAsset(path.join(__dirname, "notifier")),
			environment: {
				TABLENAME: dynamoDBTable.tableName,
				FROM_EMAIL: EMAIL,
			},
		});

		dynamoDBTable.grantReadData(notifier);
		notifier.addToRolePolicy(
			new PolicyStatement({
				actions: ["ses:SendEmail"],
				resources: ["*"],
			})
		);

		notifier.addEventSource(
			new DynamoEventSource(dynamoDBTable, {
				startingPosition: StartingPosition.LATEST,
				retryAttempts: 1,
				filters: [
					FilterCriteria.filter({
						dynamodb: {
							NewImage: {
								pk: {
									S: FilterRule.beginsWith("Job#"),
								},
								sk: {
									S: FilterRule.beginsWith("Application#"),
								},
							},
						},
						eventName: FilterRule.isEqual("INSERT"),
					}),
				],
			})
		);
	}
}
