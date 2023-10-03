const groups = [
  { value: 'fts', text: 'Сети' },
  { value: 'otherClients', text: 'Клиенты' },
  { value: 'warehouses', text: 'Склады' },
]
export enum PARTNER_GROUPS_ENUM {
  fts = 'Сети',
  otherClients = 'Клиенты',
  warehouses = 'Склады',
}

export const PARTNER_GROUPS = groups
export const PARTNER_GROUPS_ENUM_VALUES = groups.map((i) => i.value)
