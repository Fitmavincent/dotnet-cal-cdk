import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudFront from "@aws-cdk/aws-cloudfront";
import { config } from 'dotenv';

config();

export class SpaCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    /**
     * Create S3 bucket for SPA 
     */    
    const s3WebsiteBucketName = this.node.tryGetContext("spa_bucket_name");    

    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: s3WebsiteBucketName,
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    this.enableCorsOnBucket(websiteBucket);

    // Create a new CloudFront Distribution
    const cfDistribution = new cloudFront.CloudFrontWebDistribution(
      this,
      `dotnetcal-cf-distribution`,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: websiteBucket
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods: cloudFront.CloudFrontAllowedMethods.ALL,
                cachedMethods:
                  cloudFront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: "none"
                  },
                  headers: [
                    "Access-Control-Request-Headers",
                    "Access-Control-Request-Method",
                    "Origin"
                  ]
                }
              }
            ]
          }
        ],
        comment: `dotnet-cal-client - CloudFront Distribution`,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      }
    );

    new s3deploy.BucketDeployment(this, "DeployWebSite", {
      sources: [s3deploy.Source.asset("/src/dotnet-cal/dotnet-cal-client/dist")],
      destinationBucket: websiteBucket,            
      contentLanguage: "en",
      distribution: cfDistribution,
      // storageClass: StorageClass.INTELLIGENT_TIERING,
      // serverSideEncryption: ServerSideEncryption.AES_256,
      // cacheControl: [CacheControl.setPublic(), CacheControl.maxAge(cdk.Duration.hours(1))],
    });
  }

  /**
   * Enables CORS access on the given bucket
   *
   * @memberof CxpInfrastructureStack
   */
  enableCorsOnBucket = (bucket: s3.IBucket) => {
    const cfnBucket = bucket.node.findChild("Resource") as s3.CfnBucket;
    cfnBucket.addPropertyOverride("CorsConfiguration", {
      CorsRules: [
        {
          AllowedOrigins: ["*"],
          AllowedMethods: ["HEAD", "GET", "PUT", "POST", "DELETE"],
          ExposedHeaders: [
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
          ],
          AllowedHeaders: ["*"]
        }
      ]
    });
  };
}