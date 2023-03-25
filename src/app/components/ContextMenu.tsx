import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { styled } from '@/stitches.config';

const StyledContent = styled(ContextMenuPrimitive.Content, {
  minWidth: 100,
  backgroundColor: '$contextMenuBackground',
  borderRadius: '$contextMenu',
  overflow: 'hidden',
  padding: '$2',
  boxShadow: '$contextMenu',
});

const StyledSubContent = styled(ContextMenuPrimitive.SubContent, {
  minWidth: 100,
  backgroundColor: '$contextMenuBackground',
  borderRadius: '$contextMenu',
  overflow: 'hidden',
  padding: '$2',
  boxShadow: '$contextMenu',
});

const itemStyles = {
  all: 'unset',
  fontSize: '$xsmall',
  lineHeight: 1,
  color: '$contextMenuForeground',
  borderRadius: '$contextMenuItem',
  display: 'flex',
  alignItems: 'center',
  height: 20,
  padding: '0 $2',
  paddingLeft: '$5',
  userSelect: 'none',

  '&[data-disabled]': {
    color: '$interactionDisabled',
    pointerEvents: 'none',
  },

  '&:focus': {
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },
  '&:disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },
};

const StyledItem = styled(ContextMenuPrimitive.Item, { ...itemStyles });
const StyledCheckboxItem = styled(ContextMenuPrimitive.CheckboxItem, { ...itemStyles });
const StyledRadioItem = styled(ContextMenuPrimitive.RadioItem, { ...itemStyles });

const StyledSubTrigger = styled(ContextMenuPrimitive.SubTrigger, {
  '&[data-state="open"]': {
    backgroundColor: '$interaction',
    color: '$onInteraction',
  },
  ...itemStyles,
});

const StyledLabel = styled(ContextMenuPrimitive.Label, {
  paddingLeft: '$3',
  fontSize: '$xsmall',
  lineHeight: '25px',
  color: '$contextMenuForeground',
});

const StyledSeparator = styled(ContextMenuPrimitive.Separator, {
  height: '1px',
  backgroundColor: '$contextMenuSeperator',
  margin: '$2',
});

const StyledItemIndicator = styled(ContextMenuPrimitive.ItemIndicator, {
  position: 'absolute',
  left: '$2',
  width: '$5',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const StyledArrow = styled(ContextMenuPrimitive.Arrow, {
  fill: 'white',
});

const Content = StyledContent;
const Item = StyledItem;
const CheckboxItem = StyledCheckboxItem;
const { RadioGroup } = ContextMenuPrimitive;
const RadioItem = StyledRadioItem;
const ItemIndicator = StyledItemIndicator;
const Label = StyledLabel;
const Separator = StyledSeparator;
const Arrow = StyledArrow;
const SubTrigger = StyledSubTrigger;
const SubContent = StyledSubContent;
const { Sub, Portal, Trigger } = ContextMenuPrimitive;

// Exports
export const ContextMenu = Object.assign(ContextMenuPrimitive.Root, {
  Trigger,
  Content,
  Item,
  CheckboxItem,
  RadioGroup,
  RadioItem,
  ItemIndicator,
  Label,
  Separator,
  Arrow,
  Sub,
  SubTrigger,
  SubContent,
  Portal,
});
