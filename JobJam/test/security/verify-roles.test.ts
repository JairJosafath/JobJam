import { App, Resource } from "aws-cdk-lib";
import { JobJamStack } from "../../lib/job_jam-stack";
import { Capture, Match, Template } from "aws-cdk-lib/assertions";
import { Policy } from "aws-cdk-lib/aws-iam";

test("verify created roles have the correct permissions", () => {
	const app = new App();
	// WHEN
	const stack = new JobJamStack(app, "jobjamstack-dev");
	// THEN
	const template = Template.fromStack(stack);
	const policyNames = [
		{ name: "SignupPolicy", action: ["cognito-idp:SignUp"] },
		{ name: "LoginPolicy", action: ["cognito-idp:InitiateAuth"] },
		{ name: "ConfirmSignupPolicy", action: ["cognito-idp:ConfirmSignUp"] },
		{ name: "ResetPasswordPolicy", action: ["cognito-idp:ForgotPassword"] },
		{
			name: "ConfirmResetPolicy",
			action: ["cognito-idp:ConfirmForgotPassword"],
		},
		{
			name: "AuthChallengePolicy",
			action: ["cognito-idp:RespondToAuthChallenge"],
		},
		{
			name: "addInterviewerPolicy",
			action: ["cognito-idp:AdminCreateUser"],
		},
	];

	policyNames.forEach((policyName) => {
		const capture = new Capture();

		template.hasResourceProperties("AWS::IAM::Role", {
			AssumeRolePolicyDocument: Match.objectLike({
				Statement: Match.anyValue(),
				Version: "2012-10-17",
			}),
			Description: Match.anyValue(),
			Policies: Match.arrayWith([
				{
					PolicyDocument: Match.objectLike({
						Statement: Match.arrayWith([
							{
								Action: capture,
								Effect: "Allow",
								Resource: Match.anyValue(),
							},
						]),
					}),
					PolicyName: policyName.name,
				},
			]),
		});

		console.log(
			`Policy Name: ${policyName.name} has action: ${capture.asString()}`
		);
		expect(capture.asString()).toEqual(policyName.action[0]);
	});
});
