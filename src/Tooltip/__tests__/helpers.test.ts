import { getComputedPositionAndDirection, getPositionsByDirection } from '@/Tooltip/helpers'

import { directions } from '../'

const PARENT_SIZE = {
  width: 500,
  height: 500,
}

const ANCHOR_SIZE = {
  width: 100,
  height: 50,
}

const ELEMENT_SIZE = {
  width: 100,
  height: 50,
}

const defaultParams: Parameters<typeof getComputedPositionAndDirection>[0] = {
  tooltipSize: ELEMENT_SIZE,
  viewportSize: PARENT_SIZE,
  possibleDirections: directions,
  bannedDirections: [],
  direction: 'leftCenter',
  offset: 0,
  position: undefined,
}

describe('getPositionsByDirection', () => {
  it('возвращает позиции по направлениям без сдвигов и якоря', () => {
    const result = getPositionsByDirection({
      tooltipSize: { width: 100, height: 50 },
      anchorSize: { width: 0, height: 0 },
      position: { x: 0, y: 0 },
      offset: 0,
    })

    const expected: typeof result = {
      upLeft: { x: -100, y: -50 },
      upCenter: { x: -50, y: -50 },
      upRight: { x: 0, y: -50 },
      leftUp: { x: -100, y: -50 },
      leftCenter: { x: -100, y: -25 },
      leftDown: { x: -100, y: 0 },
      rightUp: { x: 0, y: -50 },
      rightCenter: { x: 0, y: -25 },
      rightDown: { x: 0, y: 0 },
      downLeft: { x: -100, y: 0 },
      downCenter: { x: -50, y: 0 },
      downRight: { x: 0, y: 0 },
    }

    expect(result).toEqual(expected)
  })

  it('возвращает позиции по направлениям со сдвигом', () => {
    const result = getPositionsByDirection({
      tooltipSize: { width: 100, height: 50 },
      anchorSize: { width: 0, height: 0 },
      position: { x: 0, y: 0 },
      offset: 5,
    })

    const expected: typeof result = {
      upLeft: { x: -100, y: -50 - 5 },
      upCenter: { x: -50, y: -50 - 5 },
      upRight: { x: 0, y: -50 - 5 },
      leftUp: { x: -100 - 5, y: -50 },
      leftCenter: { x: -100 - 5, y: -25 },
      leftDown: { x: -100 - 5, y: 0 },
      rightUp: { x: 5, y: -50 },
      rightCenter: { x: 5, y: -25 },
      rightDown: { x: 5, y: 0 },
      downLeft: { x: -100, y: 5 },
      downCenter: { x: -50, y: 5 },
      downRight: { x: 0, y: 5 },
    }

    expect(result).toEqual(expected)
  })

  it('возвращает позиции по направлениям относительно якоря', () => {
    const result = getPositionsByDirection({
      tooltipSize: { width: 100, height: 50 },
      anchorSize: { width: 20, height: 20 },
      position: { x: 300, y: 500 },
      offset: 0,
    })

    const expected: typeof result = {
      upLeft: { x: 300 + 10 - 100, y: 500 - 50 },
      upCenter: { x: 300 + 10 - 50, y: 500 - 50 },
      upRight: { x: 300 + 10, y: 500 - 50 },
      leftUp: { x: 300 - 100, y: 500 + 10 - 50 },
      leftCenter: { x: 300 - 100, y: 500 + 10 - 25 },
      leftDown: { x: 300 - 100, y: 500 + 10 },
      rightUp: { x: 300 + 20, y: 500 + 10 - 50 },
      rightCenter: { x: 300 + 20, y: 500 + 10 - 25 },
      rightDown: { x: 300 + 20, y: 500 + 10 },
      downLeft: { x: 300 + 10 - 100, y: 500 + 20 },
      downCenter: { x: 300 + 10 - 50, y: 500 + 20 },
      downRight: { x: 300 + 10, y: 500 + 20 },
    }

    expect(result).toEqual(expected)
  })

  it('возвращает позиции по направлениям относительно якоря, когда якорь шире тултипа', () => {
    const result = getPositionsByDirection({
      tooltipSize: { width: 100, height: 50 },
      anchorSize: { width: 200, height: 200 },
      position: { x: 300, y: 500 },
      offset: 0,
    })

    const expected: typeof result = {
      upLeft: { x: 300 + 100 - 100, y: 500 - 50 },
      upCenter: { x: 300 + 100 - 50, y: 500 - 50 },
      upRight: { x: 300 + 100, y: 500 - 50 },
      leftUp: { x: 300 - 100, y: 500 + 100 - 50 },
      leftCenter: { x: 300 - 100, y: 500 + 100 - 25 },
      leftDown: { x: 300 - 100, y: 500 + 100 },
      rightUp: { x: 300 + 200, y: 500 + 100 - 50 },
      rightCenter: { x: 300 + 200, y: 500 + 100 - 25 },
      rightDown: { x: 300 + 200, y: 500 + 100 },
      downLeft: { x: 300 + 100 - 100, y: 500 + 200 },
      downCenter: { x: 300 + 100 - 50, y: 500 + 200 },
      downRight: { x: 300 + 100, y: 500 + 200 },
    }

    expect(result).toEqual(expected)
  })

  it('возвращает позиции по направлениям относительно якоря со сдвигом стрелки', () => {
    const result = getPositionsByDirection({
      tooltipSize: { width: 100, height: 50 },
      anchorSize: { width: 20, height: 20 },
      position: { x: 300, y: 500 },
      offset: 0,
      arrowOffset: 8,
    })

    const expected: typeof result = {
      upLeft: { x: 300 + 10 - 100 + 8, y: 500 - 50 },
      upCenter: { x: 300 + 10 - 50, y: 500 - 50 },
      upRight: { x: 300 + 10 - 8, y: 500 - 50 },
      leftUp: { x: 300 - 100, y: 500 + 10 - 50 + 8 },
      leftCenter: { x: 300 - 100, y: 500 + 10 - 25 },
      leftDown: { x: 300 - 100, y: 500 + 10 - 8 },
      rightUp: { x: 300 + 20, y: 500 + 10 - 50 + 8 },
      rightCenter: { x: 300 + 20, y: 500 + 10 - 25 },
      rightDown: { x: 300 + 20, y: 500 + 10 - 8 },
      downLeft: { x: 300 + 10 - 100 + 8, y: 500 + 20 },
      downCenter: { x: 300 + 10 - 50, y: 500 + 20 },
      downRight: { x: 300 + 10 - 8, y: 500 + 20 },
    }

    expect(result).toEqual(expected)
  })
})

