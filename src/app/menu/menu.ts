import { CoreMenu } from '@core/types';

//? DOC: http://localhost:7777/demo/vuexy-angular-admin-dashboard-template/documentation/guide/development/navigation-menus.html#interface

export const menu: CoreMenu[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'item',
    url: 'dashboard/person-list',
    // role: ['Admin'], //? To hide collapsible based on user role
    icon: 'home',
  },
]