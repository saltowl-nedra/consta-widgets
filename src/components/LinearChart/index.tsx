import React from 'react'
import { uid } from 'react-uid'

import { isDefined } from '@gaz/utils/lib/type-guards'
import * as d3 from 'd3'
import * as _ from 'lodash'

import { Axis, GridConfig } from '@/components/LinearChart/components/Axis'
import { ColorGroups, FormatValue } from '@/dashboard/types'

import { HoverLines } from './components/HoverLines'
import { Line as LineComponent } from './components/Line'
import { LineTooltip } from './components/LineTooltip'
import { Zoom } from './components/Zoom'
import css from './index.css'

export type Line = {
  colorGroupName: string
  values: readonly Item[]
  dots?: boolean
  lineName: string
}
export type Item = { x: number; y: number }
export type NumberRange = readonly [number, number]
export type TickValues = readonly number[]
export type ScaleLinear = d3.ScaleLinear<number, number>

type Props = {
  lines: readonly Line[]
  gridConfig: GridConfig
  withZoom?: boolean
  isVertical?: boolean
  formatValueForLabel: FormatValue
  formatValueForTooltip?: FormatValue
  formatValueForTooltipTitle?: FormatValue
  colorGroups: ColorGroups
  unit?: string
}

type State = {
  xDomain: NumberRange
  yDomain: NumberRange
  width: number
  height: number
  paddingX: number
  paddingY: number
  zoom: number
  xGuideValue: number
  yGuideValue: number
  activeHoverLine?: number
}

const INITIAL_DOMAIN = [Number.MIN_VALUE, Number.MAX_VALUE] as const

export const TRANSITION_DURATIONS = {
  ZOOM: 750,
  SIZE: 600,
}

const DOT_SIZE = 5

export const domainPaddings = {
  horizontal: {
    top: 0.055,
    right: 0.06,
    bottom: 0,
    left: 0,
  },
  vertical: {
    top: 0.04,
    bottom: 0.04,
    right: 0.06,
    left: 0.06,
  },
}

const getIndexWithFallbackToDefault = (index: number, def: number): number =>
  index < 0 ? def : index

export const padDomain = (
  domain: NumberRange,
  paddingStart: number,
  paddingEnd: number,
  zoom: number
): NumberRange => {
  const [start, end] = domain
  const delta = domain[1] - domain[0]

  return [start - paddingStart * delta * (1 / zoom), end + paddingEnd * delta * (1 / zoom)]
}

const getXRange = (width: number) => [0, width] as NumberRange
const getYRange = (height: number) =>
  [
    // Чтобы нарисовался гридлайн на нижней оси
    height - 1,
    0,
  ] as NumberRange

const getXScale = (domain: NumberRange, width: number) =>
  d3
    .scaleLinear()
    .domain([...domain])
    .range(getXRange(width))
const getYScale = (domain: NumberRange, height: number) =>
  d3
    .scaleLinear()
    .domain([...domain])
    .range(getYRange(height))

export const calculateSecondaryDomain = (
  mainDomainMin: number,
  mainDomainMax: number,
  lines: readonly Line[],
  getValue: (v: Item) => number,
  getDomain: (items: readonly Item[]) => NumberRange
) => {
  const lineDomains = lines.map(({ values }) => {
    const zoomRangeIndexes = _.sortBy([
      getIndexWithFallbackToDefault(_.findLastIndex(values, v => getValue(v) <= mainDomainMin), 0),
      getIndexWithFallbackToDefault(
        _.findIndex(values, v => getValue(v) >= mainDomainMax),
        values.length - 1
      ),
    ])

    const valuesInZoomRange = values.slice(zoomRangeIndexes[0], zoomRangeIndexes[1] + 1)

    return getDomain(valuesInZoomRange)
  })

  return [
    Math.min(...lineDomains.map(d => d[0])),
    Math.max(...lineDomains.map(d => d[1])),
  ] as NumberRange
}

export const getUniqValues = (
  items: readonly Item[],
  domain: NumberRange,
  type: 'x' | 'y',
  isVertical?: boolean
) =>
  _.sortBy(
    _.uniq(items.map(v => v[type])).filter(i =>
      isVertical ? i >= domain[1] && i <= domain[0] : i >= domain[0] && i <= domain[1]
    )
  )

