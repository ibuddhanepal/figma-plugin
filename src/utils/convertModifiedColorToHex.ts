import chroma from 'chroma-js';
import Color from 'colorjs.io';
import { ColorModifierTypes } from '@/constants/ColorModifierTypes';
import { ColorModifier } from '@/types/Modifier';

export function convertModifiedColorToHex(baseColor: string, modifier: ColorModifier) {
  try {
    switch (modifier.type) {
      case ColorModifierTypes.LIGHTEN:
        return chroma(baseColor).brighten(Number(modifier.value)).hex();
        // return new Color(baseColor).lighten(Number(modifier.value)).toString({ format: 'hex' });
      case ColorModifierTypes.DARKEN:
        return chroma(baseColor).darken(Number(modifier.value)).hex();
        // return new Color(baseColor).darken(Number(modifier.value)).toString({ format: 'hex' });
      case ColorModifierTypes.MIX:
        return chroma(baseColor).mix(modifier.color, Number(modifier.value)).hex();
        // return new Color(new Color(baseColor).mix(new Color(modifier.color), Number(modifier.value), { outputSpace: 'sRGB' }).toString()).toString({ format: 'hex' });
      case ColorModifierTypes.ALPHA:
        return chroma(baseColor).alpha(Number(modifier.value)).hex();
        // eslint-disable-next-line no-case-declarations
        // const newColor = new Color(baseColor);
        // newColor.alpha = Number(modifier.value);
        // return newColor.toString({ format: 'hex' });
      default:
        return chroma(baseColor).hex();
        // return new Color(baseColor).toString({ format: 'hex' });
    }
  } catch (e) {
    return baseColor;
  }
}
