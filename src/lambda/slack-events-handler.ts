export const lambdaHandler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Slack Events Handler!" }),
  };
};
