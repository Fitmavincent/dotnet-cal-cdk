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

export class DotnetCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here    

    /**
     * Create S3 bucket for file storage
     */
    const dotnetStorageBucketName = process.env.DOTNET_BUCKET_NAME || 'dotnetcal'
    const isDevelopment: boolean = process.env.STACK_ENVIRONMENT === "test" || false;
    
    new s3.Bucket(this, "DotnetBucket", {
      bucketName: dotnetStorageBucketName,
      versioned:true,
      removalPolicy: isDevelopment ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN
    });

    /**
     * Create Hosted zone, Domain & Cert
     */
    const domain = process.env.DOMAIN_NAME || "fitmavincent";
    const subDomain = process.env.SUB_DOMAIN || "dotnet";

    const zone = route53.HostedZone.fromLookup(this, domain + 'HostedZone', {
      domainName: domain
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

    /**
     * Create VPC and ECS Cluster      
     */ 
    const dotnetVpc = new ec2.Vpc(this, 'DotnetVpc', {
      maxAzs: 2
    });

    const dotnetCluster = new ecs.Cluster(this, "DotnetCluster", {
      vpc: dotnetVpc
    });

    /**
     * Create ALB & Fargate for hosting dotnet core server
     */
    const imageRegistry = process.env.DOTNET_IMAGE_REGISTRY || 'public/image_registry';
    const fargateContainerName = process.env.DOTNET_CONTAINER_NAME || 'fargate';

    const dotnetFargate = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "DotnetFargate", {
      cluster: dotnetCluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1      
      listenerPort: 80,      
      taskImageOptions: { 
        image: ecs.ContainerImage.fromRegistry(imageRegistry),
        containerName: fargateContainerName,
        environment: {
          ASPNETCORE_URLS: "http://+",
          ASPNETCORE_ENVIRONMENT: "Development",          
        }
      },
      memoryLimitMiB: 512, // Default is 512      
      publicLoadBalancer: true // Default is false
    });

    // Add listener
    dotnetFargate.loadBalancer.addListener("DotnetFargateHttpsListener", {
      certificateArns: [certArn],
      protocol: elb.ApplicationProtocol.HTTPS,
      port: 443,
      sslPolicy: SslPolicy.RECOMMENDED,
      open: true,
      defaultTargetGroups: [dotnetFargate.targetGroup]
    });

    // A record
    new route53.ARecord(this, `${apiDomain}AliasRecord`, {
      recordName: apiDomain,
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(dotnetFargate.loadBalancer)),
      zone
    });
  }
}
