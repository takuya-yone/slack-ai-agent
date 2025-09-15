import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_logs as logs,
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

    // const sampleQueue = new sqs.Queue(this, "sample-queue", {
    //   queueName: "sample-queue",
    //   visibilityTimeout: cdk.Duration.seconds(30),
    // });

    const restApi = new apigw.RestApi(this, `${props.projectName}-apigw`, {
      restApiName: `${props.projectName}-apigw`,
      deployOptions: {
        stageName: "api",
        tracingEnabled: true,
        // accessLogDestination: new apigw.LogGroupLogDestination(
        //   new logs.LogGroup(this, `${props.projectName}-apigw-access-logs`, {
        //     logGroupName: `/aws/apigateway/${props.projectName}-apigw-access-logs`,
        //     retention: logs.RetentionDays.ONE_YEAR,
        //     removalPolicy: cdk.RemovalPolicy.DESTROY,
        //   })
        // ),
        // accessLogFormat: apigw.AccessLogFormat.jsonWithStandardFields(),
      },
    });

    const apiRoutesEvents = restApi.root.addResource("events");

    apiRoutesEvents.addMethod(
      "POST",
      new apigw.LambdaIntegration(props.slackEventsHandlerLambda)
    );
  }
}
