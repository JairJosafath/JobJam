import { CfnOutput } from "aws-cdk-lib";
import {
	MockIntegration,
	PassthroughBehavior,
	RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export class RestApiStruct extends Construct {
	readonly restApi: RestApi;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.restApi = new RestApi(this, "JobJamRestApi", {
			restApiName: "JobJamRestApi",
			description: "JobJam Rest API",
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

		this.restApi.root.addMethod(
			"GET",
			new MockIntegration({
				integrationResponses: [
					{
						statusCode: "200",
					},
				],
				passthroughBehavior: PassthroughBehavior.NEVER,
				requestTemplates: {
					"application/json": JSON.stringify({
						statusCode: 200,
					}),
				},
			})
		);

		// output the rest api id

		// output the test get endpoint
		new CfnOutput(this, "APIMockEndpointURL", {
			value: this.restApi.urlForPath("/"),
		}).overrideLogicalId("APIMockEndpointURL");
	}
}
