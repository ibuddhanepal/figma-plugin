import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { LDProps } from 'launchdarkly-react-client-sdk/lib/withLDConsumer';
import { Dispatch } from '@/app/store';
import useConfirm from '@/app/hooks/useConfirm';
import usePushDialog from '@/app/hooks/usePushDialog';
import { notifyToUI } from '@/plugin/notifiers';
import {
  activeThemeSelector,
  localApiStateSelector, themesListSelector, tokensSelector, usedTokenSetSelector,
} from '@/selectors';
import { GitlabTokenStorage } from '@/storage/GitlabTokenStorage';
import { isEqual } from '@/utils/isEqual';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { StorageProviderType } from '@/constants/StorageProviderType';
import { useFlags } from '@/app/components/LaunchDarkly';
import { getRepositoryInformation } from '../getRepositoryInformation';
import { RemoteResponseData } from '@/types/RemoteResponseData';
import { ErrorMessages } from '@/constants/ErrorMessages';
import { applyTokenSetOrder } from '@/utils/tokenset';
import { saveLastSyncedState } from '@/utils/saveLastSyncedState';

export type GitlabCredentials = Extract<StorageTypeCredentials, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB; }>;
type GitlabFormValues = Extract<StorageTypeFormValues<false>, { provider: StorageProviderType.GITHUB | StorageProviderType.GITLAB }>;

export const clientFactory = async (context: GitlabCredentials, multiFileSync: boolean) => {
  const {
    secret, baseUrl, id: repoPathWithNamespace, filePath, branch,
  } = context;
  const { repositoryId } = getRepositoryInformation(repoPathWithNamespace);

  const storageClient = new GitlabTokenStorage(secret, repositoryId, repoPathWithNamespace, baseUrl ?? '');
  if (filePath) storageClient.changePath(filePath);
  if (branch) storageClient.selectBranch(branch);
  if (multiFileSync) storageClient.enableMultiFile();
  return storageClient.assignProjectId();
};

