# Transfer Feature — Documentation

## Overview

ميزة `transfer` لم تعد تعتمد عملياً على `MakeTransactionScreen`.
الهيكلية الحالية مبنية على شاشتين منفصلتين:

- `SendMoneyScreen.tsx`
- `RequestMoneyScreen.tsx`

مع إعادة استخدام نفس:

- `components`
- `hooks`
- `transferService.ts`

كما أضيفت شاشتا:

- `TransactionHistoryScreen.tsx`
- `TransactionDetailScreen.tsx`

---

## Current Screens

### 1. `SendMoneyScreen.tsx`

شاشة إرسال المال الفعلية الحالية.

المستخدم يحدد:

- المحفظة
- المبلغ
- العملة
- المستلم
- الفئة
- الملاحظة

ثم:

```text
validation
→ ConfirmBottomSheet
→ useSendMoney.execute()
→ transferService.sendMoney()
→ NotificationModal
```

### 2. `RequestMoneyScreen.tsx`

شاشة طلب المال الفعلية الحالية.

المستخدم يحدد:

- الدافع
- المبلغ
- العملة
- الفئة
- الملاحظة

ثم:

```text
validation
→ ConfirmBottomSheet
→ useRequestMoney.execute()
→ transferService.requestMoney()
→ NotificationModal
```

### 3. `TransactionHistoryScreen.tsx`

تعرض كل العمليات الموجودة في:

```text
users/{uid}/transaction history
```

وتستخدم:

- `useTransactionHistory.ts`
- `TransactionCard.tsx`

### 4. `TransactionDetailScreen.tsx`

تعرض تفاصيل عملية واحدة:

- الطرف الآخر
- الفئة
- التاريخ
- الوقت
- الملاحظة

---

## Current Files Structure

```text
src/features/transfer/
├── components/
│   ├── AmountInput.tsx
│   ├── CategoryPicker.tsx
│   ├── ConfirmBottomSheet.tsx
│   ├── NotificationModal.tsx
│   ├── SegmentedControl.tsx
│   ├── SuccessModal.tsx
│   ├── TransactionCard.tsx
│   ├── UserPicker.tsx
│   └── WalletPicker.tsx
├── hooks/
│   ├── useAllUsers.ts
│   ├── useContactUsers.ts
│   ├── useRequestMoney.ts
│   ├── useSendMoney.ts
│   ├── useTransactionHistory.ts
│   └── useUserWallets.ts
├── screens/
│   ├── RequestMoneyScreen.tsx
│   ├── SendMoneyScreen.tsx
│   ├── TransactionDetailScreen.tsx
│   ├── TransactionHistoryScreen.tsx
│   └── MakeTransactionScreen.tsx   ← legacy / isolated / not used in current flow
├── services/
│   └── transferService.ts
└── types/
    └── index.ts
```

---

## Routes

```text
app/send-money.tsx            → SendMoneyScreen
app/request-money.tsx         → RequestMoneyScreen
app/transaction-history.tsx   → TransactionHistoryScreen
app/transaction-detail.tsx    → TransactionDetailScreen
app/transfer.tsx              → Redirect("/send-money")
```

الوصول من صفحة `More` يتم حالياً إلى:

- `/send-money`
- `/request-money`
- `/transaction-history`

وليس إلى `MakeTransactionScreen`.

---

## Database Structure

### Transaction History

يُكتب عند كل عملية ناجحة (إرسال أو موافقة على طلب) عند **الطرفين معاً** بنفس الـ ID:

```json
"users/{uid}/transaction history/{txId}": {
  "amount": 50,
  "currancy": "nis",
  "type": "send" | "receive",
  "senderUid": "...",
  "receiverUid": "...",
  "fromWalletKey": "wallet5",
  "toWalletKey": "wallet8",
  "category": "food",
  "notes": "كاسة شاي",
  "transaction date": 1772234889334
}
```

> `currancy` و`transaction date` و`transaction history` مفاتيح مقصودة ويجب الحفاظ عليها كما هي.

### Money Requests

يُكتب عند الطلب عند **الطرفين معاً** بنفس الـ ID:

```json
"users/{uid}/moneyRequests/{requestId}": {
  "fromUserId": "...",
  "toUserId": "...",
  "amount": 100,
  "currancy": "nis",
  "category": "bills",
  "note": "...",
  "status": "pending" | "approved" | "rejected" | "cancelled",
  "createdAt": 1772234889334,
  "decidedAt": 1772234999999
}
```

