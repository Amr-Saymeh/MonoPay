import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ref, update } from "firebase/database";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useI18n } from "@/hooks/use-i18n";
import { NotificationModal } from "@/src/features/transfer/components/NotificationModal";
import { WalletPicker } from "@/src/features/transfer/components/WalletPicker";
import { useUserWallets } from "@/src/features/transfer/hooks/useUserWallets";
import {
  approveRequest,
  rejectRequest,
} from "@/src/features/transfer/services/transferService";
import { CURRENCY_SYMBOLS } from "@/src/features/transfer/types";
import { db } from "@/src/firebaseConfig";
import { useAuth } from "@/src/providers/AuthProvider";

import { RequestCard } from "../components/RequestCard";
import { MoneyRequestItem, useMoneyRequests } from "../hooks/useMoneyRequests";

const STRINGS = {
  en: {
    title: "Requests",
    received: "Received",
    sent: "Sent",
    emptyReceived: "No requests received",
    emptySent: "No requests sent",
    emptySubReceived:
      "When someone requests money from you, it'll show up here.",
    emptySubSent: "Your sent requests will appear here.",
    approveTitle: "Approve Request",
    approveMsg: (name: string, amount: string) =>
      `Approve payment of ${amount} to ${name}?`,
    selectWallet: "Select wallet to pay from",
    confirm: "Confirm",
    cancel: "Cancel",
    rejectTitle: "Reject Request",
    rejectMsg: (name: string) => `Reject payment request from ${name}?`,
    cancelTitle: "Cancel Request",
    cancelMsg: "Cancel this money request?",
    success: "Done!",
    error: "Something went wrong. Please try again.",
    balance: "Your balance",
    required: "Required",
    insufficientBalance: "Insufficient balance in this wallet",
  },
  ar: {
    title: "الطلبات",
    received: "واردة",
    sent: "صادرة",
    emptyReceived: "لا توجد طلبات واردة",
    emptySent: "لا توجد طلبات صادرة",
    emptySubReceived: "عندما يطلب منك أحد مالاً ستظهر هنا.",
    emptySubSent: "طلباتك المرسلة ستظهر هنا.",
    approveTitle: "تأكيد الموافقة",
    approveMsg: (name: string, amount: string) =>
      `الموافقة على دفع ${amount} لـ ${name}؟`,
    selectWallet: "اختر المحفظة للدفع منها",
    confirm: "تأكيد",
    cancel: "إلغاء",
    rejectTitle: "رفض الطلب",
    rejectMsg: (name: string) => `رفض طلب المال من ${name}؟`,
    cancelTitle: "إلغاء الطلب",
    cancelMsg: "إلغاء هذا الطلب؟",
    success: "تمّ!",
    error: "حدث خطأ. حاول مرة أخرى.",
    balance: "رصيدك الحالي",
    required: "المطلوب",
    insufficientBalance: "رصيد غير كافٍ في هذه المحفظة",
  },
};

