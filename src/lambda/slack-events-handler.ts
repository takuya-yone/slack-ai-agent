import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { getParameter } from "@aws-lambda-powertools/parameters/ssm";

import { SQSEvent } from "aws-lambda";

const logger = new Logger();
const tracer = new Tracer();

const _getSigingSecret = async () => {
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

const _getOauthToken = async () => {
  if (!process.env.OAUTH_TOKEN_PARAMETER_NAME) {
    throw new Error("OAUTH_TOKEN_PARAMETER_NAME env is not set");
  }
  const oauthToken = await getParameter(process.env.OAUTH_TOKEN_PARAMETER_NAME);
  if (!oauthToken) {
    throw new Error("OAUTH_TOKEN_PARAMETER_NAME value is not set");
  }
  return oauthToken;
};

export const lambdaHandler = async (event: SQSEvent) => {
  const signingSecret = await _getSigingSecret();
  const oauthToken = await _getOauthToken();

  console.log(event);

  logger.info("signingSecret: " + signingSecret);
  logger.info("oauthToken: " + oauthToken);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Slack Events Handler!" }),
  };
};