export const getMainTickValues = ({
  items,
  domain,
  gridConfig,
  tickType,
  guideValue,
  isVertical,
}: {
  items: readonly Item[]
  domain: NumberRange
  gridConfig: GridConfig
  tickType: 'labelTicks' | 'gridTicks'
  guideValue: number
  isVertical?: boolean
}): TickValues => {
  if (domain === INITIAL_DOMAIN) {
    return []
  }

  const config = gridConfig[isVertical ? 'y' : 'x']
  const uniqValues = getUniqValues(items, domain, isVertical ? 'y' : 'x', isVertical)
  const ticks = config[tickType] || 0
  const isGuide = tickType === 'gridTicks' && config.guide && domain[0] <= guideValue
  const result =
    ticks === 0 ? [] : _.chunk(uniqValues, Math.ceil(uniqValues.length / ticks)).map(arr => arr[0])

  if (result.length === 2 || (tickType === 'labelTicks' && [1, 2].includes(ticks))) {
    return _.uniq([uniqValues[0], uniqValues[uniqValues.length - 1]])
  }

  return _.uniq(result.concat(isGuide ? [guideValue] : []))
}

export const getSecondaryTickValues = ({
  items,
  domain,
  gridConfig,
  tickType,
  guideValue,
  isVertical,
}: {
  items: readonly Item[]
  domain: NumberRange
  gridConfig: GridConfig
  tickType: 'labelTicks' | 'gridTicks'
  guideValue: number
  isVertical?: boolean
}) => {
  if (domain === INITIAL_DOMAIN) {
    return []
  }

  const config = gridConfig[isVertical ? 'x' : 'y']
  const uniqValues = getUniqValues(items, domain, isVertical ? 'x' : 'y', false)
  const ticks = config[tickType] || 0
  const isGuide = tickType === 'gridTicks' && config.guide && domain[0] <= guideValue
  const result = ticks === 0 ? [] : d3.ticks(domain[0], domain[1], ticks)

  if (result.length === 2 || (tickType === 'labelTicks' && [1, 2].includes(ticks))) {
    return _.uniq([uniqValues[0], uniqValues[uniqValues.length - 1]])
  }

  return _.uniq(result.concat(isGuide ? [guideValue] : []))
}

const defaultPosition = {
  x: 0,
  y: 0,
}

const getOffsetPosition = (
  position: Item,
  svgRef: React.RefObject<SVGGElement>,
  scaleX: ScaleLinear,
  scaleY: ScaleLinear
) => {
  if (!svgRef.current) {
    return defaultPosition
  }

  const { left, top } = svgRef.current.getBoundingClientRect()

  return {
    x: scaleX(position.x) + left,
    y: scaleY(position.y) + top,
  }
}

const getTitleTooltip = (
  value: number,
  formatValueForLabel: FormatValue,
  formatValueForTooltipTitle?: FormatValue
) => {
  return formatValueForTooltipTitle ? formatValueForTooltipTitle(value) : formatValueForLabel(value)
}

export class LinearChart extends React.Component<Props, State> {
  ref = React.createRef<HTMLDivElement>()
  svgWrapperRef = React.createRef<SVGSVGElement>()

  resizeObserver = new ResizeObserver(() => this.updateSize())

  // d3 ограничивает по 1 анимации на элемент, поэтому создаём фэйковые элементы для твинов стэйта
  paddingTransitionEl = {} as Element
  secondaryDomainTransitionEl = {} as Element

  uid = uid(this)
  lineClipId = `line_clipPath_${this.uid}`
  dotsClipId = `dots_clipPath_${this.uid}`

  state: State = {
    xDomain: INITIAL_DOMAIN,
    yDomain: INITIAL_DOMAIN,
    width: 0,
    height: 0,
    paddingX: 0,
    paddingY: 0,
    zoom: 1,
    xGuideValue: 0,
    yGuideValue: 0,
  }

  targetSecondaryDomain = this.state.xDomain
  targetPaddings = {
    paddingX: this.state.paddingX,
    paddingY: this.state.paddingY,
  }

  componentDidMount() {
    this.updateDomains()
    this.updateSize()

    this.resizeObserver.observe(this.ref.current!)
  }

  componentDidUpdate(prevProps: Props) {
    const {
      props: { lines, isVertical },
    } = this

    if (lines !== prevProps.lines || isVertical !== prevProps.isVertical) {
      this.updateDomains()
    }
  }

