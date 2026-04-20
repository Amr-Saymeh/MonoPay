export type SupportedLanguage = "en" | "ar";

type TranslationKey =
  | "appName"
  | "home"
  | "explore"
  | "wallets"
  | "walletManagement"
  | "myWallets"
  | "addWallet"
  | "yourWallets"
  | "noWalletsYet"
  | "tapPlusToAddFirstWallet"
  | "walletDetails"
  | "walletName"
  | "walletNamePlaceholder"
  | "walletType"
  | "walletTypeReal"
  | "walletTypeCredit"
  | "walletTypeShared"
  | "walletStatus"
  | "walletExpiry"
  | "walletOwner"
  | "walletMembers"
  | "walletCurrencies"
  | "balance"
  | "members"
  | "expShort"
  | "active"
  | "inactive"
  | "pleaseSignIn"
  | "createWallet"
  | "creating"
  | "initialBalances"
  | "chooseCardColor"
  | "chooseEmoji"
  | "addMembers"
  | "searchByNameOrNumber"
  | "deleteWallet"
  | "deleting"
  | "delete"
  | "deleteWalletConfirmTitle"
  | "deleteWalletConfirmMessage"
  | "mainWalletNotFound"
  | "cannotDeleteMainWallet"
  | "walletNotFound"
  | "onlyOwnerCanDelete"
  | "walletNameRequired"
  | "invalidExpiry"
  | "invalidAmount"
  | "duplicateCurrency"
  | "approve"
  | "settings"
  | "signIn"
  | "signUp"
  | "email"
  | "pin"
  | "confirmPin"
  | "firstName"
  | "lastName"
  | "address"
  | "idNumber"
  | "continue"
  | "login"
  | "refreshNow"
  | "noAccount"
  | "alreadyHaveAccount"
  | "scanYourId"
  | "idScanHint"
  | "takeSelfie"
  | "selfieHint"
  | "capture"
  | "retake"
  | "usePhoto"
  | "welcome"
  | "accountPending"
  | "pendingDescription"
  | "editProfile"
  | "account"
  | "paymentMethods"
  | "categories"
  | "allCategories"
  | "searchCategories"
  | "addCustomCategory"
  | "customCategoryPlaceholder"
  | "done"
  | "add"
  | "preferences"
  | "notifications"
  | "darkMode"
  | "securityPrivacy"
  | "changePassword"
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword"
  | "updatePassword"
  | "retakePhoto"
  | "save"
  | "saved"
  | "logoutConfirmTitle"
  | "logoutConfirmMessage"
  | "logout"
  | "error"
  | "failedToSignIn"
  | "captureFailed"
  | "missingSignupData"
  | "invalidEmail"
  | "invalidIdNumber"
  | "pinMismatch"
  | "pinTooShort"
  | "required"
  | "uploadFailed"
  | "cameraPermissionNeeded"
  | "approveUsers"
  | "pendingVerification"
  | "noPendingUsers"
  | "usersWithType0"
  | "name"
  | "phone"
  | "identityNumberLabel"
  | "personal"
  | "identity"
  | "approveAction"
  | "rejectAction"
  | "approveUserTitle"
  | "rejectUserTitle"
  | "cancel"
  | "advertisement"
  | "goodEvening"
  | "welcomeBack"
  | "quickActions"
  | "savingGoals"
  | "insights"
  | "cards"
  | "more"
  | "totalBalance"
  | "income"
  | "expenses"
  | "features"
  | "myCards"
  | "myCardsSubtitle"
  | "exchangeRates"
  | "exchangeRatesSubtitle"
  | "spendingInsights"
  | "spendingInsightsSubtitle"
  | "regularSavings"
  | "regularSavingsSubtitle"
  | "transactions"
  | "sendMoneyPage"
  | "sendMoneySubtitle"
  | "requestMoneyPage"
  | "requestMoneySubtitle"
  | "requestsPage"
  | "requestsSubtitle"
  | "scanQr"
  | "scanQrSubtitle"
  | "myQr"
  | "myQrSubtitle"
  | "settingsSubtitle" // ← أضيف هنا لحل مشكلة MenuList / FeaturesPage
  | "changeLanguage" // اقتراح إضافي لزر تغيير اللغة
  | "next"
  | "changePercent" // نص إضافي لعرض التغير الشهري في TotalBalance
  | "settingsSubtitle"
  | "changeLanguage"
  | "changePercent"
  | "makeTransaction"
  | "sendMoney"
  | "receiveMoney"
  | "amount"
  | "myWallet"
  | "selectMyWallet"
  | "recipientWallet"
  | "selectRecipientWallet"
  | "myReceivingWallet"
  | "selectReceivingWallet"
  | "recipient"
  | "selectRecipient"
  | "payer"
  | "selectPayer"
  | "category"
  | "selectCategory"
  | "noteOptional"
  | "notePlaceholder"
  | "send"
  | "request"
  | "insufficientFunds"
  | "walletInactive"
  | "senderIsReceiver"
  | "successSend"
  | "successRequest"
  | "selectWalletFirst"
  | "fillRequired"
  | "transfer"
  | "customization"
  | "Youmustselect3features"
  | "Youcanonlyselect3features"
  | "dailyPurchases"
  | "ofDailyBudget"
  | "editDailyBudget"
  | "dailyBudget"
  | "setDailyLimit"
  | "addPurchase"
  | "fieldRequired"
  | "purchaseAdded"
  | "foodDrinks"
  | "groceries"
  | "transport"
  | "health"
  | "shopping"
  | "entertainment"
  | "bills"
  | "education"
  | "personalCare"
  | "addNewPurchase"
  | "fillAllFields"
  | "success"
  | "totalExpenses"
  | "deletePurchase"
  | "updatedEveryHour"
  | "errorFetchingRates"
  | "enterAmountInAnyCurrency"
  | "items"
  | "noItemsInBundle"
  | "totalCost"
  | "noBundlesFound"
  | "edit"
  | "editBundle"
  | "createNewBundle"
  | "bundleName"
  | "bundleNamePlaceholder"
  | "cancelAdding"
  | "addItemToBundle"
  | "itemNamePlaceholder"
  | "price"
  | "confirmItem"
  | "updateBundle"
  | "confirmCreateBundle"
  | "recurring"
  | "manual"
  | "myBundles"
  | "editBudget"
  | "bundlesSubtitle"
  | "budgetWarningTitle"
  | "budgetWarningMessage"
  | "proceedAnyway"
  | "saveMyMoney"
  | "remainingBudget"
  | "newTotalAfter"
  | "goals.title"
  | "goals.createTitle"
  | "goals.editTitle"
  | "goals.totalSaved"
  | "goals.goalName"
  | "goals.targetAmount"
  | "goals.currentAmount"
  | "goals.targetDate"
  | "goals.currency"
  | "goals.contribute"
  | "goals.addContribution"
  | "goals.contributionAmount"
  | "goals.contributionReason"
  | "goals.remaining"
  | "goals.deleteConfirm"
  | "goals.deleteSuccess"
  | "goals.createSuccess"
  | "goals.updateSuccess"
  | "goals.contributionSuccess"
  | "goals.overallProgress"
  | "goals.remainingToReachAllGoals"
  | "goals.searchPlaceholder"
  | "goals.sortGoals"
  | "goals.sort.progress"
  | "goals.sort.amountSaved"
  | "goals.sort.soonestFirst"
  | "goals.sort.latestFirst"
  | "goals.sort.lowestFirst"
  | "goals.sort.highestFirst"
  | "goals.sort.ascending"
  | "goals.sort.descending"
  | "goals.emptyTitle"
  | "goals.emptySubtext"
  | "goals.emptySearchTitle"
  | "goals.emptySearchSubtext"
  | "goals.deleteTitle"
  | "goals.contributionAddedTitle"
  | "goals.goalDeletedTitle"
  | "goals.goalCreatedTitle"
  | "goals.goalUpdatedTitle"
  | "goals.invalidCurrentAmount"
  | "goals.currentLessThanTarget"
  | "goals.titlePlaceholder"
  | "goals.datePlaceholder"
  | "goals.progress"
  | "goals.amountSaved"
  | "goals.selectWallet"
  | "goals.loadingWallets"
  | "goals.noWalletsForCurrencyTitle"
  | "goals.noWalletsForCurrencySubtext"
  | "goals.noWalletsAvailableTitle"
  | "goals.noWalletsAvailableDescription"
  | "goals.invalidInputTitle"
  | "goals.invalidContributionAmount"
  | "goals.amountMustBeGreaterThanZero"
  | "goals.noWalletSelectedTitle"
  | "goals.selectWalletToContribute"
  | "goals.insufficientBalanceTitle"
  | "goals.insufficientBalanceDescription"
  | "goals.exceedsGoalTitle"
  | "goals.exceedsGoalDescription"
  | "goals.emptyWalletTitle"
  | "goals.emptyWalletDescription"
  | "goals.remainingToReachGoal"
  | "goals.goalReached"
  | "goals.inProgress"
  | "goals.hideContributionHistory"
  | "goals.showContributionHistory"
  | "goals.yourContributions"
  | "incomeSavings.title"
  | "incomeSavings.addEntry"
  | "incomeSavings.editEntry"
  | "incomeSavings.totalIncome"
  | "incomeSavings.totalOutgoing"
  | "incomeSavings.sortBy"
  | "incomeSavings.sortByDate"
  | "incomeSavings.sortByAmount"
  | "incomeSavings.type"
  | "incomeSavings.income"
  | "incomeSavings.savings"
  | "incomeSavings.source"
  | "incomeSavings.amount"
  | "incomeSavings.notes"
  | "incomeSavings.regularity"
  | "incomeSavings.daily"
  | "incomeSavings.weekly"
  | "incomeSavings.monthly"
  | "incomeSavings.yearly"
  | "incomeSavings.categories.salary"
  | "incomeSavings.categories.freelance"
  | "incomeSavings.categories.loan"
  | "incomeSavings.categories.other"
  | "incomeSavings.categories.savings"
  | "incomeSavings.categories.debt"
  | "incomeSavings.entryTypes.receive"
  | "incomeSavings.entryTypes.send"
  | "incomeSavings.deleteConfirm"
  | "incomeSavings.deleteSuccess"
  | "incomeSavings.createSuccess"
  | "incomeSavings.updateSuccess"
  | "incomeSavings.searchPlaceholder"
  | "incomeSavings.emptyTitle"
  | "incomeSavings.emptySubtext"
  | "incomeSavings.emptySearchTitle"
  | "incomeSavings.emptySearchSubtext"
  | "incomeSavings.deleteTitle"
  | "incomeSavings.deletePrompt"
  | "incomeSavings.deletePromptGeneric"
  | "incomeSavings.noWalletsTitle"
  | "incomeSavings.noWalletsDescription"
  | "incomeSavings.selectWalletTitle"
  | "incomeSavings.selectWalletDescription"
  | "incomeSavings.invalidAmountTitle"
  | "incomeSavings.invalidAmountDescription"
  | "incomeSavings.addedTitle"
  | "incomeSavings.addedDescription"
  | "incomeSavings.walletLabel"
  | "incomeSavings.summaryRegularSources"
  | "incomeSavings.summaryEstimatedMonthlyInflow"
  | "incomeSavings.modal.addRegularSource"
  | "incomeSavings.modal.sourceType"
  | "incomeSavings.modal.wallet"
  | "incomeSavings.modal.regularity"
  | "incomeSavings.modal.currency"
  | "incomeSavings.modal.amount"
  | "incomeSavings.modal.notesOptional"
  | "incomeSavings.modal.notesPlaceholder"
  | "incomeSavings.modal.saving"
  | "incomeSavings.modal.saveAndAddBalance"
  | "incomeSavings.categories.investment"
  | "addMoney"
  | "spendMoney"
  | "availableBalance"
  | "currency"
  | "reasonPlaceholder"
  | "saving"
  | "confirm"
  | "history"
  | "noHistory"
  | "noResults"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.add"
  | "common.close"
  | "common.confirm"
  | "common.loading";

