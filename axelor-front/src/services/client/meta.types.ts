import { DataContext, DataRecord } from "./data.types";

export type PropertyType =
  | "STRING"
  | "TEXT"
  | "BOOLEAN"
  | "INTEGER"
  | "LONG"
  | "DOUBLE"
  | "DECIMAL"
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "BINARY"
  | "ENUM"
  | "ONE_TO_ONE"
  | "MANY_TO_ONE"
  | "ONE_TO_MANY"
  | "MANY_TO_MANY";

export interface Property {
  name: string;
  type: PropertyType;
  mappedBy?: string;
  target?: string;
  targetName?: string;
  targetSearch?: string[];
  enumType?: string;
  primary?: boolean;
  required?: boolean;
  unique?: boolean;
  orphan?: boolean;
  maxSize?: number | string;
  minSize?: number | string;
  precision?: number;
  scale?: number;
  title?: string;
  help?: string;
  image?: boolean;
  nullable?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  virtual?: boolean;
  transient?: boolean;
  json?: boolean;
  password?: boolean;
  massUpdate?: boolean;
  nameColumn?: boolean;
  sequence?: boolean;
  translatable?: boolean;
  encrypted?: boolean;
  defaultNow?: boolean;
  nameSearch?: string[];
  selection?: string;
  version?: boolean;
  reference?: boolean;
  collection?: boolean;
  enum?: boolean;
}

export interface Widget {
  name?: string;
  title?: string;
  help?: string;
  showTitle?: boolean;
  hidden?: boolean;
  readonly?: boolean;
  showIf?: string;
  hideIf?: string;
  readonlyIf?: string;
  depends?: string;
  colSpan?: number;
  colOffset?: number;
  css?: string;
  height?: string;
  width?: string;
  autoTitle?: string;
}

export interface Container extends Widget {
  rowSpan?: number;
}

export interface Viewer {
  depends?: string;
  template?: string;
  fields?: Property[];
}

export interface Editor extends Panel {
  layout?: string;
  viewer?: boolean;
  showOnNew?: boolean;
  onNew?: string;
  items?: (Field | Button | Spacer | Separator | Label | Panel)[];
  fields?: Property[];
}

export interface Tooltip extends Viewer {
  call?: string;
}

export interface Hilite {
  color?: string;
  background?: string;
  strong?: boolean;
  condition?: string;
  css?: string;
}

export interface Label extends Widget {}

export interface Spacer extends Widget {}

export interface Separator extends Widget {}

export interface Button extends Widget {
  icon?: string;
  iconHover?: string;
  link?: string;
  prompt?: string;
  onClick?: string;
  widget?: string;
  title?: string;
}

export interface ButtonGroup extends Container {}

export interface MenuItem extends Widget {
  name: string;
  title: string;
  xmlId?: string;
  parent?: string;
  icon?: string;
  iconBackground?: string;
  action?: string;
  prompt?: string;
  order?: number;
  groups?: string;
  top?: boolean;
  left?: boolean;
  mobile?: boolean;
  category?: string;
  tag?: string;
  tagGet?: string;
  tagCount?: boolean;
  tagStyle?: string;
  hasTag?: boolean;
}

export interface Menu extends Widget {
  icon?: string;
  items?: (MenuItem | Menu)[];
}

export interface Static extends Widget {
  text?: string;
}

export interface Help extends Static {}

export interface Field extends Widget {
  name: string;
  serverType?: string;
  placeholder?: string;
  widget?: string;
  canSuggest?: boolean;
  canSelect?: string;
  canNew?: string;
  canView?: string;
  canEdit?: string;
  canRemove?: string;
  onChange?: string;
  onSelect?: string;
  target?: string;
  targetName?: string;
  domain?: string;
  required?: boolean;
  requiredIf?: string;
  validIf?: string;
  minSize?: string;
  maxSize?: string;
  pattern?: string;
  fgColor?: string;
  bgColor?: string;
  selection?: string;
  selectionIn?: string;
  aggregate?: string;
  massUpdate?: boolean;
  sortable?: boolean;
  editWindow?: string;
  formView?: string;
  gridView?: string;
  summaryView?: string;
  bind?: string;
  enumType?: string;
  related?: string;
  create?: string;
  canReload?: boolean;
  callOnSave?: boolean;
  icon?: string;
  iconHover?: string;
  iconActive?: string;
  exclusive?: boolean;
  showIcons?: string;
  direction?: string;
  codeSyntax?: string;
  codeTheme?: string;
  lite?: boolean;
  labels?: boolean;
  orderBy?: string;
  limit?: number;
  searchLimit?: number;
  colorField?: string;
  accept?: string;
  popupMaximized?: string;
  jsonModel?: string;
  hilites?: Hilite[];
  tooltip?: Tooltip;
  views?: (FormView | GridView)[];
  selectionList?: Selection[];
  jsonFields?: JsonField[];
  viewer?: Viewer;
  editor?: Editor;
}