  componentWillUnmount() {
    this.resizeObserver.unobserve(this.ref.current!)
  }

  render() {
    const {
      props: {
        gridConfig,
        gridConfig: {
          x: { labels: xLabelsPos },
          y: { labels: yLabelsPos },
        },
        withZoom,
        isVertical,
        lines,
        formatValueForLabel,
        formatValueForTooltip,
        formatValueForTooltipTitle,
        colorGroups,
        unit,
      },
      state: { paddingX, paddingY, xDomain, yDomain, xGuideValue, yGuideValue, activeHoverLine },
    } = this
    const { svgWidth, svgHeight } = this.getSvgSize()
    const { main: mainAxis } = this.getAxis()
    const {
      mainLabelTickValues,
      mainGridTickValues,
      secondaryLabelTickValues,
      secondaryGridTickValues,
    } = this.getTicks()

    const lineClipPath = `url(#${this.lineClipId})`
    const scaleX = getXScale(xDomain, svgWidth)
    const scaleY = getYScale(yDomain, svgHeight)
    const dotRadius = DOT_SIZE / 2
    const xOnBottom = xLabelsPos === 'bottom'
    const yOnLeft = yLabelsPos === 'left'

    const linesOnTheActiveHoverLine = this.getLines()
      .map(obj => {
        const item = obj.values.find(
          position => position[isVertical ? 'y' : 'x'] === activeHoverLine
        )

        if (!item) {
          return undefined
        }

        const value = isVertical ? item.x : item.y

        return {
          color: colorGroups[obj.colorGroupName],
          name: obj.lineName,
          item,
          formattedValue: formatValueForTooltip ? formatValueForTooltip(value) : String(value),
        }
      })
      .filter(isDefined)

    const maxAxisValue =
      _.maxBy(
        linesOnTheActiveHoverLine.map(obj => obj.item),
        item => item[isVertical ? 'x' : 'y']
      ) || defaultPosition

    const tooltipPosition = getOffsetPosition(maxAxisValue, this.svgWrapperRef, scaleX, scaleY)
    const tooltipDirection = isVertical ? 'right' : 'top'
    const tooltipTitle = activeHoverLine
      ? getTitleTooltip(activeHoverLine, formatValueForLabel, formatValueForTooltipTitle)
      : ''

    return (
      <div ref={this.ref} className={css.main}>
        <LineTooltip
          isVisible={!!activeHoverLine}
          position={tooltipPosition}
          linesOnTheActiveHoverLine={linesOnTheActiveHoverLine}
          title={tooltipTitle}
          direction={tooltipDirection}
        />
        <svg
          ref={this.svgWrapperRef}
          className={css.svg}
          width={svgWidth}
          height={svgHeight}
          style={{
            ...(xOnBottom ? { top: 0 } : { bottom: 0 }),
            ...(yOnLeft ? { right: 0 } : { left: 0 }),
          }}
        >
          <defs>
            <clipPath id={this.lineClipId}>
              <rect width={svgWidth} height={svgHeight} />
            </clipPath>
            <clipPath id={this.dotsClipId}>
              <rect
                width={svgWidth + 2 * dotRadius}
                height={svgHeight + 2 * dotRadius}
                x={-1 * dotRadius}
                y={-1 * dotRadius}
              />
            </clipPath>
          </defs>

          <Axis
            width={svgWidth}
            height={svgHeight}
            scales={{
              x: scaleX,
              y: scaleY,
            }}
            gridConfig={gridConfig}
            lineClipPath={lineClipPath}
            onAxisSizeChange={this.onAxisSizeChange}
            mainLabelTickValues={mainLabelTickValues}
            mainGridTickValues={mainGridTickValues}
            secondaryLabelTickValues={secondaryLabelTickValues}
            secondaryGridTickValues={secondaryGridTickValues}
            isVertical={isVertical}
            formatValueForLabel={formatValueForLabel}
            secondaryScaleUnit={unit}
            xGuideValue={xGuideValue}
            yGuideValue={yGuideValue}
          />

          {this.getLines().map(line => (
            <LineComponent
              key={line.colorGroupName}
              values={[...line.values]}
              color={colorGroups[line.colorGroupName]}
              hasDotRadius={line.dots}
              defaultDotRadius={dotRadius}
              scaleX={scaleX}
              scaleY={scaleY}
              lineClipPath={lineClipPath}
              dotsClipPath={`url(#${this.dotsClipId})`}
              activeHoverLine={activeHoverLine}
              isVertical={Boolean(isVertical)}
              setActiveHoverLine={this.setActiveHoverLine}
            />
          ))}

          <HoverLines
            line={this.getLines()[0]}
            scaleX={scaleX}
            scaleY={scaleY}
            setActiveHoverLine={this.setActiveHoverLine}
            width={svgWidth}
            height={svgHeight}
            isVertical={Boolean(isVertical)}
            activeHoverLine={activeHoverLine}
          />
        </svg>

        {withZoom && (
          <Zoom
            isVertical={Boolean(isVertical)}
            xRange={getXRange(svgWidth)}
            yRange={getYRange(svgHeight)}
            paddingX={paddingX}
            paddingY={paddingY}
            xLabelsPos={xLabelsPos}
            yLabelsPos={yLabelsPos}
            domain={mainAxis.currentDomain}
            originalDomain={mainAxis.getDomain(this.getAllValues())}
            onZoom={this.onZoom}
            lines={lines}
          />
        )}
      </div>
    )
  }

