import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as node_lambda,
  aws_sqs as sqs,
  aws_apigateway as apigw,
} from "aws-cdk-lib";
import { Construct } from "constructs";

type ApigwConstructProps = {
  projectName: string;
  slackEventsHandlerLambda: lambda.IFunction;
};

export class ApigwConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApigwConstructProps) {
    super(scope, id);

    const sampleQueue = new sqs.Queue(this, "sample-queue", {
      queueName: "sample-queue",
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    const restApi = new apigw.RestApi(this, `${props.projectName}-apigw`, {
      restApiName: `${props.projectName}-apigw`,
      deployOptions: {
        stageName: "v1",
      },
    });

    const apiRoutesEvents = restApi.root.addResource("events");

    apiRoutesEvents.addMethod(
      "POST",
      new apigw.LambdaIntegration(props.slackEventsHandlerLambda)
    );
  }
}
