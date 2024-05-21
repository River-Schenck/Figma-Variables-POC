import { Color, VariableAlias, VariableValue } from './figma_types';

export function isColor(value: any): value is Color {
    return value && typeof value === 'object' && 'r' in value && 'g' in value && 'b' in value;
}

export function isVariableAlias(value: any): value is VariableAlias {
    return value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS';
}