  getXDomain = (items: readonly Item[]): NumberRange => {
    const { isVertical } = this.props
    const { zoom } = this.state
    const { left, right } = domainPaddings[isVertical ? 'vertical' : 'horizontal']
    const domain = d3.extent(items, v => v.x) as NumberRange
    return padDomain(domain, left, right, zoom)
  }

  getYDomain = (items: readonly Item[]): NumberRange => {
    const { isVertical } = this.props
    const { zoom } = this.state
    const { top, bottom } = domainPaddings[isVertical ? 'vertical' : 'horizontal']
    const domain = d3.extent(items, v => v.y)
    return padDomain(
      (isVertical
        ? [...domain].reverse() // Чтобы 0 был сверху
        : domain) as NumberRange,
      bottom,
      top,
      zoom
    )
  }

  getLines = (): readonly Line[] => {
    const { lines, isVertical } = this.props

    return isVertical
      ? lines.map(line => ({
          ...line,
          values: _.sortBy(
            line.values.map(v => ({
              x: v.y,
              y: v.x,
            })),
            'y'
          ),
        }))
      : lines
  }
  getAllValues = (): readonly Item[] => _.flatten(this.getLines().map(l => l.values))

  getSvgSize = () => {
    const {
      state: { width, height, paddingX, paddingY },
    } = this

    return {
      svgWidth: Math.round(width - paddingX),
      svgHeight: Math.round(height - paddingY),
    }
  }

  getTicks = () => {
    const { isVertical, gridConfig } = this.props
    const { xGuideValue, yGuideValue, xDomain, yDomain } = this.state

    return {
      mainLabelTickValues: getMainTickValues({
        items: this.getAllValues(),
        domain: isVertical ? yDomain : xDomain,
        gridConfig,
        tickType: 'labelTicks',
        guideValue: isVertical ? yGuideValue : xGuideValue,
        isVertical,
      }),
      mainGridTickValues: getMainTickValues({
        items: this.getAllValues(),
        domain: isVertical ? yDomain : xDomain,
        gridConfig,
        tickType: 'gridTicks',
        guideValue: isVertical ? yGuideValue : xGuideValue,
        isVertical,
      }),
      secondaryLabelTickValues: getSecondaryTickValues({
        items: this.getAllValues(),
        domain: isVertical ? xDomain : yDomain,
        gridConfig,
        tickType: 'labelTicks',
        guideValue: isVertical ? xGuideValue : yGuideValue,
        isVertical,
      }),
      secondaryGridTickValues: getSecondaryTickValues({
        items: this.getAllValues(),
        domain: isVertical ? xDomain : yDomain,
        gridConfig,
        tickType: 'gridTicks',
        guideValue: isVertical ? xGuideValue : yGuideValue,
        isVertical,
      }),
    }
  }

  updateDomains() {
    const xDomain = this.getXDomain(this.getAllValues())
    const yDomain = this.getYDomain(this.getAllValues())
    const [xGuideValue] = d3.extent(this.getAllValues(), v => v.x) as NumberRange
    const [yGuideValue] = d3.extent(this.getAllValues(), v => v.y) as NumberRange

    this.setState({
      xDomain,
      yDomain,
      xGuideValue,
      yGuideValue,
    })
  }

