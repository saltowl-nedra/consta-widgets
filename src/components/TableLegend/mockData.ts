import { Filters, TableRow } from '@/utils/table'

export const filters = [
  {
    id: 'olderThan2018',
    name: 'Старше 2018 года',
    filterer: (value: number | string) => Number(value) > 2018,
    field: 'year',
  },
  {
    id: 'olderThan2000',
    name: 'Старше 2000 года',
    filterer: (value: number | string) => Number(value) > 2000,
    field: 'year',
  },
  {
    id: 'oil',
    name: 'Нефтяное',
    filterer: (value: string) => value === 'Нефтяное',
    field: 'type',
  },
  {
    id: 'condensated',
    name: 'Конденсатное',
    filterer: (value: string) => value === 'Конденсатное',
    field: 'type',
  },
  {
    id: 'combined',
    name: 'Комбинированное',
    filterer: (value: string) => value === 'Комбинированное',
    field: 'type',
  },
] as Filters

export const list = [
  {
    field: 'Приобское',
    year: 1982,
    type: 'Нефтяное',
    estimatedReserves: 5000,
    remainingReserves: 1700,
    production: 33,
    total: 313,
  },
  {
    field: 'Уренгойское газонефтеконденсат­ное',
    year: 2001,
    type: 'Конденсатное',
    estimatedReserves: 7540,
    remainingReserves: 7540,
    production: 363,
    total: 88,
  },
  {
    field: 'Красноленинская группа',
    year: 1985,
    type: 'Комбинированное',
    estimatedReserves: 8766,
    remainingReserves: 3374,
    production: 256,
    total: 434,
  },
  {
    field: 'Великое',
    year: 1989,
    type: 'Конденсатное',
    estimatedReserves: 1697,
    remainingReserves: 4818,
    production: 250,
    total: 236,
  },
  {
    field: 'Русское газонефтяное',
    year: 1997,
    type: 'Нефтяное',
    estimatedReserves: 5169,
    remainingReserves: 3712,
    production: 292,
    total: 417,
  },
] as readonly TableRow[]