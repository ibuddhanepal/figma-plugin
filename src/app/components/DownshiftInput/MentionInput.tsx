import React, { useMemo } from 'react';
import Mentions from 'rc-mentions';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { isDocumentationType } from '@/utils/is/isDocumentationType';
import { Properties } from '@/constants/Properties';
import { SingleToken } from '@/types/tokens';
import { TokenTypes } from '@/constants/TokenTypes';
import { useReferenceTokenType } from '@/app/hooks/useReferenceTokenType';
import './mentions.css';
import {
  StyledItem, StyledItemColor, StyledItemColorDiv, StyledItemName, StyledItemValue, StyledPart,
} from './StyledDownshiftInput';

export interface SuggestionDataItem {
  id: string;
  display: string;
}

interface Props {
  autoFocus?: boolean;
  name?: string;
  type: string;
  value?: string;
  initialName?: string;
  placeholder?: string;
  resolvedTokens: ResolveTokenValuesResult[];
  handleChange: (property: string, value: string) => void;
  handleBlur?: () => void;
  handleOnFocus?: React.FocusEventHandler<HTMLTextAreaElement>
}

const { Option } = Mentions;

export default function MentionsInput({
  autoFocus = false,
  name = 'value',
  type,
  value,
  initialName,
  placeholder,
  resolvedTokens,
  handleChange,
  handleBlur,
  handleOnFocus,
}: Props) {
  const referenceTokenTypes = useReferenceTokenType(type as TokenTypes);

  const mentionData = useMemo<SuggestionDataItem[]>(() => {
    if (isDocumentationType(type as Properties)) {
      return resolvedTokens
        .filter((token: SingleToken) => token.name !== initialName).sort((a, b) => (
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        )).map((resolvedToken) => ({
          id: `${resolvedToken.name}}`,
          display: resolvedToken.name,
        }));
    }
    return resolvedTokens
      .filter((token: SingleToken) => referenceTokenTypes.includes(token?.type) && token.name !== initialName).sort((a, b) => (
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      )).map((resolvedToken) => ({
        id: `${resolvedToken.name}}`,
        display: resolvedToken.name,
      }));
  }, [initialName, resolvedTokens, referenceTokenTypes, type]);

  const handleMentionInputChange = React.useCallback((newValue: string) => {
    handleChange(name, newValue);
  }, [handleChange, name]);

  const handleInputBlur = React.useCallback(() => {
    if (handleBlur) {
      handleBlur();
    }
  }, [handleBlur]);

  const getHighlightedText = React.useCallback((text: string, highlight: string) => {
    // Split on highlight term and include term into parts, ignore case
    const parts = text.split(new RegExp(`(${highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <StyledPart key={i} matches={part.toLowerCase() === highlight.toLowerCase()}>
            {part}
          </StyledPart>
        ))}
        {' '}
      </span>
    );
  }, []);

  const getResolveValue = React.useCallback((token: SingleToken) => {
    let returnValue: string = '';
    if (token.type === TokenTypes.TYPOGRAPHY || token.type === TokenTypes.BOX_SHADOW) {
      if (Array.isArray(token.value)) {
        returnValue = token.value.reduce<string>((totalAcc, item) => {
          const singleReturnValue = Object.entries(item).reduce<string>((acc, [, propertyValue]) => (
            `${acc}${propertyValue.toString()}/`
          ), '');
          return `${totalAcc}${singleReturnValue},`;
        }, '');
      } else {
        returnValue = Object.entries(token.value).reduce<string>((acc, [, propertyValue]) => (
          `${acc}${propertyValue.toString()}/`
        ), '');
      }
    } else if (token.type === TokenTypes.COMPOSITION) {
      returnValue = Object.entries(token.value).reduce<string>((acc, [property, value]) => (
        `${acc}${property}:${value}`
      ), '');
    } else if (typeof token.value === 'string' || typeof token.value === 'number') {
      returnValue = token.value;
    }
    return returnValue;
  }, []);

  const renderMentionListItem = React.useCallback((
    suggestion: SuggestionDataItem,
  ) => {
    const resolvedToken = resolvedTokens.find((token) => referenceTokenTypes.includes(token?.type) && token.name === suggestion.display);
    return (
      <Option
        key={(suggestion.id as string) || 'not-found'}
        value={suggestion.id as string}
        className="mentions-item"
      >
        <StyledItem
          className="dropdown-item"
        >
          {type === 'color' && (
          <StyledItemColorDiv>
            <StyledItemColor style={{ backgroundColor: resolvedToken?.value.toString() }} />
          </StyledItemColorDiv>
          )}
          <StyledItemName css={{ flexGrow: '1' }}>{getHighlightedText(resolvedToken?.name ?? '', value || '')}</StyledItemName>
          {
            resolvedToken && <StyledItemValue>{getResolveValue(resolvedToken)}</StyledItemValue>
          }
        </StyledItem>
      </Option>
    );
  }, [resolvedTokens, type, getHighlightedText, referenceTokenTypes, value, getResolveValue]);

  return (
    <Mentions
      autoSize
      name={name}
      value={value}
      placeholder={placeholder}
      prefix={['{']}
      placement="bottom"
      autoFocus={autoFocus}
      onChange={handleMentionInputChange}
      onBlur={handleInputBlur}
      onFocus={handleOnFocus}
      data-testid={`mention-input-${name}`}
      data-cy={`mention-input-${name}`}
    >
      {mentionData.map((item) => (
        renderMentionListItem(item)
      ))}
    </Mentions>
  );
}
