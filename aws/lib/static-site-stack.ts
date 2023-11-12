import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_s3_deployment as deploy } from 'aws-cdk-lib';

export class StaticSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'StaticHostingBucket', {
      bucketName: 'rss-aws-t2',
      websiteIndexDocument: 'index.html',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true
    });

    const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI');

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject'],
      resources: [bucket.arnForObjects('*')],
      principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
    }));

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket,
            originAccessIdentity: cloudfrontOAI,
          },
          behaviors: [{
            isDefaultBehavior: true,
          }],
        },
      ],
    });

    new deploy.BucketDeployment(this, 'StaticHostingBucketDeployment', {
      sources: [deploy.Source.asset('../front-end/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    })
  }
}
