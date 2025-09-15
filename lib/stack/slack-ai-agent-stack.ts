import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApigwConstruct,
  DatastoreConstruct,
  LambdaConstruct,
} from "../constructs";

export class SlackAiAgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectName = "slack-ai-agent";

    const datastoreConstruct = new DatastoreConstruct(
      this,
      `${projectName}-datastore-construct`,
      {
        projectName: projectName,
      }
    );

    const lambdaConstruct = new LambdaConstruct(
      this,
      `${projectName}-lambda-construct`,
      {
        projectName: projectName,
        slackEventsHandlerLambdaProps: {
          signingSecret: datastoreConstruct.signingSecret,
          oauthToken: datastoreConstruct.oauthToken,
        },
      }
    );

    const _apigwConstruct = new ApigwConstruct(
      this,
      `${projectName}-apigw-construct`,
      {
        projectName: projectName,
        slackEventsHandlerLambda: lambdaConstruct.slackEventsHandlerLambda,
        slackEventsHandlerQueue: lambdaConstruct.slackEventsHandlerQueue,
      }
    );
  }
}