---

## Business Logic

### Send Money

```text
1. المرسل يختار المحفظة والمستلم والعملة والمبلغ والفئة والملاحظة
2. يتم التحقق من صحة البيانات في الشاشة
3. عند التأكيد:
   useSendMoney.execute()
   → transferService.sendMoney()
4. داخل service:
   - تحديد walletId من slot
   - تحديد main wallet للمستلم
   - runTransaction() ذري على wallets
   - writeTransactionHistory() للطرفين
```

### Request Money

```text
1. الطالب يختار الدافع والمبلغ والعملة والفئة والملاحظة
2. لا يحدث أي تغيير في الرصيد
3. عند التأكيد:
   useRequestMoney.execute()
   → transferService.requestMoney()
4. يكتب الطلب عند الطرفين بحالة pending
```

### Approve Request

```text
1. الدافع يختار المحفظة من RequestsScreen
2. approveRequest()
3. نفس نمط sendMoney:
   - atomic runTransaction
   - transaction history
   - status = approved
```

### Reject / Cancel

```text
rejectRequest()  → status = rejected
cancel request   → status = cancelled
```

ولا يتغير أي رصيد هنا.

---

## Wallet Logic

| الحالة | من أين؟ | إلى أين؟ |
|--------|---------|----------|
| Send Money | محفظة المرسل المختارة | `wallet1` للمستلم |
| Approve Request | محفظة الدافع المختارة | `wallet1` للطالب |

---

## Validations

| الحقل | القاعدة |
|------|---------|
| amount | أكبر من أو يساوي 1 |
| NIS | حد أقصى 5000 |
| USD | حد أقصى 1500 |
| JOD | حد أقصى 1000 |
| decimals | رقمين بعد الفاصلة |
| note | 150 حرفاً كحد أقصى |

---

## Shared UI Components

### `WalletPicker.tsx`
- اختيار المحفظة
- يعرض فقط المحافظ النشطة
- يعتمد على `useUserWallets`

### `AmountInput.tsx`
- إدخال المبلغ
- اختيار العملة
- تنظيف الإدخال قبل تمريره للفورم

### `UserPicker.tsx`
- اختيار المستخدم
- بحث بالاسم أو الرقم
- يستخدم `expo-contacts`
- يدعم fallback إلى مستخدمي التطبيق

### `CategoryPicker.tsx`
- اختيار الفئة
- modal grid

### `ConfirmBottomSheet.tsx`
- تأكيد العملية قبل التنفيذ
- مستخدم في الإرسال والطلب وQR

### `NotificationModal.tsx`
- يعرض:
  - أخطاء validation
  - أخطاء التنفيذ
  - رسائل النجاح

### `TransactionCard.tsx`
- بطاقة مختصرة لكل عملية في سجل المعاملات

---

## Hooks

### `useSendMoney.ts`
- يدير حالة الإرسال:
  - `loading`
  - `error`
  - `success`
- يستدعي `transferService.sendMoney()`

### `useRequestMoney.ts`
- يدير حالة إنشاء الطلب
- يستدعي `transferService.requestMoney()`

### `useUserWallets.ts`
- يربط بين:
  - `users/{uid}/userwallet`
  - و`wallets/{walletKey}`
- يعيد فقط المحافظ النشطة

### `useContactUsers.ts`
- يقرأ جهات الاتصال
- يطابقها مع مستخدمي MonoPay
- يدعم البحث برقم الهاتف

### `useTransactionHistory.ts`
- يستمع إلى `transaction history`
- يجلب اسم الطرف الآخر
- يرتب الأحدث أولاً

---

## React Hook Form Usage

الشاشتان الحاليتان:

- `SendMoneyScreen.tsx`
- `RequestMoneyScreen.tsx`

تستخدمان:

- `useForm`
- `Controller`
- `handleSubmit`
- `control`
- `errors`
- `useWatch`

الهدف:

- تنظيم إدارة الحقول
- validation أوضح
- ربط custom components مع الفورم بشكل احترافي

---

## Notes

- `MakeTransactionScreen.tsx` تعتبر الآن legacy screen
- لا يوجد اعتماد تشغيلي حالي عليها
- `app/transfer.tsx` يعمل redirect إلى `/send-money`
- يجب الحفاظ على quirks قاعدة البيانات:
  - `currancies`
  - `currancy`
  - `"transaction history"`
  - `"transaction date"`
  - `walletid ?? id`
