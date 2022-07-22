import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList, SingleToken } from '@/types/tokens';
import { isSingleBoxShadowToken, isSingleTokenValueObject, isSingleTypographyToken } from './is';
import { isTokenGroupWithType } from './is/isTokenGroupWithType';

type Tokens = AnyTokenList | Partial<Record<string, Partial<Record<TokenTypes, Record<string, SingleToken<false>>>>> | { type: string } | { inheritType: string }>;

// @TODO fix typings
function checkForTokens({
  obj,
  token,
  root = null,
  returnValuesOnly = false,
  expandTypography = false,
  expandShadow = false,
  inheritType,
  groupLevel = 0,
  currentTypeLevel = 0,
}: {
  obj: SingleToken<true>[]
  token: Tokens
  root: string | null
  returnValuesOnly?: boolean
  expandTypography?: boolean
  expandShadow?: boolean
  inheritType?: string
  groupLevel?: number;
  currentTypeLevel?: number;
}): [SingleToken[], SingleToken | undefined] {
  // replaces / in token name
  let returnValue: Pick<SingleToken<false>, 'name' | 'value'> | {
    type: TokenTypes;
    value: Record<string, SingleToken['value']>;
    description?: string;
  } | undefined;
  const shouldExpandTypography = (expandTypography && 'value' in token) ? isSingleTypographyToken(token.value) : false;
  const shouldExpandShadow = (expandShadow && 'value' in token) ? isSingleBoxShadowToken(token.value) : false;
  if (isSingleTokenValueObject(token) && !shouldExpandTypography && !shouldExpandShadow) {
    returnValue = {
      ...token,
      ...(('type' in token) ? { } : { type: inheritType, inheritType, inheritTypeLevel: currentTypeLevel }),
    };
  } else if (
    (isSingleTypographyToken(token) && !expandTypography)
    || (isSingleBoxShadowToken(token) && !expandShadow)
  ) {
    returnValue = {
      type: token.type,
      value: Object.entries(token).reduce<Record<string, SingleToken['value']>>((acc, [key, val]) => {
        acc[key] = isSingleTokenValueObject(val) && returnValuesOnly ? val.value : val;
        return acc;
      }, {}),
    };

    if (token.description) {
      delete returnValue.value.description;
      returnValue.description = token.description;
    }
  } else if (typeof token === 'object') {
    let tokenToCheck = token;
    if (!isSingleTokenValueObject(token)) {
      groupLevel = groupLevel + 1;
    }
    if (isTokenGroupWithType(token)) {
      const { type, ...tokenValues } = token;
      inheritType = token.type;
      currentTypeLevel = groupLevel;
      tokenToCheck = tokenValues as Tokens;
    }
    if (isSingleTokenValueObject(token) && typeof token.value !== 'string') {
      tokenToCheck = token.value as typeof tokenToCheck;
    }
    Object.entries(tokenToCheck).forEach(([key, value]) => {
      const [, result] = checkForTokens({
        obj,
        token: value,
        root: [root, key].filter((n) => n).join('.'),
        returnValuesOnly,
        expandTypography,
        expandShadow,
        inheritType,
        groupLevel,
        currentTypeLevel,
      });
      if (root && result) {
        obj.push({ ...result, name: [root, key].join('.') });
      } else if (result) {
        obj.push({ ...result, name: key });
      }
    });
  } else {
    returnValue = {
      value: token,
    };
  }

  if (typeof returnValue === 'object' && 'name' in returnValue && returnValue?.name) {
    returnValue.name = returnValue.name.split('/').join('.');
  }

  return [obj, returnValue as SingleToken | undefined];
}

export default function convertToTokenArray({
  tokens, returnValuesOnly = false, expandTypography = false, expandShadow = false,
}: {
  tokens: Tokens
  returnValuesOnly?: boolean
  expandTypography?: boolean
  expandShadow?: boolean
}) {
  console.log('tokens', tokens);
  const [result] = checkForTokens({
    obj: [], root: null, token: tokens, returnValuesOnly, expandTypography, expandShadow,
  });
  return Object.values(result);
}
