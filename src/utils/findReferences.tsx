import { AliasDollarRegex, AliasRegex } from '@/constants/AliasRegex';

export const findReferences = (tokenValue: string) => {
  const match = AliasRegex.exec(tokenValue);
  return match && (match[1] || match[2]);
};

export const findDollarReferences = (tokenValue: string) => tokenValue?.toString().match(AliasDollarRegex);

export const findMatchingReferences = (tokenValue: string, valueToLookFor: string) => {
  const reference = findReferences(tokenValue);
  if (reference === valueToLookFor) {
    return [`{${valueToLookFor}}`];
  }
  return [];
};
export const replaceReferences = (tokenValue: string, oldName: string, newName: string) => {
  try {
    if (tokenValue.includes(oldName)) {
      const references = findMatchingReferences(tokenValue, oldName);
      let newValue = tokenValue;
      references.forEach((reference) => {
        newValue = newValue.replace(reference, `{${newName}}`);
      });
      return newValue;
    }
  } catch (e) {
    console.log('Error replacing reference', tokenValue, oldName, newName, e);
  }

  return tokenValue;
};

export const getRootReferences = (tokenValue: string) => {
  const array = [];
  let depth = 0;
  let startIndex = 0;
  for (let i = 0; i < tokenValue.length; i += 1) {
    if (tokenValue[i] === '{') {
      if (depth === 0) {
        startIndex = i;
      }
      depth += 1;
    }
    if (tokenValue[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        array.push(tokenValue.substring(startIndex, i + 1));
      }
    }
  }

  const tokenDollarReferences = findDollarReferences(tokenValue) ?? [];
  array.push(...tokenDollarReferences);
  return array;
};
