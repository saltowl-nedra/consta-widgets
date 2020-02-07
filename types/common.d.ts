declare module '*.svg' {
  export const ReactComponent: React.ComponentType<React.SVGProps<SVGSVGElement> & {
    children?: never
  }>
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module 'storybook-addon-smart-knobs' {
  import { DecoratorFn } from '@storybook/react'

  export const withSmartKnobs: (options?: { ignoreProps?: readonly string[] }) => DecoratorFn
}

declare module 'react-onclickout' {
  /* tslint:disable-next-line:ordered-imports */
  import { ComponentType } from 'react'

  const ClickOutHandler: ComponentType<{
    onClickOut: () => void
  }>

  export default ClickOutHandler
}

// полностью используем декларации d3 для перезаписи существующих
declare module 'd3' {
  export * from 'd3-array'
  export * from 'd3-axis'
  export * from 'd3-brush'
  export * from 'd3-chord'
  export * from 'd3-collection'
  export * from 'd3-color'
  export * from 'd3-contour'
  export * from 'd3-dispatch'
  export * from 'd3-drag'
  export * from 'd3-dsv'
  export * from 'd3-ease'
  export * from 'd3-fetch'
  export * from 'd3-force'
  export * from 'd3-format'
  export * from 'd3-geo'
  export * from 'd3-hierarchy'
  export * from 'd3-interpolate'
  export * from 'd3-path'
  export * from 'd3-polygon'
  export * from 'd3-quadtree'
  export * from 'd3-random'
  export * from 'd3-scale'
  export * from 'd3-scale-chromatic'
  export * from 'd3-selection'
  export * from 'd3-shape'
  export * from 'd3-time'
  export * from 'd3-time-format'
  export * from 'd3-timer'
  export * from 'd3-transition'
  export * from 'd3-voronoi'
  export * from 'd3-zoom'

  import { Numeric } from 'd3-array'

  export function extent<T, U extends Numeric>(
    array: ReadonlyArray<T>,
    accessor: (datum: T, index: number, array: ReadonlyArray<T>) => U | undefined | null
  ): readonly [U, U] | readonly [undefined, undefined]
}

declare module '*.geojson' {
  const content: d3.ExtendedFeatureCollection
  export = content
}
