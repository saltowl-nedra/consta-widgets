import React from 'react'

import { IconCalendar } from '@consta/uikit/IconCalendar'
import { TextField, TextFieldPropOnChange } from '@consta/uikit/TextField'
import { Tooltip } from '@consta/uikit/Tooltip'

import { isValidDate } from '@/_private/utils/type-guards'

import { Size } from '../../'

import {
  getDateMidnightFromString,
  getInputValue,
  isDateFromInputIsFullyEntered,
  isParsedFromInputDateExists,
} from './helpers'
import css from './index.css'

type Props = {
  size?: Size
  value?: Date
  onChange: (value?: Date) => void
  isInvalid: boolean
  tooltipContent?: React.ReactNode
  isCalendarOpened: boolean
}

export const InputDate: React.FC<Props> = ({
  value,
  size = 'm',
  isInvalid,
  tooltipContent,
  onChange,
  isCalendarOpened,
}) => {
  const [isRealDate, setIsRealDate] = React.useState(true)
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const checkIsRealDate = () => {
    if (inputRef.current) {
      const date = getDateMidnightFromString(inputRef.current.value)

      if (isValidDate(date) && isDateFromInputIsFullyEntered(date)) {
        return setIsRealDate(!inputRef.current.validity.badInput)
      }
    }
  }

  const handleBlur = () => {
    if (inputRef.current && !isCalendarOpened) {
      const date = getDateMidnightFromString(inputRef.current.value)

      if (!isValidDate(date) || !isDateFromInputIsFullyEntered(date)) {
        return setIsRealDate(false)
      }
    }
  }

  const handleChange: TextFieldPropOnChange = ({ value: newValue }) => {
    if (!newValue || !isParsedFromInputDateExists(newValue)) {
      return onChange(undefined)
    }

    const date = getDateMidnightFromString(newValue)

    isValidDate(date) && onChange(date)
  }

  React.useLayoutEffect(checkIsRealDate, [value])

  return (
    <>
      <TextField
        ref={ref}
        inputRef={inputRef}
        className={css.input}
        type="date"
        size={size}
        view="default"
        form="default"
        state={isInvalid || !isRealDate ? 'alert' : undefined}
        rightSide={IconCalendar}
        value={getInputValue(value)}
        onChange={handleChange}
        // ловим смену даты на onKeyUp, т.к. onChange не срабатывает, если первая введенная дата - невалидная
        onKeyUp={checkIsRealDate}
        onBlur={handleBlur}
      />
      {tooltipContent && (
        <Tooltip size="m" anchorRef={ref} direction="rightCenter" isInteractive={false}>
          {tooltipContent}
        </Tooltip>
      )}
    </>
  )
}
