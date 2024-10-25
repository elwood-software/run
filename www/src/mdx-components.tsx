import type {MDXComponents} from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1({children, id}) {
      return (
        <h1 id={id} className="font-extrabold text-3xl mb-6">
          {children}
        </h1>
      );
    },
    h2({children, id}) {
      return (
        <h2 id={id} className="font-bold text-2xl mt-12 mb-6">
          {children}
        </h2>
      );
    },
    h3({children, id}) {
      return (
        <h3 id={id} className="font-bold text-xl mb-6">
          {children}
        </h3>
      );
    },
    table({children}) {
      return (
        <table className="w-full divide-y divide-border">{children}</table>
      );
    },
    th({children}) {
      return (
        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
          <span className="pl-4 text-muted-foreground">{children}</span>
        </th>
      );
    },
    td({children}) {
      return (
        <td className="whitespace-nowrap px-3 py-4 text-sm">{children}</td>
      );
    },
    tbody({children}) {
      return <tbody className="divide-y divide-border">{children}</tbody>;
    },
    pre({children}) {
      return (
        <pre className="block text-card-foreground p-3 rounded bg-card border mb-6">
          {children}
        </pre>
      );
    },
    section: ({children}) => <section className="mb-6">{children}</section>,
  };
}
