import Content from './content.mdx';

export const metadata = {
  title: 'Pricing for FFremote',
};

export default async function Page() {
  const licenseArm64Text = await getText(
    'https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/docs/build-data/license-arm64.txt',
  );
  const licenseX64Text = await getText(
    'https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/docs/build-data/license-x64.txt',
  );
  const versionX64Text = await getText(
    'https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/docs/build-data/version-x64.txt',
  );
  const versionArm64Text = await getText(
    'https://raw.githubusercontent.com/elwood-software/run/refs/heads/main/docs/build-data/version-arm64.txt',
  );

  return (
    <Content
      components={{
        LicenseArm64: () => {
          return <pre>{licenseArm64Text}</pre>;
        },
        LicenseX64: () => {
          return <pre>{licenseX64Text}</pre>;
        },
        VersionX64: () => {
          return <pre>{versionX64Text.replaceAll('--', '\n\t--')}</pre>;
        },
        VersionArm64: () => {
          return <pre>{versionArm64Text.replaceAll('--', '\n\t--')}</pre>;
        },
      }}
    />
  );
}

async function getText(url: string): Promise<string> {
  const response = await fetch(url);
  return await response.text();
}