export function useGitLab() {
  const tokens = useSelector(tokensSelector);
  const themes = useSelector(themesListSelector);
  const localApiState = useSelector(localApiStateSelector);
  const usedTokenSet = useSelector(usedTokenSetSelector);
  const activeTheme = useSelector(activeThemeSelector);
  const { multiFileSync } = useFlags();
  const dispatch = useDispatch<Dispatch>();

  const { confirm } = useConfirm();
  const { pushDialog } = usePushDialog();

  const storageClientFactory = useCallback(clientFactory, []);

  const askUserIfPull = useCallback(async () => {
    const confirmResult = await confirm({
      text: 'Pull from GitLab?',
      description: 'Your repo already contains tokens, do you want to pull these now?',
    });
    return confirmResult;
  }, [confirm]);

  const pushTokensToGitLab = useCallback(async (context: GitlabCredentials) => {
    const storage = await storageClientFactory(context, multiFileSync);

    const content = await storage.retrieve();

    if (content) {
      if (
        content
        && isEqual(content.tokens, tokens)
        && isEqual(content.themes, themes)
        && isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
      ) {
        notifyToUI('Nothing to commit');
        return {
          tokens,
          themes,
          metadata: {},
        };
      }
    }

    dispatch.uiState.setLocalApiState({ ...context });

    const pushSettings = await pushDialog();
    if (pushSettings) {
      const { commitMessage, customBranch } = pushSettings;
      try {
        if (customBranch) storage.selectBranch(customBranch);
        const metadata = {
          tokenSetOrder: Object.keys(tokens),
        };
        await storage.save({
          themes,
          tokens,
          metadata,
        }, {
          commitMessage,
        });
        saveLastSyncedState(dispatch, tokens, themes, metadata);
        dispatch.uiState.setLocalApiState({ ...localApiState, branch: customBranch } as GitlabCredentials);
        dispatch.uiState.setApiData({ ...context, branch: customBranch });
        dispatch.tokenState.setTokenData({
          values: tokens,
          themes,
          usedTokenSet,
          activeTheme,
        });

        pushDialog('success');
        return {
          tokens,
          themes,
          metadata: {},
        };
      } catch (e) {
        console.log('Error pushing to GitLab', e);
      }
    }
    return {
      tokens,
      themes,
      metadata: {},
    };
  }, [
    dispatch,
    storageClientFactory,
    pushDialog,
    tokens,
    themes,
    localApiState,
    usedTokenSet,
    activeTheme,
    multiFileSync,
  ]);

  const checkAndSetAccess = useCallback(async ({
    context, receivedFeatureFlags,
  }: { context: GitlabCredentials; receivedFeatureFlags?: LDProps['flags'] }) => {
    const storage = await storageClientFactory(context, multiFileSync);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();
    const hasWriteAccess = await storage.canWrite();
    dispatch.tokenState.setEditProhibited(!hasWriteAccess);
  }, [dispatch, storageClientFactory, multiFileSync]);

  const pullTokensFromGitLab = useCallback(async (context: GitlabCredentials, receivedFeatureFlags?: LDProps['flags']) => {
    const storage = await storageClientFactory(context, multiFileSync);
    if (receivedFeatureFlags?.multiFileSync) storage.enableMultiFile();

    await checkAndSetAccess({
      context, receivedFeatureFlags,
    });

    try {
      const content = await storage.retrieve();

      if (content) {
        const sortedTokens = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder ?? []);
        return {
          ...content,
          tokens: sortedTokens,
        };
      }
    } catch (e) {
      console.log('Error', e);
    }
    return null;
  }, [storageClientFactory, checkAndSetAccess, multiFileSync]);

  const syncTokensWithGitLab = useCallback(async (context: GitlabCredentials): Promise<RemoteResponseData> => {
    try {
      const storage = await storageClientFactory(context, multiFileSync);
      const hasBranches = await storage.fetchBranches();
      dispatch.branchState.setBranches(hasBranches);

      if (!hasBranches || !hasBranches.length) {
        return {
          errorMessage: ErrorMessages.EMPTY_BRNACH_ERROR,
        };
      }

      await checkAndSetAccess({ context });

      const content = await storage.retrieve();
      if (content) {
        if (
          !isEqual(content.tokens, tokens)
          || !isEqual(content.themes, themes)
          || !isEqual(content.metadata?.tokenSetOrder ?? Object.keys(tokens), Object.keys(tokens))
        ) {
          const userDecision = await askUserIfPull();
          if (userDecision) {
            const sortedValues = applyTokenSetOrder(content.tokens, content.metadata?.tokenSetOrder);
            saveLastSyncedState(dispatch, sortedValues, content.themes, content.metadata);
            dispatch.tokenState.setTokenData({
              values: sortedValues,
              themes: content.themes,
              usedTokenSet,
              activeTheme,
            });
            dispatch.tokenState.setCollapsedTokenSets([]);
            notifyToUI('Pulled tokens from GitLab');
          }
        }
        return content;
      }
      const pushData = await pushTokensToGitLab(context);
      return {
        ...pushData,
        ...(pushData === null ? { errorMessage: ErrorMessages.GITLAB_CREDNETIAL_ERROR } : {}),
      };
    } catch (err) {
      notifyToUI(ErrorMessages.GITLAB_CREDNETIAL_ERROR, { error: true });
      console.log('Error', err);
      return {
        errorMessage: ErrorMessages.GITLAB_CREDNETIAL_ERROR,
      };
    }
  }, [
    storageClientFactory,
    dispatch.branchState,
    dispatch.tokenState,
    pushTokensToGitLab,
    tokens,
    themes,
    askUserIfPull,
    usedTokenSet,
    activeTheme,
    checkAndSetAccess,
    multiFileSync,
  ]);

  const addNewGitLabCredentials = useCallback(async (context: GitlabFormValues): Promise<RemoteResponseData> => {
    const data = await syncTokensWithGitLab(context);
    if (!data.errorMessage) {
      AsyncMessageChannel.ReactInstance.message({
        type: AsyncMessageTypes.CREDENTIALS,
        credential: context,
      });
      if (!data.tokens) {
        notifyToUI('No tokens stored on remote');
      }
    } else {
      return {
        errorMessage: data.errorMessage,
      };
    }
    return {
      tokens: data.tokens ?? tokens,
      themes: data.themes ?? themes,
      metadata: {},
    };
  }, [
    syncTokensWithGitLab,
    tokens,
    themes,
    dispatch.tokenState,
    usedTokenSet,
    activeTheme,
  ]);

  const fetchGitLabBranches = useCallback(async (context: GitlabCredentials) => {
    const storage = await storageClientFactory(context, multiFileSync);
    return storage.fetchBranches();
  }, [storageClientFactory, multiFileSync]);

  const createGitLabBranch = useCallback(async (context: GitlabCredentials, newBranch: string, source?: string) => {
    const storage = await storageClientFactory(context, multiFileSync);
    return storage.createBranch(newBranch, source);
  }, [storageClientFactory, multiFileSync]);

  return useMemo(() => ({
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
  }), [
    addNewGitLabCredentials,
    syncTokensWithGitLab,
    pullTokensFromGitLab,
    pushTokensToGitLab,
    fetchGitLabBranches,
    createGitLabBranch,
  ]);
}
