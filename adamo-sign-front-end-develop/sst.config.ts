// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "adamo-sign",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      region: "us-east-2",
    };
  },
  async run() {
    const bucket = new sst.aws.Bucket("adamo-sign-bucket", {
      access: "public",
    });
    new sst.aws.Nextjs("adamo-sign-app", {
      link: [bucket],
      customDomain: {
        domainName: "dev-sign.adamoservices.co",
        hostedZone: "adamoservices.co",
      },
    });
  },
});
