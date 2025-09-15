import { aws_ssm as ssm } from "aws-cdk-lib";
import { Construct } from "constructs";
import { CustomNodejsFunction } from "../custom";

type DatastoreConstructProps = {
  projectName: string;
};

export class DatastoreConstruct extends Construct {
  public readonly signingSecret: ssm.StringParameter;
  public readonly oauthToken: ssm.StringParameter;
  constructor(scope: Construct, id: string, props: DatastoreConstructProps) {
    super(scope, id);

    const signingSecret = new ssm.StringParameter(
      this,
      `${props.projectName}-slack-app-signing-secret`,
      {
        parameterName: "/slack-app/signing-secret",
        stringValue: "dummy",
      }
    );
    this.signingSecret = signingSecret;

    const oauthToken = new ssm.StringParameter(
      this,
      `${props.projectName}-slack-app-oauth-token`,
      {
        parameterName: "/slack-app/oauth-token",
        stringValue: "dummy",
      }
    );
    this.oauthToken = oauthToken;
  }
}
