export interface MenuItem {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  iconName: any;
  color: string;
  state: boolean;
  route?: any;
}
