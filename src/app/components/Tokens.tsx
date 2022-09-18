/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useTokenLibrary } from 'figma-tokens-library';
import tokenTypes from '../../config/tokenType.defs.json';
// import { mergeTokenGroups, resolveTokenValues } from '@/plugin/tokenHelpers';
import TokensBottomBar from './TokensBottomBar';
import ToggleEmptyButton from './ToggleEmptyButton';
import { Dispatch } from '../store';
import TokenSetSelector from './TokenSetSelector';
import TokenFilter from './TokenFilter';
import Box from './Box';
import IconButton from './IconButton';
import IconListing from '@/icons/listing.svg';
import IconJSON from '@/icons/json.svg';
import useConfirm from '../hooks/useConfirm';
import { track } from '@/utils/analytics';
import AttentionIcon from '@/icons/attention.svg';
import {
  activeTokenSetSelector, manageThemesModalOpenSelector, scrollPositionSetSelector, tokenTypeSelector, updateModeSelector,
} from '@/selectors';
import { ThemeSelector } from './ThemeSelector';
import IconToggleableDisclosure from '@/app/components/IconToggleableDisclosure';
import { styled } from '@/stitches.config';
import { ManageThemesModal } from './ManageThemesModal';
// import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UpdateMode } from '@/constants/UpdateMode';
import { tokensLibrary } from '@/tokensLibrary';
import TokenListing from './TokenListing';
import { filterIterator } from '@/utils/filterIterator';

const StyledButton = styled('button', {
  '&:focus, &:hover': {
    boxShadow: 'none',
    background: '$bgSubtle',
  },
});

