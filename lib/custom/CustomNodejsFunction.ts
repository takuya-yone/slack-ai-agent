import {
  aws_lambda as lambda,
  aws_logs as logs,
  // biome-ignore lint/style/noRestrictedImports: for declaration
  aws_lambda_nodejs as node_lambda,
  RemovalPolicy,
} from "aws-cdk-lib";
import type { NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

/*
 * 不要なプロパティ
 */
type FixedProps =
  | "runtime"
  | "bundling"
  | "handler"
  | "tracing"
  | "retryAttempts"
  | "logGroup"
  | "architecture";

/*
 * 必須化するプロパティ
 */
type EssentialProps = Required<
  Pick<NodejsFunctionProps, "functionName" | "entry">
>;

/*
 * 最終的なプロパティ
 */
type CustomNodejsFunctionProps = Omit<NodejsFunctionProps, FixedProps> &
  EssentialProps;

/*
 * CustomNodejsFunctionのコンストラクタ
 */
export class CustomNodejsFunction extends node_lambda.NodejsFunction {
  constructor(scope: Construct, id: string, props: CustomNodejsFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambdaHandler",
      tracing: lambda.Tracing.ACTIVE,
      retryAttempts: 0,
      logGroup: new logs.LogGroup(scope, `${props.functionName}-logs`, {
        logGroupName: `/aws/lambda/${props.functionName}-logs`,
        retention: logs.RetentionDays.ONE_YEAR,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
      architecture: lambda.Architecture.ARM_64,
    });
  }
}
