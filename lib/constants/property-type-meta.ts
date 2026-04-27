import { HouseIcon, UsersIcon } from 'phosphor-react-native';
import type { ComponentType } from 'react';
import type { PropertyType } from '../../types/property';

export interface PropertyTypeMeta {
  value: PropertyType;
  shortLabel: string;
  longLabel: string;
  description: string;
  Icon: ComponentType<{ size: number; color: string; weight?: any }>;
  iconColor: string;
  iconBg: string;
  unitLabel: string;
  unitLabelPlural: string;
  slotLabel: string;
  slotLabelPlural: string;
}

/** Minimal color shape required to compute a meta entry. `THEME.light` /
 *  `THEME.dark` from `lib/theme.ts` satisfy this. */
type ColorTokens = {
  info: string;
  infoBg: string;
  success: string;
  successBg: string;
};

export function getPropertyTypeMeta(
  type: string,
  colors: ColorTokens,
): PropertyTypeMeta {
  if (type === 'FLAT') {
    return {
      value: 'FLAT',
      shortLabel: 'Flat',
      longLabel: 'Flat / Apartment',
      description: 'Rent the whole unit to a single tenant or group.',
      Icon: HouseIcon,
      iconColor: colors.info,
      iconBg: colors.infoBg,
      unitLabel: 'Flat',
      unitLabelPlural: 'Flats',
      slotLabel: 'Room',
      slotLabelPlural: 'Rooms',
    };
  }
  return {
    value: 'PG',
    shortLabel: 'PG',
    longLabel: 'PG (Paying Guest)',
    description: 'Rent individual beds or member slots to multiple tenants.',
    Icon: UsersIcon,
    iconColor: colors.success,
    iconBg: colors.successBg,
    unitLabel: 'Room',
    unitLabelPlural: 'Rooms',
    slotLabel: 'Bed',
    slotLabelPlural: 'Beds',
  };
}

export function getAllPropertyTypeMeta(colors: ColorTokens): PropertyTypeMeta[] {
  return [getPropertyTypeMeta('PG', colors), getPropertyTypeMeta('FLAT', colors)];
}

/** Just the text labels — no colors needed. Cheaper for components that
 *  only render copy ("Add Bed", "Room 101", etc.). */
export interface PropertyTypeLabels {
  unitLabel: string;          // "Room" | "Flat"
  unitLabelPlural: string;    // "Rooms" | "Flats"
  slotLabel: string;          // "Bed" | "Room"
  slotLabelPlural: string;    // "Beds" | "Rooms"
  shortLabel: string;         // "PG" | "Flat"
}

export function getPropertyTypeLabels(type: string | undefined): PropertyTypeLabels {
  if (type === 'FLAT') {
    return {
      unitLabel: 'Flat',  unitLabelPlural: 'Flats',
      slotLabel: 'Room',  slotLabelPlural: 'Rooms',
      shortLabel: 'Flat',
    };
  }
  // Default to PG semantics — they're the more granular labels
  return {
    unitLabel: 'Room',  unitLabelPlural: 'Rooms',
    slotLabel: 'Bed',   slotLabelPlural: 'Beds',
    shortLabel: 'PG',
  };
}