export interface Panel extends Container {
  itemSpan?: number;
  showFrame?: boolean;
  sidebar?: boolean;
  stacked?: boolean;
  attached?: boolean;
  onTabSelect?: string;
  canCollapse?: boolean;
  collapseIf?: string;
  icon?: string;
  iconBackground?: string;
  menu?: Menu;
  items?: (
    | Field
    | Spacer
    | Label
    | Static
    | Separator
    | Help
    | Button
    | ButtonGroup
    | Panel
    | PanelRelated
    | PanelDashlet
    | PanelInclude
  )[];
}

export interface PanelRelated extends Panel {
  name?: string;
  serverType?: string;
  formView?: string;
  gridView?: string;
  searchLimit?: number;
  rowHeight?: number;
  selector?: string;
  editable?: boolean;
  required?: boolean;
  requiredIf?: string;
  validIf?: string;
  orderBy?: string;
  groupBy?: string;
  domain?: string;
  target?: string;
  targetName?: string;
  onNew?: string;
  onChange?: string;
  onSelect?: string;
  canSelect?: string;
  canNew?: string;
  canView?: string;
  canEdit?: string;
  canRemove?: string;
  canMove?: boolean;
  editWindow?: string;
  items?: (Field | Button)[];
  fields?: Property[];
  perms?: Perms;
}

export interface PanelDashlet extends Panel {
  action?: string;
  canSearch?: boolean;
  canEdit?: string;
}

export interface PanelInclude extends Panel {
  name?: string;
  module?: string;
  view?: View;
}

export interface PanelTabs extends Widget {
  items?: (Panel | PanelRelated | PanelDashlet | PanelInclude)[];
}

export interface PanelStack extends PanelTabs {}

export interface PanelMail extends Panel {
  items?: (MailMessages | MailFollowers)[];
}

export interface MailMessages extends Widget {
  limit?: number;
}

export interface MailFollowers extends Widget {}

export interface Perms {
  read?: boolean;
  write?: boolean;
  create?: boolean;
  remove?: boolean;
  export?: boolean;
  massUpdate?: boolean;
}

export interface JsonField extends Field {
  name: string;
  jsonTarget?: string;
  jsonField?: string;
  jsonPath?: string;
  jsonType?: string;
}

export interface Selection {
  value?: string;
  title?: string;
  icon?: string;
  color?: string;
  order?: number;
  hidden?: boolean;
}

export interface View {
  type: string;
  xmlId?: string;
  viewId?: number;
  modelId?: number;
  customViewId?: number;
  customViewShared?: boolean;
  name?: string;
  title?: string;
  css?: string;
  model?: string;
  editable?: boolean;
  groups?: string;
  helpLink?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  helpOverride?: {
    field?: string;
    type?: string;
    help?: string;
    style?: string;
  };
  items?: Widget[];
}

export interface FormView extends View {
  type: "form";
  onLoad?: string;
  onSave?: string;
  onNew?: string;
  readonlyIf?: string;
  canNew?: string;
  canEdit?: string;
  canSave?: string;
  canDelete?: string;
  canArchive?: string;
  canCopy?: string;
  canAttach?: string;
  toolbar?: Button[];
  menubar?: Menu[];
  items?: (
    | Help
    | Panel
    | PanelInclude
    | PanelDashlet
    | PanelRelated
    | PanelStack
    | PanelTabs
    | PanelMail
  )[];
}

export interface GridView extends View {
  type: "grid";
  expandable?: boolean;
  sortable?: boolean;
  orderBy?: string;
  groupBy?: string;
  customSearch?: boolean;
  freeSearch?: string;
  onNew?: string;
  canNew?: boolean;
  canEdit?: boolean;
  canSave?: boolean;
  canDelete?: boolean;
  canArchive?: boolean;
  canMove?: boolean;
  editIcon?: boolean;
  rowHeight?: number;
  colWidth?: number;
  noFetch?: boolean;
  selector?: string;
  inlineHelp?: Help;
  toolbar?: Button[];
  menubar?: Menu[];
  hilites?: Hilite[];
  items?: (Field | Button)[];
}

