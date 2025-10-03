export const metadata = {
  title: 'Pricing for FFremote',
};

export default async function Page() {
  return <></>;

  // const apiUrl = process.env.API_URL ?? 'https://api.elwood.run';
  // const response = await fetch(`${apiUrl}/platform/prices`, {
  //   next: {revalidate: 60},
  // });
  // const {default_region_id, instance_groups, instance_types} =
  //   (await response.json()) as {
  //     default_region_id: string;
  //     instance_groups: {id: string; label: string}[];
  //     instance_types: {
  //       id: string;
  //       group: string;
  //       type: string[];
  //       cpu: number;
  //       memory: number;
  //       gpu: number;
  //       gpu_memory: number;
  //       storage: number;
  //       storage_count: number;
  //       region_price_per_minute: Record<string, number>;
  //     }[];
  //   };

  // // eslint-disable-next-line react-hooks/rules-of-hooks
  // const c = useMDXComponents({}) as {
  //   table: (props: PropsWithChildren) => JSX.Element;
  //   tbody: (props: PropsWithChildren) => JSX.Element;
  //   tr: (props: PropsWithChildren) => JSX.Element;
  //   th: (props: PropsWithChildren) => JSX.Element;
  //   td: (props: PropsWithChildren) => JSX.Element;
  // };

  // return (
  //   <Content
  //     components={{
  //       Prices: () => (
  //         <c.table>
  //           <thead>
  //             <tr>
  //               <c.th>Instance Type</c.th>
  //               <c.th>vCPUs / Memory </c.th>
  //               <c.th>GPUs / Memory</c.th>
  //               <c.th>Storage (NVMe SSD)</c.th>
  //               <c.th>Price Per Minute</c.th>
  //             </tr>
  //           </thead>
  //           <c.tbody>
  //             {instance_groups.map(group => (
  //               <Fragment key={`${group.id}`}>
  //                 <tr>
  //                   <c.td>
  //                     <strong>{group.label}</strong>
  //                   </c.td>
  //                 </tr>
  //                 {instance_types
  //                   .filter(item => item.group === group.id)
  //                   .map(item => (
  //                     <tr key={`${group.id}-${item.id}`}>
  //                       <c.td>{item.type.join(' | ')}</c.td>
  //                       <c.td>
  //                         {item.cpu} / {item.memory}{' '}
  //                         <span className="text-muted-foreground text-xs">
  //                           GB
  //                         </span>
  //                       </c.td>

  //                       <c.td>
  //                         {item.gpu > 0 && (
  //                           <>
  //                             {item.gpu} / {item.gpu_memory}{' '}
  //                             <span className="text-muted-foreground text-xs">
  //                               GB
  //                             </span>
  //                           </>
  //                         )}
  //                         {item.gpu === 0 && (
  //                           <span className="text-muted-foreground text-xs">
  //                             none
  //                           </span>
  //                         )}
  //                       </c.td>
  //                       <c.td>
  //                         {item.storage_count > 1
  //                           ? `${item.storage_count} x `
  //                           : ''}
  //                         {item.storage}{' '}
  //                         <span className="text-muted-foreground text-xs">
  //                           GB
  //                         </span>
  //                       </c.td>
  //                       <c.td>
  //                         $
  //                         {item.region_price_per_minute[
  //                           default_region_id
  //                         ].toFixed(4)}
  //                       </c.td>
  //                     </tr>
  //                   ))}
  //               </Fragment>
  //             ))}
  //           </c.tbody>
  //         </c.table>
  //       ),
  //     }}
  //   />
  // );
}
