#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DotnetCdkStack } from '../lib/dotnet-cdk-stack';
import { SpaCdkStack } from '../lib/spa-cdk-stack';
import { TestStack } from '../lib/test-stack';
import { InfrastructureCdkStack } from '../lib/infrastructure-stack';

const stackEnv = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
}

const app = new cdk.App();
new DotnetCdkStack(app, 'dotnet', { env: stackEnv });
new SpaCdkStack(app, 'spa', { env: stackEnv });
new TestStack(app, 'test', { env: stackEnv });
new InfrastructureCdkStack(app, 'infra', { env: stackEnv });

app.synth();
