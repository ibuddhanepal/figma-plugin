import { DesignTokensMap, TokenLibrary } from 'figma-tokens-library';
import { Properties } from './constants/Properties';
import { TokenTypes } from './constants/TokenTypes';
import {
  TokenBoxshadowValue, TokenTextCaseValue, TokenTextDecorationValue, TokenTypographyValue,
} from './types/values';

export type TokenTypeMap = {
  [TokenTypes.COLOR]: string;
  [TokenTypes.BORDER_RADIUS]: string;
  [TokenTypes.TEXT]: string;
  [TokenTypes.TYPOGRAPHY]: string | TokenTypographyValue;
  [TokenTypes.OPACITY]: string;
  [TokenTypes.BORDER_WIDTH]: string;
  [TokenTypes.BOX_SHADOW]: string | TokenBoxshadowValue | TokenBoxshadowValue[]
  [TokenTypes.FONT_FAMILIES]: string;
  [TokenTypes.FONT_WEIGHTS]: string;
  [TokenTypes.LINE_HEIGHTS]: string;
  [TokenTypes.LETTER_SPACING]: string;
  [TokenTypes.FONT_SIZES]: string;
  [TokenTypes.PARAGRAPH_SPACING]: string;
  [TokenTypes.TEXT_DECORATION]: string | TokenTextDecorationValue;
  [TokenTypes.TEXT_CASE]: string | TokenTextCaseValue;
  [TokenTypes.SPACING]: string;
  [TokenTypes.OTHER]: string;
  [TokenTypes.SIZING]: string;
  [TokenTypes.COMPOSITION]: Partial<
  Record<TokenTypes | Properties, TokenTypeMap[Exclude<keyof TokenTypeMap, TokenTypes.COMPOSITION>]>
  >;
};

export type TokenExtensions = Record<string, unknown>;

export const tokensLibrary = new TokenLibrary<
TokenTypes,
TokenTypeMap,
TokenExtensions,
DesignTokensMap<TokenTypeMap, Record<string, unknown>>
>({
});
