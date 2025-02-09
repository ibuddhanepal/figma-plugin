import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { getAliasValue } from '../getAliasValue';
import { SingleToken } from '@/types/tokens';

describe('getAliasValue', () => {
  const allTokens = [
    {
      name: 'colors.hex',
      input: '#ff0000',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.rgba',
      input: 'rgba(0, 255, 0, 0.5)',
      value: '#00ff0080',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.rgbaalias',
      input: 'rgba($colors.hex, 0.5)',
      value: '#ff000080',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.lightness_base',
      input: '25',
      value: 25,
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.lightness',
      input: '$colors.lightness_base * 3.5 + 0.175',
      value: 87.675,
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.hsla_1',
      input: 'hsl(172,50%,{colors.lightness_base}%)',
      value: '#206057',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.hsla_2',
      input: 'hsl(172,50%,{colors.lightness}%)',
      value: '#d0efeb',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.hsla_3',
      input: 'hsla(172,50%,{colors.lightness}%, 0.5)',
      value: '#d0efeb80',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.light-extension',
      input: '#ff0000',
      value: '#ffdbd2',
      type: TokenTypes.COLOR,
      $extensions: {
        'studio.tokens': {
          modify: {
            type: 'lighten',
            value: '0.5',
            space: 'sRGB',
          },
        },
      },
    },
    {
      name: 'colors.mix-extension',
      input: '#ff2277',
      value: '#ff1445',
      type: TokenTypes.COLOR,
      $extensions: {
        'studio.tokens': {
          modify: {
            color: '{colors.hex}',
            type: 'mix',
            value: '0.5',
            space: 'sRGB',
          },
        },
      },
    },
    {
      name: 'alias.complex',
      input: '$base.scale * $base.ratio ^ round((200 + 400 - $base.index) / 100)',
      value: 8,
    },
    {
      name: 'alias.round2',
      input: '$alias.complex + $alias.complex * ((1100 - 400) / 100)',
      value: 64,
    },
    {
      name: 'alias.round3',
      input: '$alias.round2 * 1.5',
      value: 96,
    },
    {
      name: 'colors.zero',
      input: 0,
      value: 0,
      type: TokenTypes.COLOR,
    },
    {
      name: 'base.scale',
      input: '2',
      value: 2,
    },
    {
      name: 'base.ratio',
      input: '2',
      value: 2,
    },
    {
      name: 'base.index',
      input: '400',
      value: 400,
    },
    {
      name: 'alias.cantresolve',
      input: 'rgba({notexisting}, 1)',
      value: 'rgba({notexisting}, 1)',
      type: TokenTypes.COLOR,
    },
    {
      name: 'alias.cantresolveopacity',
      input: 'rgba(255, 255, 0, {notexisting})',
      value: 'rgba(255, 255, 0, {notexisting})',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.the one with spaces',
      input: '#ff0000',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.aliasspaces',
      input: '{colors.the one with spaces}',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.foo',
      input: '#ff0000',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.deep',
      input: '{colors.foo}',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.aliasdeep',
      input: '{colors.deep}',
      value: '#ff0000',
      type: TokenTypes.COLOR,
    },
    {
      name: 'colors.aliasdeep-without-endtag',
      input: '{colors.deep',
      value: '{colors.deep',
      type: TokenTypes.COLOR,
    },
    {
      name: 'shadow',
      input: {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      value: {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      type: TokenTypes.BOX_SHADOW,
    },
    {
      name: 'shadowalias',
      input: '{shadow}',
      value: {
        x: '16',
        y: '16',
        blur: '16',
        spread: '0',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      },
      type: TokenTypes.BOX_SHADOW,

    },
    {
      name: 'type',
      input: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '18',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '18',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      type: TokenTypes.TYPOGRAPHY,
    },
    {
      name: 'size.6',
      type: TokenTypes.SIZING,
      value: 2,
      input: 2,
    },
    {
      name: 'size.alias',
      type: TokenTypes.SIZING,
      value: 2,
      input: '{size.6}',
    },
    {
      name: 'color.slate.50',
      type: TokenTypes.COLOR,
      value: '#f8fafc',
      input: '#f8fafc',
    },
    {
      name: 'color.alias',
      type: TokenTypes.COLOR,
      value: '#f8fafc',
      input: '{color.slate.50}',
    },
    {
      name: 'border-radius.0',
      type: TokenTypes.BORDER_RADIUS,
      value: '64px',
      input: '64px',
    },
    {
      name: 'border-radius.alias',
      type: TokenTypes.BORDER_RADIUS,
      value: '64px',
      input: '{border-radius.0}',
    },
    {
      name: 'opacity.10',
      type: TokenTypes.OPACITY,
      value: '10%',
      input: '10%',
    },
    {
      name: 'opacity.alias',
      type: TokenTypes.OPACITY,
      input: '{opacity.10}',
      value: '10%',
    },
    {
      name: 'typography.headlines.small',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      input: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
    },
    {
      name: 'typography.alias',
      type: TokenTypes.TYPOGRAPHY,
      value: {
        fontFamily: 'Inter',
        fontWeight: 'Regular',
        lineHeight: 'AUTO',
        fontSize: '14',
        letterSpacing: '0%',
        paragraphSpacing: '0',
        textDecoration: 'none',
        textCase: 'none',
      },
      input: '{typography.headlines.small}',
    },
    {
      name: 'font-family.serif',
      type: TokenTypes.FONT_FAMILIES,
      value: 'IBM Plex Serif',
      input: 'IBM Plex Serif',
    },
    {
      name: 'font-family.alias',
      type: TokenTypes.FONT_FAMILIES,
      input: '{font-family.serif}',
      value: 'IBM Plex Serif',
    },
    {
      name: 'line-height.1',
      type: TokenTypes.LINE_HEIGHTS,
      value: '130%',
      input: '130%',
    },
    {
      name: 'line-height.alias',
      type: TokenTypes.LINE_HEIGHTS,
      value: '130%',
      input: '{line-height.1}',
    },
    {
      name: 'boxshadow.regular',
      type: TokenTypes.BOX_SHADOW,
      value: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#0000ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
      input: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#0000ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
    },
    {
      name: 'boxshadow.alias',
      type: TokenTypes.BOX_SHADOW,
      value: [{
        x: '2',
        y: '2',
        blur: '2',
        spread: '2',
        color: '#000000',
        type: BoxShadowTypes.DROP_SHADOW,
      }, {
        x: '3',
        y: '3',
        blur: '3',
        spread: '3',
        color: '#0000ff',
        type: BoxShadowTypes.INNER_SHADOW,
      }],
      input: '{boxshadow.regular}',
    },
    {
      name: 'font-weight.regular',
      type: TokenTypes.FONT_WEIGHTS,
      value: 'Regular',
      input: 'Regular',
    },
    {
      name: 'font-weight.alias',
      type: TokenTypes.FONT_WEIGHTS,
      value: 'Regular',
      input: '{font-weight.regular}',
    },
    {
      name: 'font-style.normal',
      type: TokenTypes.OTHER,
      value: 'normal',
      input: 'normal',
    },
    {
      name: 'font-style.alias',
      type: TokenTypes.OTHER,
      value: 'normal',
      input: '{font-style.normal}',
    },
    {
      name: 'other.true',
      type: TokenTypes.OTHER,
      value: 'true',
      input: 'true',
    },
    {
      name: 'other-true.alias',
      type: TokenTypes.OTHER,
      value: 'true',
      input: '{other.true}',
    },
    {
      name: 'other.false',
      type: TokenTypes.OTHER,
      value: 'false',
      input: 'false',
    },
    {
      name: 'other-false.alias',
      type: TokenTypes.OTHER,
      value: 'false',
      input: '{other.false}',
    },
    {
      name: 'border-token',
      input: {
        color: '#ffffff',
        width: '10px',
        style: 'solid',
      },
      value: {
        color: '#ffffff',
        width: '10px',
        style: 'solid',
      },
      type: TokenTypes.BORDER,
    },
    {
      name: 'border-alias',
      input: '{border-token}',
      value: {
        color: '#ffffff',
        width: '10px',
        style: 'solid',
      },
      type: TokenTypes.BORDER,
    },
    {
      name: 'clamped', input: 'clamped($xx,2,4)', value: 2, type: TokenTypes.DIMENSION,
    },
    {
      name: 'clamp', input: 'clamp($xx,2,4)', value: 'clamp(1,2,4)', type: TokenTypes.DIMENSION,
    },
    {
      name: 'xx',
      input: '1',
      value: 1,
      type: TokenTypes.DIMENSION,
    },
    {
      name: 'yy',
      input: '0.2',
      value: 0.2,
      type: TokenTypes.DIMENSION,
    },
    {
      // Note that we cannot do {sample(cubicBezier1D($yy,$yy),$yy)}px to inject px values, it must have a semantic intermediary as shown in the following
      name: 'cubicSample', input: 'sample(cubicBezier1D($yy,$yy),$yy)', value: 0.104, type: TokenTypes.DIMENSION,
    },
    {
      name: 'cubicSamplePx', input: '{cubicSample}px', value: '0.104px', type: TokenTypes.DIMENSION,
    },
  ];

  allTokens.forEach((token) => {
    it(`alias ${token.name}`, () => {
      // @TODO check this test typing,
      expect(getAliasValue({ ...token, value: token.input, type: token.type } as SingleToken, allTokens as unknown as SingleToken[], false)).toEqual(token.value);
    });
  });
});
