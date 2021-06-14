import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';


import { config } from 'dotenv';
import { CfnRoute, CfnVPCPeeringConnection, Peer, Port, SecurityGroup, Subnet, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { CfnOutput, Tag, Tags } from '@aws-cdk/core';
import { Repository } from '@aws-cdk/aws-ecr';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Cluster, ContainerImage } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';
import { HostedZone } from '@aws-cdk/aws-route53';
import { ServerlessCluster } from '@aws-cdk/aws-rds';

config();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props); 

    // const zone = HostedZone.fromLookup(this, 'ZoneLookup', {
    //   domainName: 'fitmavincent.io'
    // });
    
    // /**
    //  * Create VPC and ECS Cluster      
    //  */ 
    // const dotnetVpc = new Vpc(this, 'DotnetCalVpc', {
    //   maxAzs: 2
    // });

    // const dotnetCluster = new Cluster(this, "DotnetCalCluster", {
    //   vpc: dotnetVpc
    // });

    // const dotnetFargate = new ApplicationLoadBalancedFargateService(this, "DotnetCalFargate", {
    //   cluster: dotnetCluster, // Required
    //   cpu: 256, // Default is 256
    //   desiredCount: 1, // Default is 1            
    //   taskImageOptions: { 
    //     image: ContainerImage.fromRegistry('vincentliang/dotnet-cal'),
    //     containerName: 'Dotnet-Cal',
    //     environment: {
    //       ASPNETCORE_URLS: "http://+",
    //       ASPNETCORE_ENVIRONMENT: "Development",
    //       ConnectionStrings__Default: "Server=projectx-infra-dev-projectxvpcrdsprojectxserverle-17t2fu7phpgy.cluster-c7796vmanjxr.ap-southeast-2.rds.amazonaws.com;Port=5432;Database=projectx_db;User Id=projectx_admin;Password=secret;"
    //     }
    //   },
    //   memoryLimitMiB: 512, // Default is 512      
    //   publicLoadBalancer: true // Default is false
    // });

    // const address = 'Server=projectx-infra-dev-projectxvpcrdsprojectxserverle-17t2fu7phpgy.cluster-c7796vmanjxr.ap-southeast-2.rds.amazonaws.com;Port=5432;Database=projectx_db;User Id=db_dmin;Password=z=j1bJiDvfwF8i_0^u.1l2S3YJbCiu;';
    // const cluster = ServerlessCluster.fromServerlessClusterAttributes(this, 'DBCluster', {
    //   clusterIdentifier: 'projectx-infra-dev-projectxvpcrdsprojectxserverle-17t2fu7phpgy',
    //   clusterEndpointAddress: address.split(';')[0],
    // });

    // new CfnOutput(this, 'Output', {
    //   value: cluster.clusterArn
    // });

    // cluster.connections.allowFromAnyIpv4(Port.tcp(5432), 'Test add');

    const rdsSg = SecurityGroup.fromSecurityGroupId(this, 'RDSSG', 'sg-055372b34d792c922');

    rdsSg.connections.allowInternally(Port.tcp(5432), 'Add internal postgres access within VPC by test');

    // const repository = new Repository(this, 'TestRepository', {
    //   imageScanOnPush: true,
    // });

    // const vpnClientVpc = new Vpc(this, 'VpnClientVpc', {
      
    //   cidr: '10.1.0.0/16',
    //   enableDnsHostnames: true,
    //   enableDnsSupport: true,
    //   maxAzs: 2,
    //   natGateways: 1,
    //   subnetConfiguration: [
    //     {
    //       cidrMask: 24,
    //       name: 'Public',
    //       subnetType: SubnetType.PUBLIC
    //     },
    //   ]
    // });    

    // const test = new Vpc(this, 'TestProjectVpc', {      
    //   cidr: '10.2.0.0/16',
    //   enableDnsHostnames: true,
    //   enableDnsSupport: true,
    //   maxAzs: 2,
    //   natGateways: 1,
    //   subnetConfiguration: [
    //     {
    //       cidrMask: 24,
    //       name: 'Public',
    //       subnetType: SubnetType.PUBLIC
    //     },
    //     {
    //       cidrMask: 24,
    //       name: 'Private - Application',
    //       subnetType: SubnetType.PRIVATE
    //     },
    //     {
    //       cidrMask: 28,
    //       name: 'Private - Database',
    //       subnetType: SubnetType.ISOLATED
    //     },
    //   ]
    // });

    // const ingressSg = new SecurityGroup(this, 'ingress-sg', {
    //   vpc: projectVpc,
    //   allowAllOutbound: false,
    //   securityGroupName: 'IngressSecurityGroup'
    // });

    // ingressSg.addIngressRule(Peer.ipv4('10.0.0.0/16'), Port.tcp(5432));
    // ingressSg.addIngressRule(Peer.anyIpv4(), Port.icmpPing(), 'Allow ping from anywhere');

    // const egressSg = new SecurityGroup(this, 'egress-sg', {
    //   vpc: projectVpc,
    //   allowAllOutbound: false,
    //   securityGroupName: 'EgressSecurityGroup'
    // });

    // egressSg.addEgressRule(Peer.anyIpv4(), Port.tcp(80));
    // egressSg.addEgressRule(Peer.anyIpv4(), Port.icmpPing(), 'Allow Ping going back')
    
    // // VPC peering
    // const peering = new CfnVPCPeeringConnection(this, 'VPC Peering', {
    //   peerVpcId: projectVpc.vpcId,
    //   vpcId: vpnClientVpc.vpcId
    // });

    // new CfnRoute(this, 'vpnClientVpcRoute', {
    //   routeTableId: vpnClientVpc.publicSubnets[0].routeTable.routeTableId,
    //   destinationCidrBlock: projectVpc.vpcCidrBlock,
    //   vpcPeeringConnectionId: peering.ref
    // });

    // new CfnRoute(this, 'projectVpcRoute', {
    //   routeTableId: projectVpc.publicSubnets[0].routeTable.routeTableId,
    //   destinationCidrBlock: vpnClientVpc.vpcCidrBlock,
    //   vpcPeeringConnectionId: peering.ref
    // });

    // const zone = route53.HostedZone.fromLookup(this, 'tandm.aiHostedZone', {
    //   domainName: 'tandm.ai',
    // });

    // this.createCert(this, zone);

    // new CfnOutput(this, `output1`, {
    //   value: zone.zoneName
    // });

    // new CfnOutput(this, `output2`, {
    //   value: zone.hostedZoneId
    // });

    // new CfnOutput(this, 'output3', {
    //   value: zone.hostedZoneNameServers?.toString() || 'No NameServer'
    // });

    // const callParam:any = {
    //   launchType: 'FARGATE',
    //   count: 1,
    //   cluster: cluster.clusterArn,
    //   taskDefinition: migrationTask.taskDefinitionArn,
    //   networkConfiguration: {
    //     awsvpcConfiguration: {
    //       assignPublicIp: 'DISABLED',
    //       subnets: projectVpc.selectSubnets({ subnetType: SubnetType.PRIVATE }).subnetIds,
    //     }
    //   }
    // }

    // const awsSdkCall: AwsSdkCall = {
    //   service: 'ECS',
    //   action: 'runTask',
    //   physicalResourceId: {
    //     id: migrationTask.taskDefinitionArn,
    //   },
    //   parameters: callParam,
    // }

    // new AwsCustomResource(this, `${config.projectName}CustomResource`, {
    //   resourceType: `Custom::DatabaseMigration`,
    //   policy: AwsCustomResourcePolicy.fromSdkCalls({
    //     resources: AwsCustomResourcePolicy.ANY_RESOURCE
    //   }),
    //   role: taskRunRole,
    //   onCreate: awsSdkCall,
    //   onUpdate: awsSdkCall,
    // });  
  }

  public createCert(scope: cdk.Construct, zone: route53.IHostedZone) {
    try {
      new acm.DnsValidatedCertificate(this, `tandm.aiCertificate`, {
        hostedZone: zone,
        domainName: 'tandm.ai',
        region: 'ap-southeast-2'
      });
    } catch(error) {
      new CfnOutput(scope, 'CertValidationErrorOutput', {
        value: error
      });
    }
  }
}