import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { InternalTokenFlatmapValue, useTokenLibrary } from 'figma-tokens-library';
import { TokenGroupHeading } from './TokenGroupHeading';
import { StyledTokenGroup, StyledTokenGroupItems } from './StyledTokenGroup';
import { TokenButton } from '@/app/components/TokenButton';
import { displayTypeSelector } from '@/selectors';
import { SingleToken, TokenTypeSchema } from '@/types/tokens';
import { collapsedTokensSelector } from '@/selectors/collapsedTokensSelector';
import { ShowFormOptions, ShowNewFormOptions } from '@/types';
import { TokenExtensions, tokensLibrary, TokenTypeMap } from '@/tokensLibrary';
import { TokenTypes } from '@/constants/TokenTypes';
import { filterIterator } from '@/utils/filterIterator';

type Props = {
  schema: TokenTypeSchema;
  value: InternalTokenFlatmapValue<TokenTypes, TokenTypeMap, TokenTypes, TokenExtensions>;
  showNewForm: (opts: ShowNewFormOptions) => void;
  showForm: (opts: ShowFormOptions) => void;
};

const TokenGroup: React.FC<Props> = ({
  value, showNewForm, showForm, schema,
}) => {
  const collapsed = useSelector(collapsedTokensSelector);
  const displayType = useSelector(displayTypeSelector);
  const isCollapsed = useMemo(() => (
    false
    // @TODO - make this ID based
    // !collapsed.some((parentKey) => (
    //   value.$_parent?.startsWith(parentKey)
    // ))
  ), [value, collapsed]);
  const subtokens = useTokenLibrary(
    tokensLibrary,
    useCallback((mutations, library) => (
      filterIterator(library.flatmap.values(), ({ value: groupOrToken }) => (
        groupOrToken.$parent.value === value.$id
      ))
    ), [value]),
    useCallback((mutations) => (
      !mutations || mutations.some((m) => (
        m.tokens?.from?.$id === value.$id
        || m.tokens?.from?.$parent.value === value.$id
        || m.tokens?.to?.$id === value.$id
        || m.tokens?.to?.$parent.value === value.$id
      ))
    ), [value]),
  );

  const [draggedToken, setDraggedToken] = useState<SingleToken | null>(null);
  const [dragOverToken, setDragOverToken] = useState<SingleToken | null>(null);

  if (isCollapsed) {
    return null;
  }

  return (
    <StyledTokenGroup displayType={displayType}>
      {subtokens.map((item) => (
        <React.Fragment key={item.$revision.value}>
          {item.$objtype === 'group' ? (
            // Need to add class to self-reference in css traversal
            <StyledTokenGroupItems className="property-wrapper" data-cy={`token-group-${item.$id}`}>
              <TokenGroupHeading showNewForm={showNewForm} label={item.$name.value} path={item.$id} id="listing" type={schema.type} />
              {/* <TokenGroup
                tokenValues={item.value}
                showNewForm={showNewForm}
                showForm={showForm}
                schema={schema}
                path={item.stringPath}
              /> */}
            </StyledTokenGroupItems>
          ) : (
            null
            // <TokenButton
            //   type={schema.type}
            //   token={item.value}
            //   showForm={showForm}
            //   draggedToken={draggedToken}
            //   dragOverToken={dragOverToken}
            //   setDraggedToken={setDraggedToken}
            //   setDragOverToken={setDragOverToken}
            // />
          )}
        </React.Fragment>
      ))}
    </StyledTokenGroup>
  );
};

export default React.memo(TokenGroup);