describe('getComputedPositionAndDirection', () => {
  describe('если тултип спозициронирован относительно координат', () => {
    it('возвращаем неопределенную позицию, если данные для позиции отсутствуют', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          direction: 'rightCenter',
          position: undefined,
        })
      ).toEqual({
        direction: 'rightCenter',
        position: undefined,
      })
    })

    it('отображаем тултип вниз по центру', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 250, y: 0 },
        })
      ).toEqual({
        direction: 'downCenter',
        position: { x: 200, y: 0 },
      })
    })

    it('отображаем тултип вверх по центру', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 150, y: 490 },
        })
      ).toEqual({
        direction: 'upCenter',
        position: { x: 100, y: 440 },
      })
    })

    it('отображаем тултип снизу по левому краю', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 10, y: 10 },
        })
      ).toEqual({
        direction: 'downRight',
        position: { x: 10, y: 10 },
      })
    })

    it('отображаем тултип снизу по правому краю', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 490, y: 10 },
        })
      ).toEqual({
        direction: 'downLeft',
        position: { x: 390, y: 10 },
      })
    })

    it('отображаем тултип сверху по левому краю', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 10, y: 490 },
        })
      ).toEqual({
        direction: 'upRight',
        position: { x: 10, y: 440 },
      })
    })

    it('отображаем тултип сверху по правому краю', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          position: { x: 490, y: 490 },
        })
      ).toEqual({
        direction: 'upLeft',
        position: { x: 390, y: 440 },
      })
    })

    it('отображаем тултип справа', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          viewportSize: {
            height: 50,
            width: 500,
          },
          position: { x: 50, y: 25 },
        })
      ).toEqual({
        direction: 'rightCenter',
        position: { x: 50, y: 0 },
      })
    })

    it('отображаем тултип слева', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          viewportSize: {
            height: 50,
            width: 500,
          },
          position: { x: 450, y: 25 },
        })
      ).toEqual({
        direction: 'leftCenter',
        position: { x: 350, y: 0 },
      })
    })

    it('если тултип никуда не помещается, то используем первоначальные настройки', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          direction: 'downCenter',
          viewportSize: {
            height: 50,
            width: 100,
          },
          position: { x: 50, y: 25 },
          tooltipSize: { width: 200, height: 300 },
        })
      ).toEqual({
        direction: 'downCenter',
        position: { x: -50, y: 25 },
      })
    })

    it('если тултип может поместиться в любую сторону, то используем сторону из настроек', () => {
      expect(
        getComputedPositionAndDirection({
          ...defaultParams,
          direction: 'rightCenter',
          viewportSize: {
            height: 1000,
            width: 1000,
          },
          position: { x: 500, y: 500 },
        })
      ).toEqual({
        direction: 'rightCenter',
        position: { x: 500, y: 475 },
      })
    })
  })

  describe('если тултип спозициронирован относительно элемента', () => {
    const params = {
      ...defaultParams,
      offset: 5,
    } as const

    it('отображаем тултип вниз по центру', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            width: 250,
            height: 50,
          },
          position: {
            x: 200,
            y: 100,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'downCenter',
        position: { x: 125, y: 155 },
      })
    })

    it('отображаем тултип вверх по центру', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            height: 100,
            width: 100,
          },
          position: {
            x: 400,
            y: 450,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'upCenter',
        position: { x: 400, y: 345 },
      })
    })

    it('отображаем тултип вниз вправо', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            width: 200,
            height: 50,
          },
          position: {
            x: 0,
            y: 0,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'downRight',
        position: { x: 50, y: 55 },
      })
    })

    it('отображаем тултип вниз влево', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            width: 500,
            height: 50,
          },
          position: {
            x: 450,
            y: 0,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'downLeft',
        position: { x: 0, y: 55 },
      })
    })

    it('отображаем тултип вверх вправо', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            width: 200,
            height: 50,
          },
          position: {
            x: 0,
            y: 450,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'upRight',
        position: { x: 50, y: 395 },
      })
    })

    it('отображаем тултип вверх влево', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          tooltipSize: {
            width: 200,
            height: 100,
          },
          position: {
            x: 400,
            y: 450,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'upLeft',
        position: { x: 250, y: 345 },
      })
    })

    it('отображаем тултип справа', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          viewportSize: {
            height: 50,
            width: 500,
          },
          position: {
            x: 0,
            y: 0,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'rightCenter',
        position: { x: 105, y: 0 },
      })
    })

    it('отображаем тултип слева', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          viewportSize: {
            height: 50,
            width: 500,
          },
          position: {
            x: 400,
            y: 0,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'leftCenter',
        position: { x: 295, y: 0 },
      })
    })

    it('если тултип никуда не помещается, то используем первоначальные настройки', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          direction: 'upCenter',
          viewportSize: {
            height: 50,
            width: 100,
          },
          position: {
            x: 0,
            y: 0,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'upCenter',
        position: { x: 0, y: -55 },
      })
    })

    it('если тултип может поместиться в любую сторону, то используем сторону из настроек', () => {
      expect(
        getComputedPositionAndDirection({
          ...params,
          direction: 'downRight',
          viewportSize: {
            height: 1000,
            width: 1000,
          },
          position: {
            x: 400,
            y: 500,
          },
          anchorSize: ANCHOR_SIZE,
        })
      ).toEqual({
        direction: 'downRight',
        position: { x: 450, y: 555 },
      })
    })
  })

  describe('если список разрешенных сторон состоит не из всех возможных вариантов', () => {
    it('всегда отображаем элемент вниз', () => {
      expect(
        getComputedPositionAndDirection({
          viewportSize: { width: 50, height: 500 },
          tooltipSize: { width: 100, height: 50 },
          direction: 'downCenter',
          position: { x: 25, y: 500 },
          offset: 0,
          possibleDirections: ['downCenter', 'downLeft', 'downRight'],
          bannedDirections: [],
        })
      ).toEqual({
        direction: 'downCenter',
        position: { x: -25, y: 500 },
      })
    })
  })

  describe('если есть список запрещенных сторон', () => {
    it('если вычисленная сторона под запретом, то возвращаем следующую подходящую сторону', () => {
      expect(
        getComputedPositionAndDirection({
          viewportSize: { width: 50, height: 500 },
          tooltipSize: { width: 100, height: 50 },
          direction: 'upCenter',
          position: { x: 25, y: 500 },
          offset: 0,
          possibleDirections: directions,
          bannedDirections: ['downCenter'],
        })
      ).toEqual({
        direction: 'upCenter',
        position: { x: -25, y: 450 },
      })
    })

    it('если все стороны под запретом, то возвращаем дефолтную позицию', () => {
      expect(
        getComputedPositionAndDirection({
          viewportSize: { width: 50, height: 500 },
          tooltipSize: { width: 100, height: 50 },
          direction: 'downCenter',
          position: { x: 25, y: 500 },
          offset: 0,
          possibleDirections: directions,
          bannedDirections: directions,
        })
      ).toEqual({
        direction: 'downCenter',
        position: { x: -25, y: 500 },
      })
    })
  })
})
