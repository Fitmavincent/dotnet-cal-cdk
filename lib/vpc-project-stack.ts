import * as cdk from '@aws-cdk/core';
import { config } from 'dotenv';
import { BastionHostLinux, CfnVPCPeeringConnection, InstanceClass, InstanceSize, InstanceType, Peer, Port, SecurityGroup, SubnetType, Vpc } from '@aws-cdk/aws-ec2';
import { AuroraCapacityUnit, AuroraPostgresEngineVersion, Credentials, DatabaseCluster, DatabaseClusterEngine, ParameterGroup, ServerlessCluster } from '@aws-cdk/aws-rds';
import { Duration } from '@aws-cdk/core';

config();

export class VpcProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const projectVpc = new Vpc(this, 'ProjectVpc', {
      
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
    
    // Bastion Box & SSH tunnel
    const bastion = new BastionHostLinux(this, 'BastionHost', {
      vpc: projectVpc,
      subnetSelection: { subnetType: SubnetType.PUBLIC },
    });
    bastion.allowSshAccessFrom(Peer.ipv4('0.0.0.0/0'));
    bastion.instance.instance.addPropertyOverride('KeyName', 'Tandm-admin-dev')
    bastion.connections.allowFromAnyIpv4(Port.tcp(443), 'Allow HTTPS access');
    const bastionSg = bastion.connections.securityGroups[0];


    // Database
    const cluster = new ServerlessCluster(this, 'ProjectDatabase', {
      engine: DatabaseClusterEngine.AURORA_POSTGRESQL,
      parameterGroup: ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      credentials: Credentials.fromGeneratedSecret('cluster_admin'),
      vpc: projectVpc,
      vpcSubnets: {
        subnetType: SubnetType.ISOLATED,
      },
      defaultDatabaseName: 'project_db',
      scaling: {
        autoPause: Duration.minutes(60),
        minCapacity: AuroraCapacityUnit.ACU_2,
        maxCapacity: AuroraCapacityUnit.ACU_8
      },
      enableDataApi: true,
    })

    cluster.connections.allowFrom(bastionSg, Port.tcp(5432), 'Allow App SG calling postgres db');
  }
}