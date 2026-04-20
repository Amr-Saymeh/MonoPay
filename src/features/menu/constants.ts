import { MenuItem } from "./types";

export const menuItems: MenuItem[] = [
  {
    id: "1",
    titleKey: "myCards",
    subtitleKey: "myCardsSubtitle",
    iconName: "card-outline",
    color: "#FF5722",
    state: false,
    route: "/wallets",
  },
  {
    id: "2",
    titleKey: "exchangeRates",
    subtitleKey: "exchangeRatesSubtitle",
    iconName: "trending-up-outline",
    color: "#2196F3",
    state: false,
    route: "/exchange",
  },
  {
    id: "3",
    titleKey: "spendingInsights",
    subtitleKey: "spendingInsightsSubtitle",
    iconName: "bar-chart-outline",
    color: "#9C27B0",
    state: false,
    route: "/SpendingInsights",
  },
  {
    id: "4",
    titleKey: "savingGoals",
    subtitleKey: undefined,
    iconName: "wallet-outline",
    color: "#4CAF50",
    state: false,
    route: "/goals",
  },
  {

    id: '5',
    titleKey: 'sendMoneyPage',
    subtitleKey: 'sendMoneySubtitle',
    iconName: 'send-outline',
    color: '#7C3AED',
    state: false,
    route: '/send-money'
  },
  {
    id: '13',
    titleKey: 'requestMoneyPage',
    subtitleKey: 'requestMoneySubtitle',
    iconName: 'arrow-down-circle-outline',
    color: '#5B21B6',
    state: false,
    route: '/request-money'
  },
  {
    id: '10',
    titleKey: 'requestsPage',
    subtitleKey: 'requestsSubtitle',
    iconName: 'mail-open-outline',
    color: '#8B5CF6',
    state: false,
    route: '/requests'
  },
  {
    id: '11',
    titleKey: 'scanQr',
    subtitleKey: 'scanQrSubtitle',
    iconName: 'scan-outline',
    color: '#0EA5E9',
    state: false,
    route: '/scan-qr'
  },
  {
    id: '12',
    titleKey: 'myQr',
    subtitleKey: 'myQrSubtitle',
    iconName: 'qr-code-outline',
    color: '#14B8A6',
    state: false,
    route: '/my-qr'
    },
  
    {
    id: "6",
    titleKey: "regularSavings",
    subtitleKey: "regularSavingsSubtitle",
    iconName: "cash-outline",
    color: "#27D3F5",
    state: false,
    route: "/income-savings",
  },

  {
    id: "9",
    titleKey: "settings",
    subtitleKey: "settingsSubtitle",
    iconName: "settings-outline",
    color: "#607D8B",
    state: false,
    route: "/settings",
  },

  {
    id: "8",
    titleKey: "dailyPurchases",
    subtitleKey: "Spending Insights",
    iconName: "cart-outline",
    color: "#FF4D6D",
    state: false,
    route: "/MainScreen_DailyPur",
  },
  {
    id: "7",
    titleKey: "more",
    subtitleKey: undefined,
    iconName: "ellipsis-horizontal",
    color: "#00BCD4",
    state: true,
    route: "/FeturesPage",
  },
];
