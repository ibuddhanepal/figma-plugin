import { createDataset, mutationClientFactory } from 'figma-tokens-library';

// @README we'll create a global dataset which will contain all the tokens, tokensets and token groups
// logically - this can be seen as the main data source
// the factory function will also return an event emitter which can be used to handle updates (can be used raw or in combination with the provided hooks)
export const [$e, dataset] = createDataset([]);

// @README the mutation client handles updating the dataset.
// logically - this can be seen as the SDK or client to interact with the data source
// there are 4 available mutations
// - add(type, path, params): This adds an entry to the dataset (this can be a token, tokenGroup, tokenSet, ...)
// - delete(deleteOptions): This can delete one or more entries in single call
// - update(updateCallback): This can update one or more entries in a single call
// - rename(renameOptions): This can rename an entry (including children and references within the same token set)
export const mutationClient = mutationClientFactory(dataset);

// NOTE mutating the dataset is allowed but only by replacing, removing or adding elements.
// elements should not be mutated in place because this won't trigger an event
// instead the element should be cloned and replaced

$e.on('*', console.log);
