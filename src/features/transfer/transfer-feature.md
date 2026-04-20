# Transfer Feature — Documentation

## Overview

صفحة `MakeTransactionScreen` تتيح للمستخدم إرسال المال أو طلبه من مستخدم آخر داخل التطبيق.

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

> ⚠️ **typos intentional** — `currancy` و `transaction date` (بمسافة) متطابقة مع الـ DB schema الحالي.

---

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

```
1. المرسل يختار:
   - محفظته (أي محفظة عنده)
   - المستلم (من جهات الاتصال أو برقم الهاتف)
   - العملة (فقط العملات الموجودة في المحفظة المختارة)
   - المبلغ + فئة + ملاحظة

2. النظام يتحقق من:
   - الرصيد كافٍ في محفظة المرسل
   - المحفظة active
   - المستلم مختلف عن المرسل

3. عند النجاح:
   - ينقص الرصيد من محفظة المرسل
   - يزيد الرصيد في main wallet (wallet1) للمستلم
   - إذا العملة غير موجودة عند المستلم → تُنشأ تلقائياً
   - يُكتب transaction history عند الطرفين
```

### Request Money

```
1. الطالب يختار:
   - الدافع (من جهات الاتصال أو برقم الهاتف)
   - العملة + المبلغ + فئة + ملاحظة

2. النظام يكتب moneyRequest عند الطرفين بـ status: "pending"
   - لا يتغير أي رصيد الآن

3. الدافع لاحقاً يوافق أو يرفض (في صفحة الطلبات)
```

### Approve Request

```
1. الدافع يختار من أي محفظة يدفع (في صفحة الطلبات)
2. يظهر مقارنة الرصيد الحالي مقابل المطلوب:
   - رصيد كافٍ     → خلفية خضراء + زر التأكيد مفعّل
   - رصيد غير كافٍ → خلفية حمراء + رسالة تحذير + زر التأكيد معطّل
3. نفس منطق Send Money (atomic balance update)
4. يُكتب transaction history عند الطرفين
5. يُحدَّث status → "approved" عند الطرفين
```

### Reject Request

```
1. يُحدَّث status → "rejected" عند الطرفين
2. لا يتغير أي رصيد
```

---

## Wallet Logic

| الحالة          | من وين؟               | لوين؟                         |
| --------------- | --------------------- | ----------------------------- |
| Send Money      | محفظة المرسل المختارة | main wallet (wallet1) للمستلم |
| Approve Request | محفظة الدافع المختارة | main wallet (wallet1) للطالب  |

---

## Validations

| الحقل           | القاعدة                         |
| --------------- | ------------------------------- |
| المبلغ          | بين 1 و 9999 (4 خانات كحد أقصى) |
| NIS             | حد أقصى 5,000                   |
| JOD             | حد أقصى 1,000                   |
| USD             | حد أقصى 1,500                   |
| الخانات العشرية | رقمين كحد أقصى (مثلاً 20.50)    |
| الملاحظة        | 150 حرف كحد أقصى                |

---

## Files Structure

```
src/features/transfer/
├── components/
│   ├── AmountInput.tsx          ← إدخال المبلغ + اختيار العملة
│   ├── CategoryPicker.tsx       ← اختيار الفئة
│   ├── ConfirmBottomSheet.tsx   ← Bottom Sheet تأكيد العملية
│   ├── SegmentedControl.tsx     ← سويتش Send/Request
│   ├── UserPicker.tsx           ← اختيار المستخدم (جهات اتصال + بحث)
│   └── WalletPicker.tsx         ← اختيار المحفظة
├── hooks/
│   ├── useContactUsers.ts       ← جلب جهات الاتصال + مطابقة DB
│   ├── useRequestMoney.ts       ← hook لطلب المال
│   ├── useSendMoney.ts          ← hook لإرسال المال
│   └── useUserWallets.ts        ← جلب محافظ المستخدم
├── screens/
│   └── MakeTransactionScreen.tsx
├── services/
│   └── transferService.ts       ← كل منطق Firebase
└── types/
    └── index.ts
```

---

## TODO

- [x] ربط Firebase Auth الحقيقي بدل `CURRENT_USER_UID` الثابت
- [x] صفحة الطلبات (عرض + موافقة + رفض + إلغاء)
- [x] فحص الرصيد قبل الموافقة مع رسالة واضحة
- [x] Badge عدد الطلبات الـ pending على زر Requests
- [x] useUserWallets يستخدم onValue لتحديث الرصيد realtime
- [ ] الإشعارات عند الإرسال/الاستقبال
- [ ] NativeWind metro config (Windows Node v22 issue)
