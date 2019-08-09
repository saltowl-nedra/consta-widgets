import React from 'react'

import { number, select, text } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'

import { blockCenteringDecorator } from '@/utils/Storybook'

import { ProgressLine, statuses, types } from '.'

storiesOf('components/ProgressLine', module)
  .addDecorator(blockCenteringDecorator())
  .add('interactive', () => (
    <ProgressLine
      progress={number('Progress', 50)}
      status={select('Status', statuses, statuses[0])}
      type={select('Type', types, types[0])}
    >
      {text('Content', '03:12:11')}
    </ProgressLine>
  ))