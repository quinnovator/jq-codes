/// <reference path="./.sst/platform/config.d.ts" />

const APPLICATION_KEY = 'jq-codes';
const PROD_STAGE = 'main';
const EXTERNAL_URL = 'jq.codes';

export default $config({
  app(input) {
    return {
      name: APPLICATION_KEY,
      removal: input?.stage === PROD_STAGE ? 'retain' : 'remove',
      home: 'aws',
    };
  },
  async run() {
    if ($app.stage === PROD_STAGE) {
      await import('./infra/github-iam');
    }
    new sst.aws.Astro('JQCodesWeb', {
      ...($app.stage === PROD_STAGE && {
        domain: {
          name: EXTERNAL_URL,
          redirects: [`www.${EXTERNAL_URL}`],
        },
      }),
      server: {
        install: ['@resvg/resvg-js', 'onnxruntime-node'],
      },
    });
  },
});
