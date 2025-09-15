import * as cdk from "aws-cdk-lib";
import {
  aws_lambda as lambda,
  aws_logs as logs,
  aws_apigateway as apigw,
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";

type ApigwConstructProps = {
  projectName: string;
  slackEventsHandlerLambda: lambda.IFunction;
};

export class ApigwConstruct extends Construct {
  constructor(scope: Construct, id: string, props: ApigwConstructProps) {
    super(scope, id);

    // const apigwRole = new iam.Role(this, "apigw-sqs-enqueue-role", {
    //   assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    // });
    // props.slackEventQueue.grantSendMessages(apigwRole);

    // const sampleQueue = new sqs.Queue(this, "sample-queue", {
    //   queueName: "sample-queue",
    //   visibilityTimeout: cdk.Duration.seconds(30),
    // });
    const restApiLogAccessLogGroup = new logs.LogGroup(
      this,
      "RestApiLogAccessLogGroup",
      {
        logGroupName: `/aws/apigateway/tdd-rd-e2e-api-access-log`,
        retention: 365,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const restApi = new apigw.RestApi(this, `${props.projectName}-apigw`, {
      restApiName: `${props.projectName}-apigw`,
      deployOptions: {
        stageName: "api",
        tracingEnabled: true,
        metricsEnabled: true,
        dataTraceEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        accessLogDestination: new apigw.LogGroupLogDestination(
          restApiLogAccessLogGroup
        ),
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
    // apiRoutesEvents.addMethod(
    //   "POST",
    //   new apigw.AwsIntegration({
    //     service: "sqs",
    //     path: `${cdk.Stack.of(this).account}/${
    //       props.slackEventQueue.queueName
    //     }`,
    //     options: {
    //       credentialsRole: apigwRole,
    //       requestTemplates: {
    //         "application/json":
    //           'Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=X-Slack-Signature&MessageAttribute.1.Value.StringValue=$input.params("X-Slack-Signature")&MessageAttribute.1.Value.DataType=String&MessageAttribute.2.Name=X-Slack-Request-Timestamp&MessageAttribute.2.Value.StringValue=$input.params("X-Slack-Request-Timestamp")&MessageAttribute.2.Value.DataType=String',
    //       },
    //       requestParameters: {
    //         "integration.request.header.Content-Type":
    //           "'application/x-www-form-urlencoded'",
    //       },

    //       integrationResponses: [
    //         {
    //           statusCode: "200",
    //           responseTemplates: {
    //             "application/json": '{"status": "message sent"}',
    //           },
    //         },
    //       ],
    //     },
    //   }),
    //   {
    //     methodResponses: [{ statusCode: "200" }],
    //   }
    // );
  }
}
