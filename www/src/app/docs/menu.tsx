'use client';

import {MenuIcon} from 'lucide-react';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export function DocsMenu() {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="border rounded p-1.5 bg-card">
          <MenuIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ml-6">
          {data.navMain.map(item => (
            <DropdownMenuItem asChild key={`DocsMenu-${item.url}`}>
              <Link href={item.url}>{item.title}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <SidebarProvider
        className="hidden md:block"
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
          <SidebarContent className="gap-0 pl-3 pr-6">
            {/* We create a collapsible SidebarGroup for each parent. */}
            {data.navMain.map(item => (
              <SidebarGroup key={`group-${item.title}`}>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  {item.items && item.items?.length > 0 ? (
                    <Link href={item.url}>{item.title} </Link>
                  ) : (
                    <Link href={item.url}>{item.title}</Link>
                  )}
                </SidebarGroupLabel>
                {item.items && item.items?.length > 0 && (
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
                )}
              </SidebarGroup>
            ))}
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    </>
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
          url: '/docs/ffremote/start#1-installation',
          isActive: true,
        },
        {
          title: 'Start an Execution',
          url: '/docs/ffremote/start#2-start-a-execution',
        },
        {
          title: 'Check the Status',
          url: '/docs/ffremote/start#3-check-job-status',
        },
        {
          title: 'Watch the Logs',
          url: '/docs/ffremote/start#4-watch-the-logs',
        },
        {
          title: 'Download the Results',
          url: '/docs/ffremote/start#5-download-the-results',
        },
      ],
    },
    {
      title: 'Reference',
      url: '/docs/ffremote/reference',
      items: [
        {
          title: 'CLI',
          url: '/docs/ffremote/reference/cli',
        },
      ],
    },
    {
      title: 'Pricing',
      url: '/docs/ffremote/pricing',
    },
    {
      title: 'Quotas',
      url: '/docs/ffremote/quotas',
    },
    {
      title: 'Support',
      url: '/docs/ffremote/support',
    },
  ],
};
