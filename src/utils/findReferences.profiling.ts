/* eslint-disable */
// @ts-nocheck
import { findMatchingReferences  } from './findReferences';
// evaluates tokens such as $foo or {foo}
console.profile();

const AliasRegex = /(\$[^\s,]+\w)|({([^}]*)})/g;

export const findReferencesOld = (tokenValue: string) => tokenValue?.toString().match(AliasRegex);

export const findMatchingReferencesOld = (tokenValue: string, valueToLookFor: string) => {
  const references = findReferencesOld(tokenValue);

  if (references) {
    return references.filter((ref) => {
      const name = ref.startsWith('{') ? ref.slice(1, ref.length - 1) : ref.substring(1);
      if (name === valueToLookFor) return ref;
      return false;
    });
  }
  return [];
};


function bruteForce(func) {
  for (let i = 0, c = 1000000; i < c; i += 1) {
    func();
  }
}
console.time();
bruteForce(() => {
  findMatchingReferencesOld('{peer-1}','peer-1');
  findMatchingReferencesOld('$peer1','peer1');
});
console.log(console.timeEnd())
console.time();
bruteForce(() => {
  findMatchingReferences('{peer-1}','peer-1');
  findMatchingReferences('$peer1','peer1');
});
console.log(console.timeEnd())

console.profileEnd();
