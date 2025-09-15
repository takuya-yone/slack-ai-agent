import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as node_lambda,
  aws_sqs as sqs,
  aws_apigateway as apigw,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomNodejsFunction } from "../custom";

type LambdaConstructProps = {
  projectName: string;
};

export class LambdaConstruct extends Construct {
  public readonly slackEventsHandlerLambda: lambda.IFunction;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const lambdaRole = new iam.Role(this, `${props.projectName}-lambda-role`, {
      roleName: `${props.projectName}-lambda-role`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess"),
      ],
      inlinePolicies: {},
    });

    const slackEventsHandlerLambda = new CustomNodejsFunction(
      this,
      `${props.projectName}-slack-events-handler-lambda`,
      {
        functionName: `${props.projectName}-slack-events-handler-lambda`,
        entry: "src/lambda/slack-events-handler-lambda.ts",
        role: lambdaRole,
      }
    );
    this.slackEventsHandlerLambda = slackEventsHandlerLambda;
  }
}
