import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { APIGatewayProxyEvent } from "aws-lambda";

const logger = new Logger();
const tracer = new Tracer();

export const lambdaHandler = async (event: APIGatewayProxyEvent) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Slack Events Handler!" }),
  };
};