const StatusToast = ({ open, error }: { open: boolean; error: string | null }) => {
  const [isOpen, setOpen] = React.useState(open);
  React.useEffect(() => {
    setOpen(open);
  }, [open]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
          <Box
            css={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              padding: '$3',
            }}
          >
            <Box
              css={{
                background: '$dangerBg',
                color: '$onDanger',
                fontSize: '$xsmall',
                fontWeight: '$bold',
                padding: '$3 $4',
                paddingLeft: 0,
                boxShadow: '$contextMenu',
                borderRadius: '$contextMenu',
                display: 'flex',
                gap: '$2',
                width: '100%',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                wordBreak: 'break-word',
              }}
            >
              <Box css={{ flexShrink: 0 }}>
                <AttentionIcon />
              </Box>
              {error}
            </Box>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

function Tokens({ isActive }: { isActive: boolean }) {
  const rootTokenGroups = useTokenLibrary(
    tokensLibrary,
    useCallback((mutations, library) => {
      const it = library.flatmap.values();
      return filterIterator(it, ({ value }) => (
        !value.$parent?.value
      ));
    }, []),
    useCallback((mutations) => (
      Boolean(
        !mutations // lack of mutations - means a new library was loaded
        || mutations.some((m) => (
          !m.tokens?.from?.$parent?.value
          || !m.tokens?.to?.$parent?.value
        )), // if any of the root groups was updated
      )
    ), []),
  );
  const rootTokenGroupsPerType = useMemo(() => (
    Object.entries(tokenTypes).map(([key, def]) => (
      [key, {
        ...def,
        groups: rootTokenGroups.filter((group) => (
          group.$type ? group.$type.value === key : key === 'other'
        )),
      }] as [string, typeof def & {
        groups: typeof rootTokenGroups
      }]
    ))
  ), [rootTokenGroups]);
  console.log(rootTokenGroupsPerType);

  const activeTokenSet = useSelector(activeTokenSetSelector);
  // const usedTokenSet = useSelector(usedTokenSetSelector);
  // const showEditForm = useSelector(showEditFormSelector);
  const manageThemesModalOpen = useSelector(manageThemesModalOpenSelector);
  const scrollPositionSet = useSelector(scrollPositionSetSelector);
  // const tokenFilter = useSelector(tokenFilterSelector);
  const dispatch = useDispatch<Dispatch>();
  const [activeTokensTab, setActiveTokensTab] = React.useState('list');
  const [tokenSetsVisible, setTokenSetsVisible] = React.useState(true);
  // const { getStringTokens } = useTokens();
  const tokenDiv = React.useRef<HTMLDivElement>(null);
  const updateMode = useSelector(updateModeSelector);
  const { confirm } = useConfirm();
  const shouldConfirm = React.useMemo(() => updateMode === UpdateMode.DOCUMENT, [updateMode]);

  React.useEffect(() => {
    if (tokenDiv.current) {
      tokenDiv.current.addEventListener('scroll', () => {}, false);
    }
  }, []);

  React.useEffect(() => {
    if (scrollPositionSet && tokenDiv.current && typeof tokenDiv.current.scrollTo === 'function') {
      tokenDiv.current.scrollTo(0, scrollPositionSet[activeTokenSet]);
    }
  }, [activeTokenSet]);

  // const resolvedTokens = React.useMemo(
  //   () => resolveTokenValues(mergeTokenGroups(tokens, {
  //     ...usedTokenSet,
  //     [activeTokenSet]: TokenSetStatus.ENABLED,
  //   })),
  //   [tokens, usedTokenSet, activeTokenSet],
  // );
  // const [stringTokens, setStringTokens] = React.useState(
  //   JSON.stringify(tokens[activeTokenSet], null, 2),
  // );
  const tokenType = useSelector(tokenTypeSelector);

  const [error, setError] = React.useState<string | null>(null);

  // const handleChangeJSON = React.useCallback((val: string) => {
  //   setError(null);
  //   try {
  //     const parsedTokens = parseJson(val);
  //     parseTokenValues(parsedTokens);
  //   } catch (e) {
  //     setError(`Unable to read JSON: ${JSON.stringify(e)}`);
  //   }
  //   // setStringTokens(val);
  // }, []);

  // const memoizedTokens = React.useMemo(() => {
  //   if (tokens[activeTokenSet]) {
  //     const mapped = mappedTokens(tokens[activeTokenSet], tokenFilter).sort((a, b) => {
  //       if (b[1].values) {
  //         return 1;
  //       }
  //       if (a[1].values) {
  //         return -1;
  //       }
  //       return 0;
  //     });
  //     return mapped.map(([key, { values, isPro, ...schema }]) => ({
  //       key,
  //       values,
  //       schema,
  //       isPro,
  //     }));
  //   }
  //   return [];
  // }, [tokens, activeTokenSet, tokenFilter]);

  const handleSaveJSON = React.useCallback(() => {
    // dispatch.tokenState.setJSONData(stringTokens);
  }, [dispatch.tokenState]);
  const handleToggleTokenSetsVisibility = React.useCallback(() => {
    setTokenSetsVisible(!tokenSetsVisible);
  }, [tokenSetsVisible]);

  const handleSetTokensTabToList = React.useCallback(() => {
    setActiveTokensTab('list');
  }, []);

  const handleSetTokensTabToJSON = React.useCallback(() => {
    setActiveTokensTab('json');
  }, []);

  const handleUpdate = React.useCallback(async () => {
    if (activeTokensTab === 'list') {
      track('Update Tokens');
      if (shouldConfirm) {
        confirm({
          text: 'Are you sure?',
          description:
            'You are about to run a document wide update. This operation can take more than 30 minutes on very large documents.',
        }).then((result) => {
          if (result && result.result) {
            dispatch.tokenState.updateDocument();
          }
        });
      } else {
        dispatch.tokenState.updateDocument();
      }
    } else {
      track('Update JSON');

      // dispatch.tokenState.setJSONData(stringTokens);
    }
  }, [confirm, shouldConfirm, dispatch.tokenState, activeTokensTab]);

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    setError(null);
    // setStringTokens(getStringTokens());
  }, [activeTokenSet, tokenType]);

  React.useEffect(() => {
    // @README these dependencies aren't exhaustive
    // because of specific logic requirements
    // if (getStringTokens() !== stringTokens) {
    //   dispatch.tokenState.setHasUnsavedChanges(true);
    // } else {
    //   dispatch.tokenState.setHasUnsavedChanges(false);
    // }
  }, [dispatch, activeTokenSet]);

  const saveScrollPositionSet = React.useCallback((tokenSet: string) => {
    if (tokenDiv.current) {
      dispatch.uiState.setScrollPositionSet({ ...scrollPositionSet, [tokenSet]: tokenDiv.current?.scrollTop });
    }
  }, [dispatch, scrollPositionSet]);

  if (!isActive) return null;

  return (
    <Box
      css={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        css={{
          display: 'flex',
          flexDirection: 'row',
          gap: '$2',
          borderBottom: '1px solid',
          borderColor: '$borderMuted',
        }}
      >
        <Box>
          <StyledButton style={{ height: '100%' }} type="button" onClick={handleToggleTokenSetsVisibility}>
            <Box
              css={{
                fontWeight: '$bold',
                height: '100%',
                fontSize: '$xsmall',
                gap: '$1',
                padding: '$3 $4',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {activeTokenSet}
              <IconToggleableDisclosure open={tokenSetsVisible} />
            </Box>
          </StyledButton>
        </Box>
        <TokenFilter />
        <ThemeSelector />
        <Box
          css={{
            display: 'flex',
            gap: '$2',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '$4',
          }}
        >
          <IconButton
            variant={activeTokensTab === 'list' ? 'primary' : 'default'}
            dataCy="tokensTabList"
            onClick={handleSetTokensTabToList}
            icon={<IconListing />}
            tooltipSide="bottom"
            tooltip="Listing"
          />
          <IconButton
            variant={activeTokensTab === 'json' ? 'primary' : 'default'}
            dataCy="tokensTabJSON"
            onClick={handleSetTokensTabToJSON}
            icon={<IconJSON />}
            tooltipSide="bottom"
            tooltip="JSON"
          />
        </Box>
      </Box>
      <Box
        css={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          borderBottom: '1px solid',
          borderColor: '$borderMuted',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {tokenSetsVisible && (
          <Box>
            <TokenSetSelector saveScrollPositionSet={saveScrollPositionSet} />
          </Box>
        )}
        <Box
          css={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {activeTokensTab === 'json' ? (
            <Box css={{ position: 'relative', height: '100%' }}>
              {/* <JSONEditor stringTokens={stringTokens} handleChange={handleChangeJSON} hasError={Boolean(error)} /> */}
              <StatusToast
                open={Boolean(error)}
                error={error}
              />
            </Box>
          ) : (
            <Box ref={tokenDiv} css={{ width: '100%', paddingBottom: '$6' }} className="content scroll-container">
              {rootTokenGroupsPerType.map(([key, { groups, ...schema }]) => (
                <div key={key}>
                  <TokenListing
                    tokenKey={key}
                    label={schema.label || key}
                    schema={schema}
                    values={groups}
                    isPro={schema.isPro}
                  />
                </div>
              ))}
              <ToggleEmptyButton />
              {/* {showEditForm && <EditTokenFormModal resolvedTokens={resolvedTokens} />} */}
              {manageThemesModalOpen && <ManageThemesModal />}
            </Box>
          )}
        </Box>
      </Box>
      <TokensBottomBar
        handleUpdate={handleUpdate}
        handleSaveJSON={handleSaveJSON}
        hasJSONError={!!error}
      />
    </Box>
  );
}

export default Tokens;
