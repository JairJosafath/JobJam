import { RemovalPolicy } from "aws-cdk-lib";
import {
	StringAttribute,
	UserPool,
	UserPoolClient,
	VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStruct extends Construct {
	readonly userPool: UserPool;
	readonly clientId: UserPoolClient;

	constructor(scope: Construct, id: string) {
		super(scope, id);

		this.userPool = new UserPool(this, "JobJamUserPool", {
			selfSignUpEnabled: true,
			userVerification: {
				emailSubject: "Welcome to JobJam! Verify Your Email",
				emailBody: `
                <h3>Hey {username}!</h3>
                <p>Thanks for your interest in working with us! Your verification code is {####}</p>
                <h1}>{####}</h1>
                <p>Best regards,<br> The JobJam Team</p>
              `,
				emailStyle: VerificationEmailStyle.CODE,
				smsMessage:
					"Thanks for your interest in working with us! Your verification code is {####}",
			},
			signInAliases: {
				username: true,
				email: true,
			},
			autoVerify: {
				email: true,
				phone: true,
			},
			signInCaseSensitive: false,
			removalPolicy: RemovalPolicy.DESTROY,
			customAttributes: {
				role: new StringAttribute(),
			},
		});
		// The client is needed to authenticate the user in the frontend, in our case that will all happen in the api gateway VTL templates
		this.clientId = this.userPool.addClient("FrontendClient", {
			authFlows: {
				userPassword: true,
				userSrp: true,
			},
		});
	}
}
