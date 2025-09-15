#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SlackAiAgentStack } from "../lib/stack";

const app = new cdk.App();
new SlackAiAgentStack(app, "SlackAiAgentStack", {});
