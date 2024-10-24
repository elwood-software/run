'use client';

import {PropsWithChildren} from 'react';
import Link from 'next/link';
import {ChevronRight} from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {FFrLogo} from '@/components/ffr-logo';

export default function Layout(props: PropsWithChildren) {
  return (
    <div className="h-screen w-full grid grid-cols-[300px_5fr]">
      <div className="">
        <SidebarProvider
          style={{
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            '--sidebar-width': '300px',
          }}>
          <Sidebar>
            <SidebarHeader>
              <header className="py-6 flex items-center justify-center">
                <Link href="/ffr">
                  <FFrLogo />
                </Link>
              </header>
            </SidebarHeader>
            <SidebarContent className="gap-0">
              {/* We create a collapsible SidebarGroup for each parent. */}
              {data.navMain.map(item => (
                <Collapsible
                  key={item.title}
                  title={item.title}
                  className="group/collapsible">
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      {item.items && item.items?.length > 0 ? (
                        <CollapsibleTrigger>
                          {item.title}{' '}
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                      ) : (
                        <Link href={item.url}>{item.title}</Link>
                      )}
                    </SidebarGroupLabel>
                    {item.items && item.items?.length > 0 && (
                      <CollapsibleContent>
                        <SidebarGroupContent>
                          <SidebarMenu className="border-l ml-2 pt-1">
                            {item.items?.map(item => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  className="ml-2 text-muted-foreground"
                                  asChild>
                                  <Link href={item.url}>{item.title}</Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </CollapsibleContent>
                    )}
                  </SidebarGroup>
                </Collapsible>
              ))}
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
      <div className="grow">
        <div className="mx-auto max-w-6xl px-6 py-12">{props.children}</div>
      </div>
    </div>
  );
}

const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '/docs/ffremote/start',
      items: [
        {
          title: 'Installation',
          url: '/docs/ffremote/start#installation',
          isActive: true,
        },
        {
          title: 'Start a Job',
          url: '/docs/ffremote/start#start-a-job',
        },
        {
          title: 'Check the Status',
          url: '/docs/ffremote/start#check-the-status',
        },
        {
          title: 'Watch the Logs',
          url: '/docs/ffremote/start#watch-the-logs',
        },
        {
          title: 'Download the Results',
          url: '/docs/ffremote/start#download-the-results',
        },
      ],
    },
    {
      title: 'Pricing',
      url: '/docs/ffr/pricing',
    },
    {
      title: 'Support',
      url: '/docs/ffr/support',
    },

    // {
    //   title: 'Building Your Application',
    //   url: '#',
    //   items: [
    //     {
    //       title: 'Routing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Data Fetching',
    //       url: '#',
    //       isActive: true,
    //     },
    //     {
    //       title: 'Rendering',
    //       url: '#',
    //     },
    //     {
    //       title: 'Caching',
    //       url: '#',
    //     },
    //     {
    //       title: 'Styling',
    //       url: '#',
    //     },
    //     {
    //       title: 'Optimizing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Configuring',
    //       url: '#',
    //     },
    //     {
    //       title: 'Testing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Authentication',
    //       url: '#',
    //     },
    //     {
    //       title: 'Deploying',
    //       url: '#',
    //     },
    //     {
    //       title: 'Upgrading',
    //       url: '#',
    //     },
    //     {
    //       title: 'Examples',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'API Reference',
    //   url: '#',
    //   items: [
    //     {
    //       title: 'Components',
    //       url: '#',
    //     },
    //     {
    //       title: 'File Conventions',
    //       url: '#',
    //     },
    //     {
    //       title: 'Functions',
    //       url: '#',
    //     },
    //     {
    //       title: 'next.config.js Options',
    //       url: '#',
    //     },
    //     {
    //       title: 'CLI',
    //       url: '#',
    //     },
    //     {
    //       title: 'Edge Runtime',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Architecture',
    //   url: '#',
    //   items: [
    //     {
    //       title: 'Accessibility',
    //       url: '#',
    //     },
    //     {
    //       title: 'Fast Refresh',
    //       url: '#',
    //     },
    //     {
    //       title: 'Next.js Compiler',
    //       url: '#',
    //     },
    //     {
    //       title: 'Supported Browsers',
    //       url: '#',
    //     },
    //     {
    //       title: 'Turbopack',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Community',
    //   url: '#',
    //   items: [
    //     {
    //       title: 'Contribution Guide',
    //       url: '#',
    //     },
    //   ],
    // },
  ],
};
