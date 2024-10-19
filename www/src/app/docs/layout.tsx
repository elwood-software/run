'use client';

import {PropsWithChildren, useState} from 'react';

import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalEnd,
  Search,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {FFrLogo} from '@/components/ffr-logo';
import Link from 'next/link';

export default function Layout(props: PropsWithChildren) {
  const [selectedVersion, setSelectedVersion] = useState(data.versions[0]);

  return (
    <div className="h-screen w-full grid grid-cols-[300px_5fr]">
      <div className="">
        <SidebarProvider
          style={{
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
                  defaultOpen
                  className="group/collapsible">
                  <SidebarGroup>
                    <SidebarGroupLabel
                      asChild
                      className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                      <CollapsibleTrigger>
                        {item.title}{' '}
                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarGroupLabel>
                    <CollapsibleContent>
                      <SidebarGroupContent>
                        <SidebarMenu className="border-l ml-2 pt-1">
                          {item.items.map(item => (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                className="ml-2 text-muted-foreground"
                                asChild
                                isActive={item.isActive}>
                                <a href={item.url}>{item.title}</a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </CollapsibleContent>
                  </SidebarGroup>
                </Collapsible>
              ))}
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
      <div className="grow">
        <div className="mx-auto max-w-6xl px-6 py-12 mdx-content">
          {props.children}
        </div>
      </div>
    </div>
  );
}

const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Getting Started',
      url: '/docs/ffr/start',
      items: [
        {
          title: 'Installation',
          url: '/docs/ffr/start#installation',
        },
        {
          title: 'Start a Job',
          url: '/docs/ffr/start#start-a-job',
        },
        {
          title: 'Check the Status',
          url: '/docs/ffr/start#check-the-status',
        },
        {
          title: 'Watch the Logs',
          url: '/docs/ffr/start#watch-the-logs',
        },
        {
          title: 'Download the Results',
          url: '/docs/ffr/start#download-the-results',
        },
      ],
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
