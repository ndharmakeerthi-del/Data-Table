// import { Archive, LucideArchive, ChevronUp, Home, User2, MessageCircle } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSubButton, SidebarSeparator } from './ui/sidebar'
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

// const items = [
//     {
//         title: 'Dashboard',
//         path: '/',
//         icon: Home
//     },
//     {
//         title: 'Users',
//         path: '/user',
//         icon: User2
//     },
//     {
//         title: 'Products',
//         path: '/products',
//         icon: Archive
//     },
//     {
//         title: 'Local Products',
//         path: '/local-products',
//         icon: LucideArchive
//     },
//     {
//         title: 'Contact',
//         path: '/contact',
//         icon: MessageCircle
//     }
// ]

// function AppSideBar() {
//     return (
//         <Sidebar collapsible='none' className="border-r">
//             <SidebarHeader>
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <SidebarMenuButton asChild>
//                             <Link to='/' className="flex items-center gap-2">
//                                 <img src='https://github.com/shadcn.png' alt='Logo' className='w-6 h-6 rounded-full' />
//                                 <span className="font-semibold">Dashboard</span>
//                             </Link>
//                         </SidebarMenuButton>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarHeader>
//             <SidebarSeparator />
//             <SidebarContent>
//                 <SidebarGroup>
//                     <SidebarGroupLabel>Application</SidebarGroupLabel>
//                     <SidebarGroupContent>
//                         <SidebarMenu>
//                             {items.map((item) => (
//                                 <SidebarMenuItem key={item.title}>
//                                     <SidebarMenuButton asChild>
//                                         <Link to={item.path}>
//                                             <item.icon />
//                                             <span>{item.title}</span>
//                                         </Link>
//                                     </SidebarMenuButton>
//                                 </SidebarMenuItem>
//                             ))}
//                         </SidebarMenu>
//                     </SidebarGroupContent>
//                 </SidebarGroup>
//             </SidebarContent>
//             <SidebarSeparator />
//             <SidebarFooter>
//                 <SidebarMenu>
//                     <SidebarMenuItem>
//                         <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                                 <SidebarMenuSubButton>
//                                     <User2 />
//                                         User
//                                     <ChevronUp className='ml-auto'/>
//                                 </SidebarMenuSubButton>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align='end'>
//                                 <DropdownMenuItem>Account</DropdownMenuItem>
//                                 <DropdownMenuItem>Setting</DropdownMenuItem>
//                                 <DropdownMenuItem>Sign out</DropdownMenuItem>
//                             </DropdownMenuContent>
//                         </DropdownMenu>
//                     </SidebarMenuItem>
//                 </SidebarMenu>
//             </SidebarFooter>
//         </Sidebar>
//     )
// }

// export default AppSideBar