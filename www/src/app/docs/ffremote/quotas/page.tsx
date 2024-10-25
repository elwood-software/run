import {Fragment, PropsWithChildren} from 'react';

import {useMDXComponents} from '../../../../mdx-components';
import Content from './content.mdx';

export default async function Page() {
  const apiUrl = process.env.API_URL ?? 'https://api.elwood.run';
  const response = await fetch(`${apiUrl}/platform/limits`, {
    next: {revalidate: 60},
  });
  const {plans, entitlements} = (await response.json()) as {
    plans: Array<{
      preset: string;
      label: string;
      [key: string]: string | number;
    }>;
    entitlements: Record<string, string>;
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const c = useMDXComponents({}) as {
    table: (props: PropsWithChildren) => JSX.Element;
    tbody: (props: PropsWithChildren) => JSX.Element;
    tr: (props: PropsWithChildren) => JSX.Element;
    th: (props: PropsWithChildren) => JSX.Element;
    td: (props: PropsWithChildren) => JSX.Element;
  };

  return (
    <Content
      components={{
        Limits: () => (
          <c.table>
            <thead>
              <tr>
                <c.th>Limit</c.th>
                {plans.map(item => (
                  <c.th key={`th-${item.preset}`}>{item.label}</c.th>
                ))}
              </tr>
            </thead>
            <c.tbody>
              {Object.entries(entitlements).map(([key, label]) => (
                <Fragment key={`${key}`}>
                  <tr>
                    <c.td>
                      <strong>{label}</strong>
                    </c.td>

                    {plans.map(item => (
                      <c.td key={`${key}-${item.preset}`}>{item[key]}</c.td>
                    ))}
                  </tr>
                </Fragment>
              ))}
            </c.tbody>
          </c.table>
        ),
      }}
    />
  );
}
