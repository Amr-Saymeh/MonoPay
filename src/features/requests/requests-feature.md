# Requests Feature — Documentation

## Overview
صفحة `RequestsScreen` تتيح للمستخدم عرض وإدارة طلبات المال — سواء الواردة (عليه) أو الصادرة (منه).

---

## Access
- زر **Requests 🔔** في header صفحة Transfer
- لاحقاً: من الـ Home page مباشرة
- Route: `/requests`

---

## Database Structure

### Money Requests
يُكتب عند الطرفين معاً بنفس الـ ID عند إنشاء الطلب:

```json
"users/{uid}/moneyRequests/{requestId}": {
  "fromUserId": "...",     ← الطالب (من طلب المال)
  "toUserId": "...",       ← الدافع (من المطلوب منه)
  "amount": 100,
  "currancy": "nis",       ⚠️ typo intentional — matches DB schema
  "category": "bills",
  "note": "...",
  "status": "pending",
  "createdAt": 1772234889334,
  "decidedAt": 1772234999999
}
```

---

## Status Flow

```
                    ┌─────────────┐
                    │   pending   │
                    └──────┬──────┘
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         approved       rejected    cancelled
      (الدافع وافق)  (الدافع رفض)  (الطالب ألغى)
```

| Status | من يتحكم | يتغير الرصيد؟ |
|--------|----------|---------------|
| `pending` | — | ❌ |
| `approved` | الدافع | ✅ |
| `rejected` | الدافع | ❌ |
| `cancelled` | الطالب | ❌ |

> ⚠️ لا يمكن إلغاء طلب بعد ما صار `approved`

---

## Business Logic

### Received Tab (واردة)
```
أنا = الدافع (toUserId)
أشوف مين طالب مني مال

pending  → أقدر أوافق أو أرفض
approved → مكتملة، ما في أكشن
rejected → رفضتها، ما في أكشن
```

### Sent Tab (صادرة)
```
أنا = الطالب (fromUserId)
أشوف طلباتي اللي أرسلتها

pending  → أقدر أرفع الطلب
approved → مكتملة، ما في أكشن
rejected → رفضها الدافع، ما في أكشن
cancelled → ألغيتها أنا
```

---

## Actions

### Approve Request (موافقة)
```
1. الدافع يختار من أي محفظة يدفع (Bottom Sheet)
2. يظهر مقارنة الرصيد الحالي مقابل المطلوب:
   - رصيد كافٍ  → خلفية خضراء + زر التأكيد مفعّل
   - رصيد غير كافٍ → خلفية حمراء + رسالة تحذير + زر التأكيد معطّل
3. نفس منطق Send Money:
   - ينقص من محفظة الدافع المختارة
   - يزيد في main wallet (wallet1) للطالب
   - يُكتب transaction history عند الطرفين
4. status → "approved" + decidedAt عند الطرفين
```

### Reject Request (رفض)
```
1. تأكيد بـ Alert
2. status → "rejected" + decidedAt عند الطرفين
3. لا يتغير أي رصيد
```

### Cancel Request (إلغاء)
```
1. تأكيد بـ Alert
2. status → "cancelled" + decidedAt عند الطرفين
3. لا يتغير أي رصيد
4. متاح فقط لـ pending
```

---

## UI

### Color Coding
| Status | لون |
|--------|-----|
| pending | 🟡 أصفر `#D97706` |
| approved | 🟢 أخضر `#059669` |
| rejected | 🔴 أحمر `#DC2626` |
| cancelled | ⚫ رمادي `#6B7280` |

### RequestCard
كل بطاقة تحتوي:
- Avatar دائري بأحرف الاسم + لون تلقائي
- اسم الطرف الآخر + رقم هاتفه
- شريط ملون في الأعلى بلون الـ status
- المبلغ + العملة (كبير وبارز)
- أيقونة الفئة
- الملاحظة (إن وجدت)
- التاريخ
- أزرار الأكشن (حسب الـ status والـ tab)

---

## Files Structure

```
src/features/requests/
├── components/
│   └── RequestCard.tsx       ← بطاقة الطلب الواحد
├── hooks/
│   └── useMoneyRequests.ts   ← جلب الطلبات realtime + enrich بالأسماء
└── screens/
    └── RequestsScreen.tsx    ← الصفحة الرئيسية

app/
└── requests.tsx              ← route entry point
```

---

## Hooks

### useMoneyRequests(currentUid)
- يستمع لـ `users/{uid}/moneyRequests` بـ `onValue` (realtime)
- يجيب اسم ورقم الطرف الآخر من `users/{otherUid}`
- يرجع:
  - `received` → الطلبات اللي `toUserId === currentUid` مرتبة من الأحدث
  - `sent` → الطلبات اللي `fromUserId === currentUid` مرتبة من الأحدث
  - `loading` → boolean

---

## TODO
- [x] ربط Firebase Auth الحقيقي بدل `CURRENT_USER_UID` الثابت
- [x] Badge عدد الطلبات الـ pending على زر Requests في صفحة Transfer
- [x] فحص الرصيد قبل الموافقة مع رسالة واضحة
- [ ] إشعار push عند وصول طلب جديد
- [ ] إضافة زر وصول من الـ Home page