  updateSize = () => {
    const { width, height } = this.ref.current!.getBoundingClientRect()
    const newSize = { width, height }

    if (!_.isEqual(_.pick(this.state, ['width', 'height']), newSize)) {
      this.setState(newSize)
    }
  }

  onAxisSizeChange = ({ xAxisHeight, yAxisWidth }: { xAxisHeight: number; yAxisWidth: number }) => {
    const newPaddings = {
      paddingX: yAxisWidth,
      paddingY: xAxisHeight,
    }

    if (!_.isEqual(newPaddings, this.targetPaddings)) {
      this.targetPaddings = newPaddings

      const currentPaddings = _.pick(this.state, ['paddingX', 'paddingY'])

      if (!currentPaddings.paddingX || !currentPaddings.paddingY) {
        this.setState(newPaddings)
      } else {
        d3.select(this.paddingTransitionEl)
          .transition()
          .duration(TRANSITION_DURATIONS.SIZE)
          .tween('paddings', () => {
            const i = d3.interpolateObject(currentPaddings, newPaddings)

            return (t: number) => {
              this.setState({ ...i(t) })
            }
          })
      }
    }
  }

  getAxis = () => {
    const {
      state: { xDomain, yDomain },
      props: { isVertical },
    } = this
    const { svgWidth, svgHeight } = this.getSvgSize()
    const setXDomain = (domain: NumberRange) => this.setState({ xDomain: domain })
    const setYDomain = (domain: NumberRange) => this.setState({ yDomain: domain })

    return isVertical
      ? {
          main: {
            currentDomain: yDomain,
            getDomain: this.getYDomain,
            setDomain: setYDomain,
            getScale: getYScale,
            rescale: 'rescaleY',
            getValue: (v: Item) => v.y,
            size: svgHeight,
          },
          secondary: {
            currentDomain: xDomain,
            getDomain: this.getXDomain,
            setDomain: setXDomain,
          },
        }
      : {
          main: {
            currentDomain: xDomain,
            getDomain: this.getXDomain,
            setDomain: setXDomain,
            getScale: getXScale,
            rescale: 'rescaleX',
            getValue: (v: Item) => v.x,
            size: svgWidth,
          },
          secondary: {
            currentDomain: yDomain,
            getDomain: this.getYDomain,
            setDomain: setYDomain,
          },
        }
  }

  onZoom = () => {
    const { main: mainAxis, secondary: secondaryAxis } = this.getAxis()

    this.setState({ zoom: d3.event.transform.k })

    const originalMainDomain = mainAxis.getDomain(this.getAllValues())
    const originalMainScale = mainAxis.getScale(originalMainDomain, mainAxis.size)
    const newMainScale = d3.event.transform[mainAxis.rescale](originalMainScale)
    const newMainDomain: NumberRange = newMainScale.domain()

    if (_.isEqual(mainAxis.currentDomain, newMainDomain)) {
      return
    }

    mainAxis.setDomain(newMainDomain)

    // Значения в домене не всегда идут от меньшего к большему: у вертикального графика домен перевёрнут, чтобы 0 был наверху графика
    const domainMin = Math.min(...newMainDomain)
    const domainMax = Math.max(...newMainDomain)

    const newSecondaryDomain = calculateSecondaryDomain(
      domainMin,
      domainMax,
      this.getLines(),
      mainAxis.getValue,
      secondaryAxis.getDomain
    )

    if (!_.isEqual(newSecondaryDomain, this.targetSecondaryDomain)) {
      this.targetSecondaryDomain = newSecondaryDomain

      d3.select(this.secondaryDomainTransitionEl)
        .transition()
        .duration(TRANSITION_DURATIONS.ZOOM)
        .tween('secondaryDomainTween', () => {
          const i = d3.interpolateArray([...secondaryAxis.currentDomain], [...newSecondaryDomain])

          return (t: number) => {
            // убеждаемся, что setDomain получит на входе массив с нужной длиной
            secondaryAxis.setDomain([i(t)[0], i(t)[1]] as NumberRange)
          }
        })
    }
  }

  setActiveHoverLine = (line?: number) => this.setState({ activeHoverLine: line })
}
