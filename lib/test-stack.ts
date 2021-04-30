import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';


import { config } from 'dotenv';
import { SubnetType } from '@aws-cdk/aws-ec2';
import { Tag, Tags } from '@aws-cdk/core';

config();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ec2.Vpc(this, 'DotnetVpc', {
      cidr: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'Private - Application',
          subnetType: SubnetType.PRIVATE
        },
        {
          cidrMask: 28,
          name: 'Private - Database',
          subnetType: SubnetType.ISOLATED
        },
      ]
    });
    
  }
}