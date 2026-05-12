import { get, ref, update } from "firebase/database";

import { db } from "@/src/firebaseConfig";

import type { UserWalletLink, WalletRecord, WalletType } from "./types";
import { getNextUserWalletKey } from "./utils";

type CreateWalletInDbParams = {
  currentUserId: string;
  walletName: string;
  type: WalletType;
  expiryDate: string;
  emoji: string;
  color: string;
  currancies: Record<string, number>;
  selectedMemberUids: string[];
};

export async function createWalletInDb({
  currentUserId,
  walletName,
  type,
  expiryDate,
  emoji,
  color,
  currancies,
  selectedMemberUids,
}: CreateWalletInDbParams) {
  const walletsSnapshot = await get(ref(db, "wallets"));
  const wallets = (walletsSnapshot.val() ?? {}) as Record<string, WalletRecord>;

  const maxWalletId = Object.values(wallets).reduce((accumulator, wallet) => {
    const value = Number(wallet?.id);
    return Number.isFinite(value) ? Math.max(accumulator, value) : accumulator;
  }, 0);

  const newWalletId = maxWalletId + 1;
  const walletKey = `wallet${newWalletId}`;

  const userWalletsSnapshot = await get(ref(db, `users/${currentUserId}/userwallet`));
  const userWallets = (userWalletsSnapshot.val() ?? {}) as Record<string, UserWalletLink>;
  const userWalletKey = getNextUserWalletKey(userWallets);

  const sharedMembers =
    type === "shared"
      ? Array.from(new Set([currentUserId, ...selectedMemberUids.filter(Boolean)]))
      : [];

  const sharedMembersMap =
    type === "shared"
      ? sharedMembers.reduce((accumulator, uid) => {
          accumulator[uid] = true;
          return accumulator;
        }, {} as Record<string, true>)
      : undefined;

  const updates: Record<string, unknown> = {
    [`wallets/${walletKey}`]: {
      currancies,
      id: newWalletId,
      state: "active",
      type,
      ...(type === "credit" ? { expiryDate: expiryDate.trim() || undefined } : {}),
      ...(type === "shared" ? { ownerUid: currentUserId, members: sharedMembersMap } : {}),
    },
    [`users/${currentUserId}/userwallet/${userWalletKey}`]: {
      name: walletName,
      walletid: newWalletId,
      color,
      emoji,
    },
  };

  if (type === "shared") {
    for (const uid of sharedMembers) {
      if (uid === currentUserId) continue;

      const memberWalletsSnapshot = await get(ref(db, `users/${uid}/userwallet`));
      const memberWallets = (memberWalletsSnapshot.val() ?? {}) as Record<string, unknown>;
      const alreadyLinked = Object.values(memberWallets).some(
        (wallet: any) => Number(wallet?.walletid) === newWalletId,
      );

      if (!alreadyLinked) {
        const nextKey = getNextUserWalletKey(memberWallets);
        updates[`users/${uid}/userwallet/${nextKey}`] = {
          name: walletName,
          walletid: newWalletId,
          color,
          emoji,
        };
      }
    }
  }

  await update(ref(db), updates);

  return {
    newWalletId,
    walletKey,
    userWalletKey,
  };
}