export default function RequestsScreen() {
  const { user } = useAuth();
  const CURRENT_USER_UID = user?.uid ?? "";

  const router = useRouter();
  const { language, isRtl } = useI18n();
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [actionLoading, setActionLoading] = useState(false);

  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [approveItem, setApproveItem] = useState<MoneyRequestItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const { received, sent, loading } = useMoneyRequests(CURRENT_USER_UID);
  const { wallets: myWallets, loading: walletsLoading } =
    useUserWallets(CURRENT_USER_UID);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: "received" | "sent") => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = (item: MoneyRequestItem) => {
    setApproveItem(item);
    setSelectedSlot(myWallets.find((w) => w.slotKey === "wallet1") ?? null);
  };

  const confirmApprove = async () => {
    if (!approveItem || !selectedSlot) return;
    setActionLoading(true);
    const result = await approveRequest({
      requestId: approveItem.id,
      payerUid: CURRENT_USER_UID,
      payerWalletSlotKey: selectedSlot.slotKey,
      requesterUid: approveItem.fromUserId,
      amount: approveItem.amount,
      currency: approveItem.currancy as any,
      category: approveItem.category,
      note: approveItem.note,
    });
    setActionLoading(false);
    setApproveItem(null);
    setSelectedSlot(null);
    if (result.success) {
      setNotif({ type: "success", msg: s.success });
    } else {
      setNotif({ type: "error", msg: s.error });
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = (item: MoneyRequestItem) => {
    Alert.alert(s.rejectTitle, s.rejectMsg(item.otherPartyName ?? ""), [
      { text: s.cancel, style: "cancel" },
      {
        text: s.rejectTitle,
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          const result = await rejectRequest(
            CURRENT_USER_UID,
            item.fromUserId,
            item.id,
          );
          setActionLoading(false);
          if (result.success) setNotif({ type: "success", msg: s.success });
          else setNotif({ type: "error", msg: s.error });
        },
      },
    ]);
  };

  // ── Cancel (sent) ─────────────────────────────────────────────────────────
  const handleCancel = (item: MoneyRequestItem) => {
    Alert.alert(s.cancelTitle, s.cancelMsg, [
      { text: s.cancel, style: "cancel" },
      {
        text: s.cancelTitle,
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          try {
            const now = Date.now();
            await update(ref(db), {
              [`users/${CURRENT_USER_UID}/moneyRequests/${item.id}/status`]:
                "cancelled",
              [`users/${CURRENT_USER_UID}/moneyRequests/${item.id}/decidedAt`]:
                now,
              [`users/${item.toUserId}/moneyRequests/${item.id}/status`]:
                "cancelled",
              [`users/${item.toUserId}/moneyRequests/${item.id}/decidedAt`]:
                now,
            });
            setNotif({ type: "success", msg: s.success });
          } catch {
            setNotif({ type: "error", msg: s.error });
          }
          setActionLoading(false);
        },
      },
    ]);
  };

  const data = activeTab === "received" ? received : sent;
  const isEmpty = !loading && data.length === 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />

        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={["#7C3AED", "#6D28D9", "#5B21B6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View
            style={[
              styles.headerRow,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            <Ionicons
              name={isRtl ? "arrow-forward" : "arrow-back"}
              size={24}
              color="white"
              onPress={() => router.back()}
            />
            <Text
              style={[
                styles.headerTitle,
                {
                  flex: 1,
                  marginLeft: isRtl ? 0 : 10,
                  marginRight: isRtl ? 10 : 0,
                },
              ]}
            >
              {s.title}
            </Text>
          </View>

          {/* ── Tab Bar ── */}
          <View
            style={[
              styles.tabBar,
              { flexDirection: isRtl ? "row-reverse" : "row" },
            ]}
          >
            {(["received", "sent"] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => switchTab(tab)}
                  activeOpacity={0.8}
                  style={[
                    styles.tabItem,
                    isActive && styles.tabItemActive,
                  ]}
                >
                  <Ionicons
                    name={tab === "received" ? "arrow-down-circle-outline" : "arrow-up-circle-outline"}
                    size={18}
                    color={isActive ? "#7C3AED" : "rgba(255,255,255,0.7)"}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      isActive && styles.tabTextActive,
                    ]}
                  >
                    {tab === "received" ? s.received : s.sent}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>

        {/* ── Content ── */}
        <View style={styles.contentContainer}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptySubText}>Loading...</Text>
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name={activeTab === "received" ? "notifications-off-outline" : "paper-plane-outline"}
                  size={48}
                  color="#C4B5FD"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === "received" ? s.emptyReceived : s.emptySent}
              </Text>
              <Text style={styles.emptySubText}>
                {activeTab === "received"
                  ? s.emptySubReceived
                  : s.emptySubSent}
              </Text>
            </View>
          ) : (
            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
              <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <RequestCard
                    item={item}
                    mode={activeTab}
                    language={language as "en" | "ar"}
                    isRtl={isRtl}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onCancel={handleCancel}
                  />
                )}
              />
            </Animated.View>
          )}
        </View>

        {/* ── Approve Bottom Sheet ── */}
        {approveItem && (
          <View style={styles.approveSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle}>
              <View style={styles.sheetHandleBar} />
            </View>

            <Text style={styles.approveTitle}>{s.approveTitle}</Text>
            <Text style={styles.approveMsg}>
              {s.approveMsg(
                approveItem.otherPartyName ?? "",
                `${CURRENCY_SYMBOLS[approveItem.currancy] ?? ""}${approveItem.amount.toFixed(2)}`,
              )}
            </Text>

            <Text style={styles.walletLabel}>{s.selectWallet}</Text>
            <WalletPicker
              label={s.selectWallet}
              placeholder={s.selectWallet}
              selectedSlot={selectedSlot}
              wallets={myWallets}
              loading={walletsLoading}
              onSelect={setSelectedSlot}
              isRtl={isRtl}
            />

            {/* Balance info */}
            {selectedSlot && approveItem && (() => {
              const currancy = approveItem.currancy;
              const balance =
                selectedSlot.wallet?.currancies?.[currancy] ?? 0;
              const hasEnough = balance >= approveItem.amount;
              const symbol =
                CURRENCY_SYMBOLS[currancy] ?? currancy.toUpperCase();

              return (
                <>
                  <View
                    style={[
                      styles.balanceBar,
                      {
                        backgroundColor: hasEnough ? "#ECFDF5" : "#FEF2F2",
                        flexDirection: isRtl ? "row-reverse" : "row",
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={[
                          styles.balanceLabel,
                          { color: hasEnough ? "#059669" : "#DC2626" },
                        ]}
                      >
                        {s.balance}
                      </Text>
                      <Text
                        style={[
                          styles.balanceAmount,
                          { color: hasEnough ? "#059669" : "#DC2626" },
                        ]}
                      >
                        {symbol}{balance.toFixed(2)}
                      </Text>
                    </View>
                    <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
                      <Text
                        style={[
                          styles.balanceLabel,
                          { color: hasEnough ? "#059669" : "#DC2626" },
                        ]}
                      >
                        {s.required}
                      </Text>
                      <Text
                        style={[
                          styles.balanceAmount,
                          { color: hasEnough ? "#059669" : "#DC2626" },
                        ]}
                      >
                        {symbol}{approveItem.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  {!hasEnough && (
                    <Text style={styles.insufficientText}>
                      {s.insufficientBalance}
                    </Text>
                  )}
                </>
              );
            })()}

            {/* Action buttons */}
            <View style={styles.approveActions}>
              <TouchableOpacity
                onPress={() => {
                  setApproveItem(null);
                  setSelectedSlot(null);
                }}
                style={styles.cancelActionBtn}
              >
                <Text style={styles.cancelActionText}>{s.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmApprove}
                disabled={
                  actionLoading ||
                  !selectedSlot ||
                  (() => {
                    if (!selectedSlot || !approveItem) return true;
                    const balance =
                      selectedSlot.wallet?.currancies?.[approveItem.currancy] ??
                      0;
                    return balance < approveItem.amount;
                  })()
                }
                style={[
                  styles.confirmActionBtn,
                  {
                    opacity: (() => {
                      if (actionLoading || !selectedSlot) return 0.5;
                      const balance =
                        selectedSlot.wallet?.currancies?.[
                          approveItem?.currancy ?? ""
                        ] ?? 0;
                      return balance < (approveItem?.amount ?? 0) ? 0.5 : 1;
                    })(),
                  },
                ]}
              >
                <LinearGradient
                  colors={["#7C3AED", "#6D28D9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmActionText}>
                    {actionLoading ? "..." : s.confirm}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <NotificationModal
        visible={!!notif}
        type={notif?.type ?? "success"}
        message={notif?.msg ?? ""}
        onDismiss={() => setNotif(null)}
        language={language as "en" | "ar"}
      />
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 8,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  tabBar: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
  },
  tabItem: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "white",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tabText: {
    fontWeight: "700",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: "#7C3AED",
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#F8F5FF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  approveSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  sheetHandle: {
    alignItems: "center",
    marginBottom: 16,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  approveTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  approveMsg: {
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 22,
  },
  walletLabel: {
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 13,
  },
  balanceBar: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceAmount: {
    fontWeight: "bold",
    fontSize: 15,
  },
  insufficientText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },
  approveActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelActionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelActionText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  confirmActionBtn: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmGradient: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmActionText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
