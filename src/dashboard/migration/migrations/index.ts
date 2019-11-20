import { Dashboard0 } from './dashboard0'
import { Dashboard1, migration1 } from './dashboard1'
import { Dashboard2, migration2 } from './dashboard2'
import { Dashboard3, migration3 } from './dashboard3'
import { Dashboard4, migration4 } from './dashboard4'

export type AnyDashboardStateVersion =
  | Dashboard0.State
  | Dashboard1.State
  | Dashboard2.State
  | Dashboard3.State
  | Dashboard4.State

export const migrations = [migration1, migration2, migration3, migration4] as const
