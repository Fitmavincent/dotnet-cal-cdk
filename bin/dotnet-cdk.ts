#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DotnetCdkStack } from '../lib/dotnet-cdk-stack';
import { SpaCdkStack } from '../lib/spa-cdk-stack';
import { TestStack } from '../lib/test-stack';
import { InfrastructureCdkStack } from '../lib/infrastructure-stack';
import { config } from 'dotenv';
import { VpcProjectStack } from '../lib/vpc-project-stack';

config()

const stackEnv = {
  account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
}

const ops = { account: process.env.OPS_ACCOUNT, region: process.env.REGION }
const dev = { account: process.env.DEV_ACCOUNT, region: process.env.REGION }
const prod = { account: process.env.PROD_ACCOUNT, region: process.env.REGION }

const app = new cdk.App();
new DotnetCdkStack(app, 'dotnet', { env: stackEnv });
new SpaCdkStack(app, 'spa', { env: stackEnv });
new TestStack(app, 'test', { env: stackEnv });
new TestStack(app, 'test-ops', { env: ops });

new VpcProjectStack(app, 'vpc', { env: dev });

new InfrastructureCdkStack(app, 'infra', { env: stackEnv });

app.synth();
