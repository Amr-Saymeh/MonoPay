import { get, push, ref, runTransaction, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";
import {
  ApproveRequestParams,
  MoneyRequest,
  RequestMoneyParams,
  SendMoneyParams,
  ServiceResult,
  TransactionRecord,
  TransferError,
  Wallet,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// يجيب الـ main wallet (wallet1) لأي مستخدم
async function getMainWalletId(userUid: string): Promise<number | null> {
  const snap = await get(ref(db, `users/${userUid}/userwallet/wallet1`));
  if (!snap.exists()) return null;
  const data = snap.val();
  return data.walletid ?? data.id ?? null;
}

// يجيب walletId لأي slotKey
async function getWalletIdBySlot(
  userUid: string,
  slotKey: string,
): Promise<number | null> {
  const snap = await get(ref(db, `users/${userUid}/userwallet/${slotKey}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  return data.walletid ?? data.id ?? null;
}

async function getWallet(walletKey: string): Promise<Wallet | null> {
  const snap = await get(ref(db, `wallets/${walletKey}`));
  return snap.exists() ? (snap.val() as Wallet) : null;
}

// يكتب transaction history للطرفين
async function writeTransactionHistory(
  senderUid: string,
  receiverUid: string,
  fromWalletKey: string,
  toWalletKey: string,
  record: Omit<
    TransactionRecord,
    "type" | "senderUid" | "receiverUid" | "fromWalletKey" | "toWalletKey"
  >,
): Promise<void> {
  const txId = push(ref(db, `users/${senderUid}/transaction history`)).key!;
  const base = {
    ...record,
    senderUid,
    receiverUid,
    fromWalletKey,
    toWalletKey,
  };

  await update(ref(db), {
    [`users/${senderUid}/transaction history/${txId}`]: {
      ...base,
      type: "send",
    },
    [`users/${receiverUid}/transaction history/${txId}`]: {
      ...base,
      type: "receive",
    },
  });
}

// ─── Send Money ──────────────────────────────────────────────────────────────
// المرسل يختار المستلم والمبلغ والعملة
// النظام يوصّل لـ main wallet للمستلم تلقائياً

export async function sendMoney(
  params: SendMoneyParams,
): Promise<ServiceResult> {
  const {
    senderUid,
    fromSlotKey,
    receiverUid,
    amount,
    currency,
    category,
    note,
  } = params;

  if (amount <= 0) return fail("INVALID_AMOUNT");
  if (senderUid === receiverUid) return fail("SENDER_IS_RECEIVER");

  try {
    // جيب main wallet للمرسل والمستلم
    const [senderWalletId, receiverWalletId] = await Promise.all([
      getWalletIdBySlot(senderUid, fromSlotKey), // المرسل يختار
      getMainWalletId(receiverUid), // المستلم دايماً main
    ]);

    if (senderWalletId === null) return fail("MAIN_WALLET_NOT_FOUND");
    if (receiverWalletId === null) return fail("MAIN_WALLET_NOT_FOUND");

    const senderWalletKey = `wallet${senderWalletId}`;
    const receiverWalletKey = `wallet${receiverWalletId}`;

    // تحقق من حالة المحافظ
    const [senderWallet, receiverWallet] = await Promise.all([
      getWallet(senderWalletKey),
      getWallet(receiverWalletKey),
    ]);

    if (!senderWallet || senderWallet.state !== "active")
      return fail("WALLET_INACTIVE");
    if (!receiverWallet || receiverWallet.state !== "active")
      return fail("WALLET_INACTIVE");

    // Atomic balance update
    let transactionError: TransferError | null = null;

    await runTransaction(
      ref(db, "wallets"),
      (wallets: Record<string, Wallet> | null) => {
        if (!wallets) return wallets;

        const sender = wallets[senderWalletKey];
        const receiver = wallets[receiverWalletKey];

        if (!sender || !receiver) {
          transactionError = "MAIN_WALLET_NOT_FOUND";
          return;
        }

        const senderBalance = sender.currancies?.[currency] ?? 0;
        if (senderBalance < amount) {
          transactionError = "INSUFFICIENT_FUNDS";
          return;
        }

        // طرح من المرسل
        if (!sender.currancies) sender.currancies = {};
        sender.currancies[currency] = senderBalance - amount;

        // إضافة للمستلم (إنشاء العملة إذا ما كانت موجودة)
        if (!receiver.currancies) receiver.currancies = {};
        receiver.currancies[currency] =
          (receiver.currancies[currency] ?? 0) + amount;

        return wallets;
      },
    );

    if (transactionError) return fail(transactionError);

    // كتابة التاريخ للطرفين
    await writeTransactionHistory(
      senderUid,
      receiverUid,
      senderWalletKey,
      receiverWalletKey,
      {
        amount,
        currancy: currency,
        notes: note,
        category,
        "transaction date": Date.now(),
      },
    );

    return { success: true, data: undefined };
  } catch (e) {
    console.error("[transferService.sendMoney]", e);
    return fail("UNKNOWN");
  }
}

// ─── Request Money ───────────────────────────────────────────────────────────
// الطالب ينشئ طلب فقط — لا يتغير أي رصيد الآن

export async function requestMoney(
  params: RequestMoneyParams,
): Promise<ServiceResult> {
  const { requesterUid, payerUid, amount, currency, category, note } = params;

  if (amount <= 0) return fail("INVALID_AMOUNT");
  if (requesterUid === payerUid) return fail("SENDER_IS_RECEIVER");

  try {
    const moneyRequest: MoneyRequest = {
      fromUserId: requesterUid,
      toUserId: payerUid,
      amount,
      currancy: currency,
      note,
      category,
      status: "pending",
      createdAt: Date.now(),
    };

    // نفس الـ ID عند الطرفين عشان نقدر نربطهم لاحقاً
    const requestId = push(ref(db, `users/${payerUid}/moneyRequests`)).key!;

    await update(ref(db), {
      // عند الدافع — عشان يشوف مين طالب منه ويوافق أو يرفض
      [`users/${payerUid}/moneyRequests/${requestId}`]: moneyRequest,
      // عند الطالب — عشان يشوف طلباته وحالتها ويقدر يلغي
      [`users/${requesterUid}/moneyRequests/${requestId}`]: moneyRequest,
    });

    return { success: true, data: undefined };
  } catch (e) {
    console.error("[transferService.requestMoney]", e);
    return fail("UNKNOWN");
  }
}

// ─── Approve Request ─────────────────────────────────────────────────────────
// الدافع يوافق ويختار من أي محفظة يدفع (الافتراضي wallet1)

export async function approveRequest(
  params: ApproveRequestParams,
): Promise<ServiceResult> {
  const {
    requestId,
    payerUid,
    payerWalletSlotKey,
    requesterUid,
    amount,
    currency,
    category,
    note,
  } = params;

  try {
    // جيب محفظة الدافع (اللي اختارها) ومحفظة الطالب (main wallet)
    const [payerWalletId, requesterWalletId] = await Promise.all([
      getWalletIdBySlot(payerUid, payerWalletSlotKey),
      getMainWalletId(requesterUid),
    ]);

    if (payerWalletId === null) return fail("MAIN_WALLET_NOT_FOUND");
    if (requesterWalletId === null) return fail("MAIN_WALLET_NOT_FOUND");

    const payerWalletKey = `wallet${payerWalletId}`;
    const requesterWalletKey = `wallet${requesterWalletId}`;

    // Atomic balance update
    let transactionError: TransferError | null = null;

    await runTransaction(
      ref(db, "wallets"),
      (wallets: Record<string, Wallet> | null) => {
        if (!wallets) return wallets;

        const payer = wallets[payerWalletKey];
        const requester = wallets[requesterWalletKey];

        if (!payer || !requester) {
          transactionError = "MAIN_WALLET_NOT_FOUND";
          return;
        }

        if (payer.state !== "active") {
          transactionError = "WALLET_INACTIVE";
          return;
        }

        const payerBalance = payer.currancies?.[currency] ?? 0;
        if (payerBalance < amount) {
          transactionError = "INSUFFICIENT_FUNDS";
          return;
        }

        // طرح من الدافع
        if (!payer.currancies) payer.currancies = {};
        payer.currancies[currency] = payerBalance - amount;

        // إضافة للطالب (main wallet)
        if (!requester.currancies) requester.currancies = {};
        requester.currancies[currency] =
          (requester.currancies[currency] ?? 0) + amount;

        return wallets;
      },
    );

    if (transactionError) return fail(transactionError);

    const now = Date.now();

    // كتابة التاريخ للطرفين + تحديث status الطلب
    // ✅ استبدله بهذا
    await writeTransactionHistory(
      payerUid,
      requesterUid,
      payerWalletKey,
      requesterWalletKey,
      {
        amount,
        currancy: currency,
        notes: note,
        category,
        "transaction date": now,
      },
    );

    await update(ref(db), {
      [`users/${payerUid}/moneyRequests/${requestId}/status`]: "approved",
      [`users/${payerUid}/moneyRequests/${requestId}/decidedAt`]: now,
      [`users/${requesterUid}/moneyRequests/${requestId}/status`]: "approved",
      [`users/${requesterUid}/moneyRequests/${requestId}/decidedAt`]: now,
    });
    return { success: true, data: undefined };
  } catch (e) {
    console.error("[transferService.approveRequest]", e);
    return fail("UNKNOWN");
  }
}

// ─── Reject Request ──────────────────────────────────────────────────────────

export async function rejectRequest(
  payerUid: string,
  requesterUid: string,
  requestId: string,
): Promise<ServiceResult> {
  try {
    const now = Date.now();
    await update(ref(db), {
      [`users/${payerUid}/moneyRequests/${requestId}/status`]: "rejected",
      [`users/${payerUid}/moneyRequests/${requestId}/decidedAt`]: now,
      [`users/${requesterUid}/moneyRequests/${requestId}/status`]: "rejected",
      [`users/${requesterUid}/moneyRequests/${requestId}/decidedAt`]: now,
    });
    return { success: true, data: undefined };
  } catch (e) {
    console.error("[transferService.rejectRequest]", e);
    return fail("UNKNOWN");
  }
}

// ─── Utils ────────────────────────────────────────────────────────────────────
function fail(error: TransferError): ServiceResult {
  return { success: false, error };
}
