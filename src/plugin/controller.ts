/* eslint-disable no-param-reassign */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as asyncHandlers from './asyncMessageHandlers';
import { defaultWorker } from './Worker';
import { AsyncMessageChannel } from '@/AsyncMessageChannel';
import { AsyncMessageTypes } from '@/types/AsyncMessages';
import { sendSelectionChange } from './sendSelectionChange';
import { init } from '@/utils/plugin';
import { swapStyles } from './asyncMessageHandlers/swapStyles';
import { ThemeObjectsList } from '@/types';

figma.skipInvisibleInstanceChildren = true;

AsyncMessageChannel.PluginInstance.connect();
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREDENTIALS, asyncHandlers.credentials);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CHANGED_TABS, asyncHandlers.changedTabs);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_SINGLE_CREDENTIAL, asyncHandlers.removeSingleCredential);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_STORAGE_TYPE, asyncHandlers.setStorageType);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSETS, asyncHandlers.setOnboardingExplainerSets);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_ONBOARDINGEXPLAINERSYNCPROVIDERS, asyncHandlers.setOnboardingExplainerSyncProviders);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_ONBOARDINGEXPLAINERINSPECT, asyncHandlers.setOnboardingExplainerInspect);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_NODE_DATA, asyncHandlers.setNodeData);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_TOKENS_BY_VALUE, asyncHandlers.removeTokensByValue);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMAP_TOKENS, asyncHandlers.remapTokens);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.BULK_REMAP_TOKENS, asyncHandlers.bulkRemapTokens);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.GOTO_NODE, asyncHandlers.gotoNode);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SELECT_NODES, asyncHandlers.selectNodes);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.PULL_STYLES, asyncHandlers.pullStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SYNC_STYLES, asyncHandlers.syncStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.NOTIFY, asyncHandlers.notify);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RESIZE_WINDOW, asyncHandlers.resizeWindow);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CANCEL_OPERATION, asyncHandlers.cancelOperation);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_SHOW_EMPTY_GROUPS, asyncHandlers.setShowEmptyGroups);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_UI, asyncHandlers.setUi);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_ANNOTATION, asyncHandlers.createAnnotation);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.CREATE_STYLES, asyncHandlers.createStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RENAME_STYLES, asyncHandlers.renameStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.REMOVE_STYLES, asyncHandlers.removeStyles);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.UPDATE, asyncHandlers.update);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.SET_LICENSE_KEY, asyncHandlers.setLicenseKey);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.ATTACH_LOCAL_STYLES_TO_THEME, asyncHandlers.attachLocalStylesToTheme);
AsyncMessageChannel.PluginInstance.handle(AsyncMessageTypes.RESOLVE_STYLE_INFO, asyncHandlers.resolveStyleInfo);

function runUI() {
  init();
}

async function startPluginWithParameters(parameters: ParameterValues, themes: ThemeObjectsList) {
  console.log('Starting', parameters);

  await swapStyles(parameters.swap, themes);
  figma.closePlugin();
}

async function runPlugin() {
  let themes: ThemeObjectsList;
  const themesOnFile = await figma.root.getSharedPluginData('tokens', 'themes');
  if (!themesOnFile) {
    console.log('No themes on file');
    themes = await figma.clientStorage.getAsync('last_used_themes');
  } else {
    console.log('Themes on file');
    themes = JSON.parse(themesOnFile);
  }
  figma.on('run', async ({ parameters }: RunEvent) => {
    if (parameters) {
      await startPluginWithParameters(parameters, themes);
    } else {
      runUI();
    }
  });
  figma.parameters.on('input', async ({ key, result }: ParameterInputEvent) => {
    const availableThemes = themes.map((theme) => ({ name: theme.name, data: theme.id }));
    if (!themes?.length) {
      result.setError('No themes available');
    }

    switch (key) {
      case 'swap':
        result.setSuggestions(availableThemes);
        break;
      default:
    }
  });

  figma.on('close', () => {
    defaultWorker.stop();
  });
}

figma.on('selectionchange', () => {
  sendSelectionChange();
});

runPlugin();
