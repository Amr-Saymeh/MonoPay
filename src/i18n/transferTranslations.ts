// ─────────────────────────────────────────────────────────────────────────────
// هذا الملف بيحتوي على الـ keys الجديدة اللي لازم تضيفها على translations.ts
// ─────────────────────────────────────────────────────────────────────────────
//
// 1) أضف هاي الـ keys على TranslationKey type:
//
// | "makeTransaction"
// | "sendMoney"
// | "receiveMoney"
// | "amount"
// | "myWallet"
// | "selectMyWallet"
// | "recipientWallet"
// | "selectRecipientWallet"
// | "myReceivingWallet"
// | "selectReceivingWallet"
// | "recipient"
// | "selectRecipient"
// | "payer"
// | "selectPayer"
// | "category"
// | "selectCategory"
// | "noteOptional"
// | "notePlaceholder"
// | "send"
// | "request"
// | "insufficientFunds"
// | "walletInactive"
// | "senderIsReceiver"
// | "walletNotFound"
// | "invalidAmount"
// | "successSend"
// | "successRequest"
// | "selectWalletFirst"
// | "fillRequired"
// | "transfer"
//
// 2) أضف القيم على en وar objects:

export const transferTranslationsEN = {
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
  walletNotFound: "Wallet not found.",
  invalidAmount: "Please enter a valid amount.",
  successSend: "Money sent successfully! 🎉",
  successRequest: "Money request sent! ⏳",
  selectWalletFirst: "Please select your wallet first.",
  fillRequired: "Please fill all required fields.",
  transfer: "Transfer",
};

export const transferTranslationsAR = {
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
  walletNotFound: "المحفظة غير موجودة.",
  invalidAmount: "الرجاء إدخال مبلغ صحيح.",
  successSend: "تم إرسال المال بنجاح! 🎉",
  successRequest: "تم إرسال طلب الأموال! ⏳",
  selectWalletFirst: "الرجاء اختيار محفظتك أولاً.",
  fillRequired: "الرجاء ملء جميع الحقول المطلوبة.",
  transfer: "التحويل",
};
