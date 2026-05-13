import { Component, ComponentFile } from '../types';

export const STARTER_PROJECT_ID = 'starter-project-null';

export const getStarterFile = (): ComponentFile => ({
  id: STARTER_PROJECT_ID,
  name: 'Blank Suite',
  type: 'suite',
  createdAt: Date.now(),
  designSystem: {
    id: 'ds-blank',
    name: 'Default',
    tokens: {
      primaryColor: '#000000',
      surfaceColor: '#ffffff',
      textColor: '#000000',
      fontDisplay: 'Inter',
      fontBody: 'Inter',
      radiusScale: 'soft',
      motionPreset: 'fluid'
    }
  }
});

export const getStarterComponents = (): Component[] => [];
