import { renderHook } from '@testing-library/react-hooks';
import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { usePropertiesForTokenType } from './usePropertiesForType';

describe('usePropertiesForTokenType', () => {
  const testData = [
    {
      type: 'other',
      output: [],
    },
    {
      type: 'color',
      output: [
        {
          label: 'Fill',
          name: Properties.fill,
        },
        {
          label: 'Border',
          name: Properties.border,
        },
      ],
    },
    {
      type: 'borderRadius',
      output: [
        {
          label: 'All',
          name: Properties.borderRadius,
          clear: [
            Properties.borderRadiusTopLeft,
            Properties.borderRadiusTopRight,
            Properties.borderRadiusBottomRight,
            Properties.borderRadiusBottomLeft,
          ],
        },
        { label: 'Top Left', name: Properties.borderRadiusTopLeft },
        { label: 'Top Right', name: Properties.borderRadiusTopRight },
        { label: 'Bottom Right', name: Properties.borderRadiusBottomRight },
        { label: 'Bottom Left', name: Properties.borderRadiusBottomLeft },
      ],
    },
    {
      type: 'sizing',
      output: [
        {
          label: 'All',
          name: Properties.sizing,
          clear: [Properties.width, Properties.height],
        },
        { label: 'Width', name: Properties.width },
        { label: 'Height', name: Properties.height },
      ],
    },
    {
      type: 'spacing',
      output: [
        { label: 'Gap', name: Properties.itemSpacing, icon: 'Gap' },
        {
          label: 'All',
          icon: 'Spacing',
          name: Properties.spacing,
          clear: [
            Properties.horizontalPadding,
            Properties.verticalPadding,
            Properties.itemSpacing,
            Properties.paddingLeft,
            Properties.paddingRight,
            Properties.paddingTop,
            Properties.paddingBottom,
          ],
        },
        { label: 'Top', name: Properties.paddingTop },
        { label: 'Right', name: Properties.paddingRight },
        { label: 'Bottom', name: Properties.paddingBottom },
        { label: 'Left', name: Properties.paddingLeft },
      ],
    },
    {
      type: 'text',
      output: [],
    },
    {
      type: 'typography',
      output: [
        {
          name: 'typography',
          label: 'typography',
        },
      ],
    },
    {
      type: 'opacity',
      output: [
        {
          name: 'opacity',
          label: 'opacity',
        },
      ],
    },
    {
      type: 'borderWidth',
      output: [
        {
          label: 'All',
          name: Properties.borderWidth,
          clear: [
            Properties.borderWidthTop,
            Properties.borderWidthRight,
            Properties.borderWidthBottom,
            Properties.borderWidthLeft,
          ],
        },
        { label: 'Top', name: Properties.borderWidthTop },
        { label: 'Right', name: Properties.borderWidthRight },
        { label: 'Bottom', name: Properties.borderWidthBottom },
        { label: 'Left', name: Properties.borderWidthLeft },
      ],
    },
    {
      type: 'boxShadow',
      output: [
        {
          name: 'boxShadow',
          label: 'boxShadow',
        },
      ],
    },
    {
      type: 'fontFamilies',
      output: [
        {
          name: 'fontFamilies',
          label: 'fontFamilies',
        },
      ],
    },
    {
      type: 'fontWeights',
      output: [
        {
          name: 'fontWeights',
          label: 'fontWeights',
        },
      ],
    },
    {
      type: 'lineHeights',
      output: [
        {
          name: 'lineHeights',
          label: 'lineHeights',
        },
      ],
    },
    {
      type: 'fontSizes',
      output: [
        {
          name: 'fontSizes',
          label: 'fontSizes',
        },
      ],
    },
    {
      type: 'letterSpacing',
      output: [
        {
          name: 'letterSpacing',
          label: 'letterSpacing',
        },
      ],
    },
    {
      type: 'paragraphSpacing',
      output: [
        {
          name: 'paragraphSpacing',
          label: 'paragraphSpacing',
        },
      ],
    },
    {
      type: 'textDecoration',
      output: [
        {
          name: 'textDecoration',
          label: 'textDecoration',
        },
      ],
    },
    {
      type: 'textCase',
      output: [
        {
          name: 'textCase',
          label: 'textCase',
        },
      ],
    },
    {
      type: 'composition',
      output: [
        {
          name: 'composition',
          label: 'composition',
        },
      ],
    },
  ];
  it('should return default property', () => {
    testData.forEach((data) => {
      const { result } = renderHook(() => usePropertiesForTokenType(data.type as TokenTypes));
      expect(result.current).toEqual(data.output);
    });
  });
});
