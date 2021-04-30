import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';

import { config } from 'dotenv';
import { SslPolicy } from '@aws-cdk/aws-elasticloadbalancingv2';

config();

export class InfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    /**
     * Create Hosted zone, Domain & Cert
     */
    const domain = process.env.DOMAIN_NAME || "fitmavincent";
    const subDomain = process.env.SUB_DOMAIN || "dotnet";
    
    const zone = new route53.PublicHostedZone(this, domain + 'HostedZone', {
      zoneName: '' + domain
    })

    const apiDomain = `${subDomain}.${domain}`;
    new cdk.CfnOutput(this, `${apiDomain}Server`, {
      value: `https://${apiDomain}`
    });

    const certArn = new acm.DnsValidatedCertificate(this, `${apiDomain}Server-Cert`, {
      domainName: apiDomain,
      hostedZone: zone,
    }).certificateArn;

    new cdk.CfnOutput(this, `${apiDomain}-Cert`, {
      value: certArn
    })

  }
}