export interface CardsView extends View {
  type: "cards";
  orderBy?: string;
  customSearch?: boolean;
  freeSearch?: string;
  toolbar?: Button[];
  menubar?: Menu[];
  items?: Widget[];
  hilites?: Hilite[];
  template?: string;
  canNew?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  editWindow?: string;
}

export interface TreeNode {
  model?: string;
  parent?: string;
  onClick?: string;
  draggable?: boolean;
  domain?: string;
  orderBy?: string;
  items?: (TreeField | Button)[];
}

export interface TreeField extends Field {
  as?: string;
  selection?: string;
}

export interface TreeColumn extends SearchField {}

export interface TreeView extends View {
  type: "tree";
  showHeader?: boolean;
  columns?: TreeColumn[];
  nodes?: TreeNode[];
}

export interface SearchField extends Field {
  multiple?: boolean;
  type?: string;
}

export interface ChartCategory {
  key?: string;
  type?: string;
  title?: string;
}

export interface ChartSeries {
  key?: string;
  groupBy?: string;
  type?: string;
  side?: string;
  title?: string;
  aggregate?: string;
  scale?: number;
}

export interface ChartConfig {
  name?: string;
  value?: string;
}

export interface ChartAction {
  name?: string;
  title?: string;
  action?: string;
}

export interface ChartView extends View {
  type: "chart";
  stacked?: boolean;
  onInit?: string;
  searchFields?: SearchField[];
  category?: ChartCategory;
  series?: ChartSeries[];
  config?: ChartConfig[];
  actions?: ChartAction[];
}

export interface KanbanView extends View {
  type: "kanban";
  columnBy?: string;
  sequenceBy?: string;
  draggable?: boolean;
  onNew?: string;
  onMove?: string;
  limit?: number;
  columns?: Selection[];
}

export interface CalendarView extends View {
  type: "calendar";
  mode?: string;
  colorBy?: string;
  onChange?: string;
  eventStart?: string;
  eventStop?: string;
  eventLength?: number;
  dayLength?: number;
  items?: Widget[];
}

export interface GanttView extends View {
  type: "gantt";
  mode?: string;
  taskStart?: string;
  taskDuration?: string;
  taskEnd?: string;
  taskParent?: string;
  taskSequence?: string;
  taskProgress?: string;
  taskUser?: string;
  startToStart?: string;
  startToFinish?: string;
  finishToStart?: string;
  finishToFinish?: string;
  items?: Widget[];
}

export interface CustomView extends View {
  type: "custom";
  items?: Widget[];
  template?: string;
}

export interface Dashboard extends View {
  type: "dashboard";
  items?: PanelDashlet[];
}

export interface SearchView extends View {
  type: "search";
  limit?: number;
  searchForm?: string;
  searchFields?: SearchField[];
  hilites?: Hilite[];
  resultFields?: SearchResultField[];
  buttons?: Button[];
  selects?: SearchSelect[];
}

export interface SearchSelect {
  model?: string;
  title?: string;
  viewTitle?: string;
  selected?: boolean;
  formView?: string;
  gridView?: string;
  fields?: SearchSelectField[];
  limit?: number;
  distinct?: boolean;
}

export interface SearchSelectField {
  name?: string;
  as?: string;
  selectionList?: Selection[];
}

export interface SearchResultField extends SearchField {}

export interface SearchFilter {
  name?: string;
  title?: string;
  domain?: string;
  context?: SearchContext;
}

export interface SearchContext {
  name?: string;
  value?: string;
}

export interface SearchFilters extends View {
  type: "search-filters";
  items?: Widget[];
  filters?: SearchFilter[];
}

export interface SavedFilter {
  id: number;
  version?: number;
  name: string;
  title: string;
  shared: boolean;
  user?: DataRecord;
  filterView: string;
  filterCustom: string;
  filters?: string;
}

export interface ActionView {
  xmlId?: string;
  actionId?: number;
  model?: string;
  name: string;
  title: string;
  icon?: string;
  home?: boolean;
  domain?: string;
  viewType: string;
  views?: View[];
  context?: DataContext;
  params?: DataRecord;
}

export type ViewType =
  | GridView
  | FormView
  | CardsView
  | TreeView
  | CalendarView
  | KanbanView
  | GanttView
  | ChartView
  | CustomView
  | SearchView
  | SearchFilters;

export type ViewTypes<Types extends { type: string } = ViewType> = {
  [T in Types as T["type"]]: T;
};
