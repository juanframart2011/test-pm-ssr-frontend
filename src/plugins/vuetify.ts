import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify, type ThemeDefinition } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const brandLight: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F4F6FB',
    surface: '#FFFFFF',
    'surface-bright': '#FFFFFF',
    'surface-variant': '#E8ECF7',
    'on-surface-variant': '#3B4256',
    primary: '#3D5AFE',
    secondary: '#00B8A9',
    accent: '#7C4DFF',
    error: '#D93025',
    info: '#0B72E7',
    success: '#0F9D58',
    warning: '#F09300',
  },
}

const brandDark: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0E1220',
    surface: '#161B2E',
    'surface-bright': '#1E2540',
    'surface-variant': '#232B47',
    'on-surface-variant': '#C4CBE0',
    primary: '#7C8CFF',
    secondary: '#2BD9C7',
    accent: '#B08CFF',
    error: '#FF6B6B',
    info: '#5AB0FF',
    success: '#49D68A',
    warning: '#FFB74D',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'brandLight',
    themes: { brandLight, brandDark },
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  defaults: {
    VCard: { rounded: 'xl', elevation: 0, border: true },
    VBtn: { rounded: 'lg', class: 'text-none font-weight-medium' },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VAutocomplete: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VNumberInput: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VChip: { rounded: 'lg' },
  },
})
