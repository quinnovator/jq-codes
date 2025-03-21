import { GITHUB_ORG, GITHUB_REPO } from './constants';

let githubProvider: aws.iam.OpenIdConnectProvider;

const existingProvider = await aws.iam.getOpenIdConnectProvider({
  url: 'https://token.actions.githubusercontent.com',
});

if (!existingProvider) {
  githubProvider = new aws.iam.OpenIdConnectProvider('GithubProvider', {
    url: 'https://token.actions.githubusercontent.com',
    clientIdLists: ['sts.amazonaws.com'],
  });
} else {
  githubProvider = aws.iam.OpenIdConnectProvider.get(
    'GithubProvider',
    existingProvider.id,
  );
}

const githubRole = new aws.iam.Role('GithubRole', {
  name: [$app.name, $app.stage, 'github'].join('-'),
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Federated: githubProvider.arn,
        },
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: {
          StringLike: githubProvider.url.apply((url) => ({
            [`${url}:sub`]: `repo:${GITHUB_ORG}/${GITHUB_REPO}:*`,
          })),
        },
      },
    ],
  },
});

export const githubIAM = new aws.iam.RolePolicyAttachment('GithubRolePolicy', {
  policyArn: 'arn:aws:iam::aws:policy/AdministratorAccess',
  role: githubRole.name,
});
