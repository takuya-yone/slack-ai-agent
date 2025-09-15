import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { getParameter } from "@aws-lambda-powertools/parameters/ssm";
import {
  type SlackMessageEvent,
  slackMessageEventSchema,
  sqsMessageAttirubutesSchema,
  zodValidation,
} from "./utils/schema";
import {
  isValidSlackRequest,
  type SlackRequestVerificationOptions,
} from "./utils/auth";
import { WebClient } from "@slack/web-api";
import { addReaction, replyThread } from "./utils/chat";

import { SQSEvent } from "aws-lambda";

const logger = new Logger();
const tracer = new Tracer();

const _getSlackSigingSecret = async () => {
  if (!process.env.SIGNING_SECRET_PARAMETER_NAME) {
    throw new Error("SIGNING_SECRET_PARAMETER_NAME env is not set");
  }
  const signingSecret = await getParameter(
    process.env.SIGNING_SECRET_PARAMETER_NAME
  );
  if (!signingSecret) {
    throw new Error("SIGNING_SECRET_PARAMETER_NAME value is not set");
  }
  return signingSecret;
};

const _getSlackOauthToken = async () => {
  if (!process.env.OAUTH_TOKEN_PARAMETER_NAME) {
    throw new Error("OAUTH_TOKEN_PARAMETER_NAME env is not set");
  }
  const oauthToken = await getParameter(
    process.env.OAUTH_TOKEN_PARAMETER_NAME,
    {
      forceFetch: true,
    }
  );
  if (!oauthToken) {
    throw new Error("OAUTH_TOKEN_PARAMETER_NAME value is not set");
  }
  return oauthToken;
};

export const lambdaHandler = async (event: SQSEvent) => {
  const slackSigningSecret = await _getSlackSigingSecret();
  const slackOauthToken = await _getSlackOauthToken();

  logger.info("signingSecret: " + slackSigningSecret);
  logger.info("oauthToken: " + slackOauthToken);

  const sqsRecord = event.Records[0];

  const payload: SlackRequestVerificationOptions = {
    signingSecret: slackSigningSecret,
    body: sqsRecord.body,
    headers: {
      "X-Slack-Signature":
        sqsRecord.messageAttributes["X-Slack-Signature"].stringValue ?? "",
      "X-Slack-Request-Timestamp": Number(
        sqsRecord.messageAttributes["X-Slack-Request-Timestamp"].stringValue ??
          ""
      ),
    },
    logger,
  };

  if (!isValidSlackRequest(payload)) {
    throw new Error("Invalid Slack Request");
  }

  // const _messageAttributes = zodValidation(
  //   sqsMessageAttirubutesSchema,
  //   sqsRecord.messageAttributes,
  //   logger
  // );

  // Zodで検証（body event）
  const rawMessageBody = JSON.parse(sqsRecord.body);
  const messageBodyEvent = zodValidation(
    slackMessageEventSchema,
    rawMessageBody.event,
    logger
  );
  // slack webclient initialize
  const slackWebClient = new WebClient(slackOauthToken);

  await replyThread(
    slackWebClient,
    messageBodyEvent,
    "Hello! This is a reply from your friendly bot."
  );

  return;

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ message: "Hello from Slack Events Handler!" }),
  // };
};
