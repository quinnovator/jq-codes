# JQ Codes Web

This is my personal site, used as a blog and portfolio.

It is based off of the Astro-Erudite template from @jktrn.

## Development

- `pnpm dev` or `sst dev` if AWS credentials are setup.

## Deployment

### Local Deployment
Before GitHub Actions can deploy automatically, you must first create the AWS IAM role and OIDC provider.
This is done automatically by SST, but you must run at least one local deploy from your machine:

```bash
sst deploy --stage main

Once you have deployed locally, the necessary IAM role for GitHub Actions is created. GitHub Actions can then assume it to deploy changes.

GitHub Actions Deployment

After you push to the main branch, the deploy-app workflow will:
    1.	Install dependencies
    2.	Configure AWS credentials by assuming the new IAM role
    3.	Run sst deploy --stage main to deploy.

You can also open a Pull Request to run pr-checks for test builds.

Additional Commands
    •	pnpm run build - Build for production
    •	pnpm run preview - Preview production build
    •	pnpm run prettier - Format all files with Prettier
