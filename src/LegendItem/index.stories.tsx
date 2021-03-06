import React from 'react'

import { text } from '@storybook/addon-knobs'
import { withSmartKnobs } from 'storybook-addon-smart-knobs'

import { createMetadata, createStory } from '@/_private/storybook'

import { LegendItem } from '.'

export const Interactive = createStory(() => (
  <LegendItem position="left" fontSize="s" type="dot" color="red">
    {text('children', 'Тестовый текст')}
  </LegendItem>
))

export default createMetadata({
  title: 'core/LegendItem',
  decorators: [withSmartKnobs()],
  parameters: {
    environment: {
      style: {
        width: 200,
      },
    },
  },
})