export const translations: Record<
  SupportedLanguage,
  Record<TranslationKey, string>
> = {
  en: {
    appName: "MonoPay",
    home: "Home",
    explore: "Explore",
    refreshNow: "Refresh Now",
    wallets: "Wallets",
    walletManagement: "Wallet Management",
    myWallets: "My Wallets",
    addWallet: "Add Wallet",
    yourWallets: "Your wallets",
    noWalletsYet: "No wallets yet",
    tapPlusToAddFirstWallet: "Tap the + button to add your first wallet.",
    walletDetails: "Wallet Details",
    walletName: "Name",
    walletNamePlaceholder: "Main wallet",
    walletType: "Wallet Type",
    walletTypeReal: "Real",
    walletTypeCredit: "Credit",
    walletTypeShared: "Shared",
    walletStatus: "Status",
    walletExpiry: "Expiry",
    walletOwner: "Owner",
    walletMembers: "Members",
    walletCurrencies: "Currencies",
    balance: "Balance",
    members: "members",
    expShort: "Exp",
    active: "Active",
    inactive: "Inactive",
    pleaseSignIn: "Please sign in",
    createWallet: "Create Wallet",
    creating: "Creating...",
    initialBalances: "Initial Balances (optional)",
    chooseCardColor: "Choose Card Color",
    chooseEmoji: "Choose Emoji",
    addMembers: "Add Members",
    searchByNameOrNumber: "Search by name or number",
    deleteWallet: "Delete Wallet",
    deleting: "Deleting...",
    delete: "Delete",
    deleteWalletConfirmTitle: "Delete wallet",
    deleteWalletConfirmMessage: "Are you sure you want to delete",
    mainWalletNotFound: "Main wallet not found",
    cannotDeleteMainWallet: "You can't delete the Main wallet",
    walletNotFound: "Wallet not found",
    onlyOwnerCanDelete: "Only the owner can delete this shared wallet",
    walletNameRequired: "Wallet name is required",
    invalidExpiry: "Invalid expiry date (use MM/YY)",
    invalidAmount: "Invalid amount",
    duplicateCurrency: "Duplicate currency",
    approve: "Approve",
    settings: "Settings",
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "E-mail",
    pin: "PIN",
    confirmPin: "Confirm PIN",
    firstName: "First name",
    lastName: "Last name",
    address: "Address",
    idNumber: "ID number",
    continue: "Continue",
    login: "Login",
    noAccount: "No Account?",
    alreadyHaveAccount: "Already have an account?",
    scanYourId: "Scan your ID",
    idScanHint: "Place your ID inside the frame",
    takeSelfie: "Take a selfie",
    selfieHint: "Center your face in the oval",
    capture: "Capture",
    retake: "Retake",
    usePhoto: "Use photo",
    welcome: "Welcome",
    accountPending: "Your account is pending approval",
    pendingDescription: "We will notify you once your account is approved.",
    editProfile: "Edit Profile",
    account: "Account",
    paymentMethods: "Payment Methods",
    categories: "Categories",
    allCategories: "All Categories",
    searchCategories: "Search categories...",
    addCustomCategory: "Add Custom Category",
    customCategoryPlaceholder: "New category name",
    done: "Done",
    add: "Add",
    preferences: "Preferences",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    securityPrivacy: "Security & Privacy",
    changePassword: "Change Password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update password",
    retakePhoto: "Retake photo",
    save: "Save",
    saved: "Saved",
    next: "Next",
    logoutConfirmTitle: "Log out",
    logoutConfirmMessage: "Are you sure you want to log out?",
    logout: "Logout",
    error: "Error",
    failedToSignIn: "Failed to sign in.",
    captureFailed: "Failed to capture image.",
    missingSignupData: "Missing signup data.",
    invalidEmail: "Invalid email address",
    invalidIdNumber: "Invalid ID number",
    pinMismatch: "PIN does not match",
    pinTooShort: "PIN must be at least 6 digits",
    required: "This field is required",
    uploadFailed: "Upload failed. Please try again.",
    cameraPermissionNeeded: "Camera permission is required",
    approveUsers: "Approve Users",
    pendingVerification: "Pending verification",
    noPendingUsers: "No pending users",
    usersWithType0: "Users with type 0 will show up here.",
    name: "Name",
    phone: "Phone",
    identityNumberLabel: "Identity #",
    personal: "Personal",
    identity: "Identity",
    approveAction: "Approve",
    rejectAction: "Reject",
    approveUserTitle: "Approve user",
    rejectUserTitle: "Reject user",
    cancel: "Cancel",
    advertisement: "Advertisement",
    goodEvening: "Good Evening",
    welcomeBack: "Welcome back,",
    quickActions: "Quick Actions",
    savingGoals: "Saving Goals",
    insights: "Insights",
    cards: "Cards",
    more: "More",
    totalBalance: "Total Balance",
    income: "Income",
    expenses: "Expenses",
    features: "Features",
    myCards: "My Cards",
    myCardsSubtitle: "Manage credit & debit cards",
    exchangeRates: "Exchange Rates",
    exchangeRatesSubtitle: "View real-time currency exchange rates",
    spendingInsights: "Spending Insights",
    spendingInsightsSubtitle: "Track your spending by category",
    regularSavings: "Regular Savings",
    regularSavingsSubtitle: "Plan and track recurring savings",
    transactions: "Transactions",
    sendMoneyPage: "Send Money",
    sendMoneySubtitle: "Transfer funds to another user",
    requestMoneyPage: "Request Money",
    requestMoneySubtitle: "Request payment from someone",
    requestsPage: "Requests",
    requestsSubtitle: "Review sent and received requests",
    scanQr: "Scan QR",
    scanQrSubtitle: "Pay instantly by scanning a code",
    myQr: "My QR",
    myQrSubtitle: "Show your code to receive money",
    settingsSubtitle: "Manage your account preferences",
    changeLanguage: "Change Language",
    changePercent: " from last month",
    makeTransaction: "Make a Transaction",
    sendMoney: "Send Money",
    receiveMoney: "Receive Money",
    amount: "Amount",
    myWallet: "My Wallet",
    selectMyWallet: "Select your wallet",
    recipientWallet: "Recipient's Wallet",
    selectRecipientWallet: "Select recipient's wallet",
    myReceivingWallet: "My Receiving Wallet",
    selectReceivingWallet: "Select wallet to receive",
    recipient: "Recipient",
    selectRecipient: "Select recipient",
    payer: "Payer",
    selectPayer: "Who should pay you?",
    category: "Category",
    selectCategory: "Select category",
    noteOptional: "Note (Optional)",
    notePlaceholder: "Add a note...",
    send: "Send",
    request: "Request",
    insufficientFunds: "Insufficient funds in the selected wallet.",
    walletInactive: "Selected wallet is inactive.",
    senderIsReceiver: "You cannot send money to yourself.",
    successSend: "Money sent successfully! 🎉",
    successRequest: "Money request sent! ⏳",
    selectWalletFirst: "Please select your wallet first.",
    fillRequired: "Please fill all required fields.",
    transfer: "Transfer",
    customization: "Customization",
    Youmustselect3features: "You must select 3 features",
    Youcanonlyselect3features: "You can only select 3 features",

    dailyPurchases: "Daily Purchases",
    ofDailyBudget: "OF DAILY BUDGET",
    editDailyBudget: "Edit Daily Budget",
    dailyBudget: "Daily Budget",
    setDailyLimit: "Set your daily spending limit",
    addPurchase: "Add Purchase",
    fieldRequired: "This field is required",
    purchaseAdded: "Purchase added successfully!",
    foodDrinks: "Food & Drinks",
    groceries: "Groceries",
    transport: "Transport",
    health: "Health",
    shopping: "Shopping",
    entertainment: "Entertainment",
    bills: "Bills",
    education: "Education",
    personalCare: "Personal Care",
    addNewPurchase: "Add New Purchase",
    fillAllFields: "Please fill all fields",
    success: "Success",
    totalExpenses: "Spent Today",
    deletePurchase: "Delete Purchase",
    updatedEveryHour: "Updated every hour",
    errorFetchingRates: "Error fetching rates",
    enterAmountInAnyCurrency: "Enter amount in any currency",
    items: "Items",
    noItemsInBundle: "No items in this bundle.",
    totalCost: "Total Cost",
    noBundlesFound: "No bundles found.",
    edit: "Edit",
    editBundle: "Edit Bundle",
    createNewBundle: "Create New Bundle",
    bundleName: "Bundle Name",
    bundleNamePlaceholder: "e.g., Morning Routine",
    cancelAdding: "Cancel Adding",
    addItemToBundle: "+ Add Item to Bundle",
    itemNamePlaceholder: "Item Name (e.g., Coffee)",
    price: "Price",
    confirmItem: "Confirm Item",
    updateBundle: "Update Bundle",
    confirmCreateBundle: "Confirm & Create Bundle",
    recurring: "RECURRING",
    manual: "MANUAL",
    myBundles: "My Bundles",
    editBudget: "Edit Budget",
    bundlesSubtitle:
      "Manage your recurring purchase sets and optimize your daily spending flow.",
    budgetWarningTitle: "Budget Warning! ⚠️",
    budgetWarningMessage:
      "You are about to exceed your daily budget. Do you really need this purchase? Every bit counts!",
    proceedAnyway: "Force Add",
    saveMyMoney: "Save My Money",
    remainingBudget: "Remaining",
    newTotalAfter: "New total will be",

    "goals.title": "Savings Goals",
    "goals.createTitle": "Create New Goal",
    "goals.editTitle": "Edit Goal",
    "goals.totalSaved": "Total Saved",
    "goals.goalName": "Goal Name",
    "goals.targetAmount": "Target Amount",
    "goals.currentAmount": "Current Amount",
    "goals.targetDate": "Target Date",
    "goals.currency": "Currency",
    "goals.contribute": "Contribute",
    "goals.addContribution": "Add Contribution",
    "goals.contributionAmount": "Contribution Amount",
    "goals.contributionReason": "Reason (Optional)",
    "goals.remaining": "remaining",
    "goals.deleteConfirm": "Are you sure you want to delete this goal?",
    "goals.deleteSuccess": "Goal deleted successfully",
    "goals.createSuccess": "Goal created successfully",
    "goals.updateSuccess": "Goal updated successfully",
    "goals.contributionSuccess": "Contribution added successfully",
    "goals.overallProgress": "Overall Progress",
    "goals.remainingToReachAllGoals": "remaining to reach all goals",
    "goals.searchPlaceholder": "Search goals by name",
    "goals.sortGoals": "Sort Goals",
    "goals.sort.progress": "Progress",
    "goals.sort.amountSaved": "Amount Saved",
    "goals.sort.soonestFirst": "Soonest first",
    "goals.sort.latestFirst": "Latest first",
    "goals.sort.lowestFirst": "Lowest first",
    "goals.sort.highestFirst": "Highest first",
    "goals.sort.ascending": "Ascending",
    "goals.sort.descending": "Descending",
    "goals.emptyTitle": "No goals yet",
    "goals.emptySubtext": "Tap + to create your first savings goal",
    "goals.emptySearchTitle": "No matching goals",
    "goals.emptySearchSubtext": "Try a different goal name.",
    "goals.deleteTitle": "Delete goal",
    "goals.contributionAddedTitle": "Contribution Added",
    "goals.goalDeletedTitle": "Goal Deleted",
    "goals.goalCreatedTitle": "Goal Created",
    "goals.goalUpdatedTitle": "Goal Updated",
    "goals.invalidCurrentAmount": "Current amount cannot be negative.",
    "goals.currentLessThanTarget": "Current amount must be less than the target amount.",
    "goals.titlePlaceholder": "e.g. Dream Vacation, New Car",
    "goals.datePlaceholder": "MM/DD/YYYY",
    "goals.progress": "Progress",
    "goals.amountSaved": "Amount Saved",
    "goals.selectWallet": "Select Wallet",
    "goals.loadingWallets": "Loading wallets...",
    "goals.noWalletsForCurrencyTitle": "No {{currency}} wallets found",
    "goals.noWalletsForCurrencySubtext": "Add {{currency}} balance to one of your wallets first.",
    "goals.noWalletsAvailableTitle": "No Wallets Available",
    "goals.noWalletsAvailableDescription": "You don't have any {{currency}} wallet with available balance. Add funds first, then try again.",
    "goals.invalidInputTitle": "Invalid Input",
    "goals.invalidContributionAmount": "Please enter a valid amount.",
    "goals.amountMustBeGreaterThanZero": "Amount must be greater than zero.",
    "goals.noWalletSelectedTitle": "No Wallet",
    "goals.selectWalletToContribute": "Please select a wallet to contribute from.",
    "goals.insufficientBalanceTitle": "Insufficient Balance",
    "goals.insufficientBalanceDescription": "\"{{wallet}}\" only has {{balance}} {{currency}}. Please enter a smaller amount.",
    "goals.exceedsGoalTitle": "Exceeds Goal",
    "goals.exceedsGoalDescription": "You only need {{remaining}} {{currency}} to complete this goal.",
    "goals.emptyWalletTitle": "Empty Wallet",
    "goals.emptyWalletDescription": "\"{{wallet}}\" has no {{currency}} balance.",
    "goals.remainingToReachGoal": "remaining to reach goal",
    "goals.goalReached": "Goal Reached",
    "goals.inProgress": "In Progress",
    "goals.hideContributionHistory": "Hide Contribution History",
    "goals.showContributionHistory": "Show Contribution History",
    "goals.yourContributions": "Your Contributions",
    "incomeSavings.title": "Income & Savings",
    "incomeSavings.addEntry": "Add Entry",
    "incomeSavings.editEntry": "Edit Entry",
    "incomeSavings.totalIncome": "Total Income",
    "incomeSavings.totalOutgoing": "Total Outgoing",
    "incomeSavings.sortBy": "Sort by",
    "incomeSavings.sortByDate": "Date",
    "incomeSavings.sortByAmount": "Amount",
    "incomeSavings.type": "Type",
    "incomeSavings.income": "Income",
    "incomeSavings.savings": "Savings",
    "incomeSavings.source": "Source",
    "incomeSavings.amount": "Amount",
    "incomeSavings.notes": "Notes",
    "incomeSavings.regularity": "Regularity",
    "incomeSavings.daily": "Daily",
    "incomeSavings.weekly": "Weekly",
    "incomeSavings.monthly": "Monthly",
    "incomeSavings.yearly": "Yearly",
    "incomeSavings.categories.salary": "Salary",
    "incomeSavings.categories.freelance": "Freelance",
    "incomeSavings.categories.loan": "Loan",
    "incomeSavings.categories.other": "Other",
    "incomeSavings.categories.investment": "Investment",
    "incomeSavings.categories.savings": "Savings",
    "incomeSavings.categories.debt": "Debt",
    "incomeSavings.entryTypes.receive": "Income",
    "incomeSavings.entryTypes.send": "Savings",
    "incomeSavings.deleteConfirm":
      "Are you sure you want to delete this entry?",
    "incomeSavings.deleteSuccess": "Entry deleted successfully",
    "incomeSavings.createSuccess": "Entry created successfully",
    "incomeSavings.updateSuccess": "Entry updated successfully",
    "incomeSavings.searchPlaceholder": "Search income sources",
    "incomeSavings.emptyTitle": "No income sources yet",
    "incomeSavings.emptySubtext": "Tap + to add salary, loan, or any regular source and assign it to a wallet.",
    "incomeSavings.emptySearchTitle": "No matching sources",
    "incomeSavings.emptySearchSubtext": "Try a different source name, wallet, or note.",
    "incomeSavings.deleteTitle": "Delete income source",
    "incomeSavings.deletePrompt": "Delete {{type}} source from {{wallet}}?",
    "incomeSavings.deletePromptGeneric": "Delete this income source?",
    "incomeSavings.noWalletsTitle": "No Wallets",
    "incomeSavings.noWalletsDescription": "Create a wallet first before adding a regular income source.",
    "incomeSavings.selectWalletTitle": "Select Wallet",
    "incomeSavings.selectWalletDescription": "Please select a wallet for this source.",
    "incomeSavings.invalidAmountTitle": "Invalid Amount",
    "incomeSavings.invalidAmountDescription": "Please enter a valid amount greater than zero.",
    "incomeSavings.addedTitle": "Saving Added",
    "incomeSavings.addedDescription": "Income source saved and wallet balance updated.",
    "incomeSavings.walletLabel": "Wallet",
    "incomeSavings.summaryRegularSources": "Regular Sources",
    "incomeSavings.summaryEstimatedMonthlyInflow": "Estimated monthly inflow",
    "incomeSavings.modal.addRegularSource": "Add Regular Source",
    "incomeSavings.modal.sourceType": "Source Type",
    "incomeSavings.modal.wallet": "Wallet",
    "incomeSavings.modal.regularity": "Regularity",
    "incomeSavings.modal.currency": "Currency",
    "incomeSavings.modal.amount": "Amount",
    "incomeSavings.modal.notesOptional": "Notes (Optional)",
    "incomeSavings.modal.notesPlaceholder": "e.g. Main monthly salary",
    "incomeSavings.modal.saving": "Saving...",
    "incomeSavings.modal.saveAndAddBalance": "Save & Add Balance",
    addMoney: "Add money",
    spendMoney: "Spend money",
    availableBalance: "Available",
    currency: "Currency",
    reasonPlaceholder: "Why?",
    saving: "Saving...",
    confirm: "Confirm",
    history: "History",
    noHistory: "No activity yet.",
    noResults: "No matching users found.",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",
  },
  ar: {
    editBudget: "تعديل الميزانية",
    appName: "MonoPay",
    home: "الرئيسية",
    explore: "استكشاف",
    wallets: "المحافظ",
    refreshNow: "تحديث الآن",
    walletManagement: "إدارة المحافظ",
    myWallets: "محافظي",
    addWallet: "إضافة محفظة",
    yourWallets: "محافظك",
    noWalletsYet: "لا توجد محافظ بعد",
    tapPlusToAddFirstWallet: "اضغط على زر + لإضافة أول محفظة لك.",
    walletDetails: "تفاصيل المحفظة",
    walletName: "الاسم",
    walletNamePlaceholder: "المحفظة الرئيسية",
    walletType: "نوع المحفظة",
    walletTypeReal: "حقيقية",
    walletTypeCredit: "ائتمان",
    walletTypeShared: "مشتركة",
    walletStatus: "الحالة",
    walletExpiry: "تاريخ الانتهاء",
    walletOwner: "المالك",
    walletMembers: "الأعضاء",
    walletCurrencies: "العملات",
    balance: "الرصيد",
    members: "أعضاء",
    expShort: "انتهاء",
    active: "نشطة",
    inactive: "غير نشطة",
    pleaseSignIn: "يرجى تسجيل الدخول",
    createWallet: "إنشاء محفظة",
    creating: "جاري الإنشاء...",
    initialBalances: "أرصدة البداية (اختياري)",
    chooseCardColor: "اختر لون البطاقة",
    chooseEmoji: "اختر رمزاً",
    addMembers: "إضافة أعضاء",
    searchByNameOrNumber: "ابحث بالاسم أو الرقم",
    deleteWallet: "حذف المحفظة",
    deleting: "جاري الحذف...",
    delete: "حذف",
    deleteWalletConfirmTitle: "حذف المحفظة",
    deleteWalletConfirmMessage: "هل أنت متأكد أنك تريد حذف",
    mainWalletNotFound: "لم يتم العثور على المحفظة الرئيسية",
    cannotDeleteMainWallet: "لا يمكنك حذف المحفظة الرئيسية",
    walletNotFound: "لم يتم العثور على المحفظة",
    onlyOwnerCanDelete: "فقط المالك يمكنه حذف هذه المحفظة المشتركة",
    walletNameRequired: "اسم المحفظة مطلوب",
    invalidExpiry: "تاريخ انتهاء غير صحيح (MM/YY)",
    invalidAmount: "قيمة غير صحيحة",
    duplicateCurrency: "عملة مكررة",
    approve: "قبول",
    settings: "الإعدادات",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    pin: "الرقم السري",
    confirmPin: "تأكيد الرقم السري",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    address: "العنوان",
    idNumber: "رقم الهوية",
    continue: "متابعة",
    login: "دخول",
    noAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    scanYourId: "امسح الهوية",
    idScanHint: "ضع الهوية داخل الإطار",
    takeSelfie: "التقط صورة سيلفي",
    selfieHint: "ضع وجهك داخل الشكل البيضاوي",
    capture: "التقاط",
    retake: "إعادة",
    usePhoto: "استخدام الصورة",
    welcome: "مرحباً",
    accountPending: "حسابك قيد المراجعة",
    pendingDescription: "سنقوم بإبلاغك عند قبول الحساب.",
    editProfile: "تعديل الملف الشخصي",
    account: "الحساب",
    paymentMethods: "طرق الدفع",
    categories: "الفئات",
    allCategories: "جميع الفئات",
    searchCategories: "ابحث عن فئة...",
    addCustomCategory: "أضف فئة مخصصة",
    customCategoryPlaceholder: "اسم الفئة الجديدة",
    done: "تم",
    add: "إضافة",
    preferences: "التفضيلات",
    notifications: "الإشعارات",
    darkMode: "الوضع الداكن",
    securityPrivacy: "الأمان والخصوصية",
    changePassword: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
    retakePhoto: "إعادة التقاط الصورة",
    save: "حفظ",
    saved: "تم الحفظ",
    next: "التالي",
    logoutConfirmTitle: "تسجيل الخروج",
    logoutConfirmMessage: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    logout: "تسجيل الخروج",
    error: "خطأ",
    failedToSignIn: "فشل تسجيل الدخول",
    captureFailed: "فشل التقاط الصورة",
    missingSignupData: "بيانات التسجيل غير مكتملة",
    invalidEmail: "البريد الإلكتروني غير صحيح",
    invalidIdNumber: "رقم الهوية غير صحيح",
    pinMismatch: "الرقم السري غير متطابق",
    pinTooShort: "الرقم السري يجب أن يكون 6 أرقام على الأقل",
    required: "هذا الحقل مطلوب",
    uploadFailed: "فشل الرفع، حاول مرة أخرى",
    cameraPermissionNeeded: "مطلوب إذن الكاميرا",
    approveUsers: "قبول المستخدمين",
    pendingVerification: "بانتظار التحقق",
    noPendingUsers: "لا يوجد مستخدمون بانتظار القبول",
    usersWithType0: "سيظهر هنا المستخدمون من النوع 0.",
    name: "الاسم",
    phone: "الهاتف",
    identityNumberLabel: "رقم الهوية",
    personal: "شخصي",
    identity: "هوية",
    approveAction: "قبول",
    rejectAction: "رفض",
    approveUserTitle: "قبول المستخدم",
    rejectUserTitle: "رفض المستخدم",
    cancel: "إلغاء",
    advertisement: "إعلان",
    goodEvening: "مساء الخير",
    welcomeBack: "مرحباً بعودتك،",
    quickActions: "الإجراءات السريعة",
    savingGoals: "أهداف التوفير",
    insights: "الإحصائيات",
    cards: "البطاقات",
    more: "المزيد",
    totalBalance: "الرصيد الكلي",
    income: "الدخل",
    expenses: "المصروفات",
    features: "الميزات",
    myCards: "بطاقاتي",
    myCardsSubtitle: "إدارة بطاقات الائتمان والخصم",
    exchangeRates: "أسعار الصرف",
    exchangeRatesSubtitle: "عرض أسعار صرف العملات في الوقت الفعلي",
    spendingInsights: "الإحصائيات",
    spendingInsightsSubtitle: "تتبع إنفاقك حسب الفئة",
    regularSavings: "الادخار المنتظم",
    regularSavingsSubtitle: "خطط وتابع الادخار الدوري",
    transactions: "المعاملات",
    sendMoneyPage: "إرسال مال",
    sendMoneySubtitle: "حوّل أموالاً لمستخدم آخر",
    requestMoneyPage: "طلب مال",
    requestMoneySubtitle: "اطلب دفعاً من شخص آخر",
    requestsPage: "الطلبات",
    requestsSubtitle: "مراجعة الطلبات الواردة والصادرة",
    scanQr: "مسح QR",
    scanQrSubtitle: "ادفع مباشرة من خلال مسح الرمز",
    myQr: "QR الخاص بي",
    myQrSubtitle: "اعرض رمزك لاستلام المال",
    settingsSubtitle: "إدارة تفضيلات حسابك",
    changeLanguage: "تغيير اللغة",
    changePercent: " من الشهر الماضي",
    makeTransaction: "إجراء معاملة",
    sendMoney: "إرسال",
    receiveMoney: "طلب",
    amount: "المبلغ",
    myWallet: "محفظتي",
    selectMyWallet: "اختر محفظتك",
    recipientWallet: "محفظة المستلم",
    selectRecipientWallet: "اختر محفظة المستلم",
    myReceivingWallet: "محفظة الاستقبال",
    selectReceivingWallet: "اختر محفظة للاستقبال",
    recipient: "المستلم",
    selectRecipient: "اختر المستلم",

    payer: "الدافع",
    selectPayer: "من سيدفع؟",
    category: "الفئة",
    selectCategory: "اختر الفئة",
    noteOptional: "ملاحظة (اختياري)",
    notePlaceholder: "أضف ملاحظة...",
    send: "إرسال",
    request: "طلب",
    insufficientFunds: "الرصيد غير كافٍ في المحفظة المختارة.",
    walletInactive: "المحفظة المختارة غير نشطة.",
    senderIsReceiver: "لا يمكنك إرسال المال لنفسك.",
    successSend: "تم إرسال المال بنجاح! 🎉",
    successRequest: "تم إرسال طلب الأموال! ⏳",
    selectWalletFirst: "الرجاء اختيار محفظتك أولاً.",
    fillRequired: "الرجاء ملء جميع الحقول المطلوبة.",
    transfer: "التحويل",
    customization: "التخصيص",
    Youmustselect3features: "يجب اختيار 3 عناصر فقط",
    Youcanonlyselect3features: "يجب اختيار 3 عناصر فقط",
    dailyPurchases: "المشتريات اليومية",
    ofDailyBudget: "من الميزانية اليومية",
    editDailyBudget: "تعديل الميزانية اليومية",
    dailyBudget: "الميزانية اليومية",
    setDailyLimit: "حدد حد الإنفاق اليومي",
    addPurchase: "إضافة عملية شراء",
    fieldRequired: "هذا الحقل مطلوب",
    purchaseAdded: "تمت إضافة عملية الشراء بنجاح!",
    foodDrinks: "طعام ومشروبات",
    groceries: "بقالة",
    transport: "مواصلات",
    health: "صحة",
    shopping: "تسوق",
    entertainment: "ترفيه",
    bills: "فواتير",
    education: "تعليم",
    personalCare: "عناية شخصية",
    addNewPurchase: "إضافة مصروف جديد",
    fillAllFields: "الرجاء ملء جميع الحقول",
    success: "تم بنجاح",
    totalExpenses: "إجمالي المصروفات",
    deletePurchase: "حذف المصروف",
    updatedEveryHour: "يتم التحديث كل ساعة",
    errorFetchingRates: "خطأ في جلب الأسعار",
    enterAmountInAnyCurrency: "أدخل المبلغ بأي عملة",
    items: "العناصر",
    noItemsInBundle: "لا توجد عناصر في هذه الحزمة.",
    totalCost: "التكلفة الإجمالية",
    noBundlesFound: "لم يتم العثور على حزم.",
    edit: "تعديل",
    editBundle: "تعديل الحزمة",
    createNewBundle: "إنشاء حزمة جديدة",
    bundleName: "اسم الحزمة",
    bundleNamePlaceholder: "مثال: روتين الصباح",
    cancelAdding: "إلغاء الإضافة",
    addItemToBundle: "+ إضافة عنصر للحزمة",
    itemNamePlaceholder: "اسم العنصر (مثال: قهوة)",
    price: "السعر",
    confirmItem: "تأكيد العنصر",
    updateBundle: "تحديث الحزمة",
    confirmCreateBundle: "تأكيد وإنشاء الحزمة",
    recurring: "متكرر",
    manual: "يدوي",
    myBundles: "حزمي الخاصة",
    bundlesSubtitle:
      "قم بإدارة مجموعات الشراء المتكررة وحسن تدفق الإنفاق اليومي الخاص بك.",
    budgetWarningTitle: "تنبيه الميزانية! ⚠️",
    budgetWarningMessage:
      "أنت على وشك تجاوز ميزانيتك اليومية. هل هذه العملية ضرورية حقاً؟ كل قرش يهم!",
    proceedAnyway: "إضافة على أي حال",
    saveMyMoney: "وفر أموالي",
    remainingBudget: "المتبقي",
    newTotalAfter: "سيكون الإجمالي الجديد",

    "goals.title": "أهداف التوفير",
    "goals.createTitle": "إنشاء هدف جديد",
    "goals.editTitle": "تعديل الهدف",
    "goals.totalSaved": "إجمالي المدخرات",
    "goals.goalName": "اسم الهدف",
    "goals.targetAmount": "المبلغ المستهدف",
    "goals.currentAmount": "المبلغ الحالي",
    "goals.targetDate": "تاريخ الانتهاء",
    "goals.currency": "العملة",
    "goals.contribute": "ساهم",
    "goals.addContribution": "إضافة مساهمة",
    "goals.contributionAmount": "مبلغ المساهمة",
    "goals.contributionReason": "السبب (اختياري)",
    "goals.remaining": "متبقي",
    "goals.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذا الهدف؟",
    "goals.deleteSuccess": "تم حذف الهدف بنجاح",
    "goals.createSuccess": "تم إنشاء الهدف بنجاح",
    "goals.updateSuccess": "تم تحديث الهدف بنجاح",
    "goals.contributionSuccess": "تمت إضافة المساهمة بنجاح",
    "goals.overallProgress": "التقدم الإجمالي",
    "goals.remainingToReachAllGoals": "متبقي للوصول إلى كل الأهداف",
    "goals.searchPlaceholder": "ابحث عن الأهداف بالاسم",
    "goals.sortGoals": "ترتيب الأهداف",
    "goals.sort.progress": "نسبة التقدم",
    "goals.sort.amountSaved": "المبلغ المدخر",
    "goals.sort.soonestFirst": "الأقرب أولًا",
    "goals.sort.latestFirst": "الأبعد أولًا",
    "goals.sort.lowestFirst": "الأقل أولًا",
    "goals.sort.highestFirst": "الأعلى أولًا",
    "goals.sort.ascending": "تصاعدي",
    "goals.sort.descending": "تنازلي",
    "goals.emptyTitle": "لا توجد أهداف بعد",
    "goals.emptySubtext": "اضغط + لإنشاء أول هدف توفير لك",
    "goals.emptySearchTitle": "لا توجد أهداف مطابقة",
    "goals.emptySearchSubtext": "جرّب اسم هدف مختلف.",
    "goals.deleteTitle": "حذف الهدف",
    "goals.contributionAddedTitle": "تمت إضافة مساهمة",
    "goals.goalDeletedTitle": "تم حذف الهدف",
    "goals.goalCreatedTitle": "تم إنشاء الهدف",
    "goals.goalUpdatedTitle": "تم تحديث الهدف",
    "goals.invalidCurrentAmount": "لا يمكن أن يكون المبلغ الحالي سالبًا.",
    "goals.currentLessThanTarget": "يجب أن يكون المبلغ الحالي أقل من المبلغ المستهدف.",
    "goals.titlePlaceholder": "مثال: رحلة الأحلام، سيارة جديدة",
    "goals.datePlaceholder": "MM/DD/YYYY",
    "goals.progress": "التقدم",
    "goals.amountSaved": "المبلغ المدخر",
    "goals.selectWallet": "اختر المحفظة",
    "goals.loadingWallets": "جارٍ تحميل المحافظ...",
    "goals.noWalletsForCurrencyTitle": "لم يتم العثور على محافظ {{currency}}",
    "goals.noWalletsForCurrencySubtext": "أضف رصيد {{currency}} إلى إحدى محافظك أولًا.",
    "goals.noWalletsAvailableTitle": "لا توجد محافظ متاحة",
    "goals.noWalletsAvailableDescription": "لا تملك أي محفظة {{currency}} برصيد متاح. أضف رصيدًا أولًا ثم حاول مرة أخرى.",
    "goals.invalidInputTitle": "إدخال غير صالح",
    "goals.invalidContributionAmount": "يرجى إدخال مبلغ صالح.",
    "goals.amountMustBeGreaterThanZero": "يجب أن يكون المبلغ أكبر من صفر.",
    "goals.noWalletSelectedTitle": "لا توجد محفظة",
    "goals.selectWalletToContribute": "يرجى اختيار محفظة للمساهمة منها.",
    "goals.insufficientBalanceTitle": "الرصيد غير كافٍ",
    "goals.insufficientBalanceDescription": "\"{{wallet}}\" يحتوي فقط على {{balance}} {{currency}}. يرجى إدخال مبلغ أقل.",
    "goals.exceedsGoalTitle": "يتجاوز الهدف",
    "goals.exceedsGoalDescription": "تحتاج فقط إلى {{remaining}} {{currency}} لإكمال هذا الهدف.",
    "goals.emptyWalletTitle": "محفظة فارغة",
    "goals.emptyWalletDescription": "\"{{wallet}}\" لا يحتوي على رصيد {{currency}}.",
    "goals.remainingToReachGoal": "متبقي للوصول إلى الهدف",
    "goals.goalReached": "تم تحقيق الهدف",
    "goals.inProgress": "قيد التنفيذ",
    "goals.hideContributionHistory": "إخفاء سجل المساهمات",
    "goals.showContributionHistory": "عرض سجل المساهمات",
    "goals.yourContributions": "مساهماتك",
    "incomeSavings.title": "الدخل والتوفير",
    "incomeSavings.addEntry": "إضافة إدخال",
    "incomeSavings.editEntry": "تعديل الإدخال",
    "incomeSavings.totalIncome": "إجمالي الدخل",
    "incomeSavings.totalOutgoing": "إجمالي المنصرف",
    "incomeSavings.sortBy": "ترتيب حسب",
    "incomeSavings.sortByDate": "التاريخ",
    "incomeSavings.sortByAmount": "المبلغ",
    "incomeSavings.type": "النوع",
    "incomeSavings.income": "دخل",
    "incomeSavings.savings": "توفير",
    "incomeSavings.source": "المصدر",
    "incomeSavings.amount": "المبلغ",
    "incomeSavings.notes": "ملاحظات",
    "incomeSavings.regularity": "الانتظام",
    "incomeSavings.daily": "يومي",
    "incomeSavings.weekly": "أسبوعي",
    "incomeSavings.monthly": "شهري",
    "incomeSavings.yearly": "سنوي",
    "incomeSavings.categories.salary": "راتب",
    "incomeSavings.categories.freelance": "عمل حر",
    "incomeSavings.categories.loan": "قرض",
    "incomeSavings.categories.other": "آخر",
    "incomeSavings.categories.investment": "استثمار",
    "incomeSavings.categories.savings": "توفير",
    "incomeSavings.categories.debt": "دين",
    "incomeSavings.entryTypes.receive": "دخل",
    "incomeSavings.entryTypes.send": "توفير",
    "incomeSavings.deleteConfirm": "هل أنت متأكد أنك تريد حذف هذا الإدخال؟",
    "incomeSavings.deleteSuccess": "تم حذف الإدخال بنجاح",
    "incomeSavings.createSuccess": "تم إنشاء الإدخال بنجاح",
    "incomeSavings.updateSuccess": "تم تحديث الإدخال بنجاح",
    "incomeSavings.searchPlaceholder": "ابحث في مصادر الدخل",
    "incomeSavings.emptyTitle": "لا توجد مصادر دخل بعد",
    "incomeSavings.emptySubtext": "اضغط + لإضافة راتب أو قرض أو أي مصدر منتظم وربطه بمحفظة.",
    "incomeSavings.emptySearchTitle": "لا توجد مصادر مطابقة",
    "incomeSavings.emptySearchSubtext": "جرّب اسم مصدر أو محفظة أو ملاحظة مختلفة.",
    "incomeSavings.deleteTitle": "حذف مصدر الدخل",
    "incomeSavings.deletePrompt": "حذف مصدر {{type}} من {{wallet}}؟",
    "incomeSavings.deletePromptGeneric": "حذف مصدر الدخل هذا؟",
    "incomeSavings.noWalletsTitle": "لا توجد محافظ",
    "incomeSavings.noWalletsDescription": "أنشئ محفظة أولًا قبل إضافة مصدر دخل منتظم.",
    "incomeSavings.selectWalletTitle": "اختر محفظة",
    "incomeSavings.selectWalletDescription": "يرجى اختيار محفظة لهذا المصدر.",
    "incomeSavings.invalidAmountTitle": "مبلغ غير صالح",
    "incomeSavings.invalidAmountDescription": "يرجى إدخال مبلغ صالح أكبر من صفر.",
    "incomeSavings.addedTitle": "تمت إضافة التوفير",
    "incomeSavings.addedDescription": "تم حفظ مصدر الدخل وتحديث رصيد المحفظة.",
    "incomeSavings.walletLabel": "المحفظة",
    "incomeSavings.summaryRegularSources": "المصادر المنتظمة",
    "incomeSavings.summaryEstimatedMonthlyInflow": "التدفق الشهري المتوقع",
    "incomeSavings.modal.addRegularSource": "إضافة مصدر منتظم",
    "incomeSavings.modal.sourceType": "نوع المصدر",
    "incomeSavings.modal.wallet": "المحفظة",
    "incomeSavings.modal.regularity": "الانتظام",
    "incomeSavings.modal.currency": "العملة",
    "incomeSavings.modal.amount": "المبلغ",
    "incomeSavings.modal.notesOptional": "ملاحظات (اختياري)",
    "incomeSavings.modal.notesPlaceholder": "مثال: الراتب الشهري الأساسي",
    "incomeSavings.modal.saving": "جارٍ الحفظ...",
    "incomeSavings.modal.saveAndAddBalance": "حفظ وإضافة الرصيد",
    addMoney: "إضافة مال",
    spendMoney: "إنفاق مال",
    availableBalance: "المتاح",
    currency: "العملة",
    reasonPlaceholder: "لماذا؟",
    saving: "جارٍ الحفظ...",
    confirm: "تأكيد",
    history: "السجل",
    noHistory: "لا يوجد نشاط بعد.",
    noResults: "لا يوجد مستخدمون مطابقون.",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.close": "إغلاق",
    "common.confirm": "تأكيد",
    "common.loading": "جارٍ التحميل...",
  },
};

export function getIsRtl(language: SupportedLanguage) {
  return language === "ar";
}
