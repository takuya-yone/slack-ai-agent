import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_ssm as ssm,
  aws_sqs as sqs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomNodejsFunction } from "../custom";

type LambdaConstructProps = {
  projectName: string;
  slackEventsHandlerLambdaProps: {
    signingSecret: ssm.StringParameter;
    oauthToken: ssm.StringParameter;
  };
};

export class LambdaConstruct extends Construct {
  public readonly slackEventsHandlerLambda: lambda.Function;
  public readonly slackEventsHandlerQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    const slackEventsHandlerDlQueue = new sqs.Queue(
      this,
      `${props.projectName}-slack-events-handler-dl-queue`,
      {
        queueName: `${props.projectName}-slack-events-handler-dl-queue`,
        retentionPeriod: cdk.Duration.days(14),
      }
    );

    const slackEventsHandlerQueue = new sqs.Queue(
      this,
      `${props.projectName}-slack-events-handler-queue`,
      {
        queueName: `${props.projectName}-slack-events-handler-queue`,
        visibilityTimeout: cdk.Duration.seconds(300),
        deadLetterQueue: {
          maxReceiveCount: 1,
          queue: slackEventsHandlerDlQueue,
        },
      }
    );
    this.slackEventsHandlerQueue = slackEventsHandlerQueue;

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
    props.slackEventsHandlerLambdaProps.signingSecret.grantRead(lambdaRole);
    props.slackEventsHandlerLambdaProps.oauthToken.grantRead(lambdaRole);
    slackEventsHandlerQueue.grantConsumeMessages(lambdaRole);

    const slackEventsHandlerLambda = new CustomNodejsFunction(
      this,
      `${props.projectName}-slack-events-handler-lambda`,
      {
        functionName: `${props.projectName}-slack-events-handler-lambda`,
        entry: "src/lambda/slack-events-handler.ts",
        timeout: cdk.Duration.seconds(300),
        role: lambdaRole,
        environment: {
          SIGNING_SECRET_PARAMETER_NAME:
            props.slackEventsHandlerLambdaProps.signingSecret.parameterName,
          OAUTH_TOKEN_PARAMETER_NAME:
            props.slackEventsHandlerLambdaProps.oauthToken.parameterName,
          POWERTOOLS_PARAMETERS_MAX_AGE: "900",
        },
      }
    );
    slackEventsHandlerLambda.addEventSourceMapping(
      `${props.projectName}-slack-events-handler-lambda-event-source-mapping`,
      {
        eventSourceArn: slackEventsHandlerQueue.queueArn,
        batchSize: 1,
        enabled: true,
      }
    );
    this.slackEventsHandlerLambda = slackEventsHandlerLambda;
  }
}
