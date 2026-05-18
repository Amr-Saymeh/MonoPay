import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ref, update } from "firebase/database";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useI18n } from "@/hooks/use-i18n";
import { useThemeMode } from "@/src/providers/ThemeModeProvider";
import { NotificationModal } from "@/src/features/transfer/components/NotificationModal";
import { WalletPicker } from "@/src/features/transfer/components/WalletPicker";
import {
  EnrichedWalletSlot,
  useUserWallets,
} from "@/src/features/transfer/hooks/useUserWallets";
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
    rejectConfirm: "Yes, Reject",
    cancelTitle: "Cancel Request",
    cancelMsg: "Cancel this money request?",
    cancelConfirm: "Yes, Cancel",
    success: "Done!",
    error: "Something went wrong. Please try again.",
    balance: "Your balance",
    required: "Required",
    insufficientBalance: "Insufficient balance in this wallet",
    requester: "Requester",
    from: "From Wallet",
    category: "Category",
    note: "Note",
    noNote: "No note",
    processing: "Processing...",
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
    rejectConfirm: "نعم، رفض",
    cancelTitle: "إلغاء الطلب",
    cancelMsg: "إلغاء هذا الطلب؟",
    cancelConfirm: "نعم، إلغاء",
    success: "تمّ!",
    error: "حدث خطأ. حاول مرة أخرى.",
    balance: "رصيدك الحالي",
    required: "المطلوب",
    insufficientBalance: "رصيد غير كافٍ في هذه المحفظة",
    requester: "صاحب الطلب",
    from: "من محفظة",
    category: "الفئة",
    note: "ملاحظة",
    noNote: "لا توجد ملاحظة",
    processing: "جاري المعالجة...",
  },
};

type ConfirmActionState =
  | { type: "reject"; item: MoneyRequestItem }
  | { type: "cancel"; item: MoneyRequestItem }
  | null;

export default function RequestsScreen() {
  const { user } = useAuth();
  const CURRENT_USER_UID = user?.uid ?? "";

  const router = useRouter();
  const { language, isRtl } = useI18n();
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";
  const s = STRINGS[language as "en" | "ar"] ?? STRINGS.en;

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [actionLoading, setActionLoading] = useState(false);

  const [notif, setNotif] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [approveItem, setApproveItem] = useState<MoneyRequestItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<EnrichedWalletSlot | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);

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
    // Pre-select the user's main wallet (wallet1) as the default payment source.
    setApproveItem(item);
    setSelectedSlot(myWallets.find((w) => w.slotKey === "wallet1") ?? null);
  };

  // Executes the actual money movement after the payer confirms their wallet choice.
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
    setConfirmAction({ type: "reject", item });
  };

  // ── Cancel (sent) ─────────────────────────────────────────────────────────
  const handleCancel = (item: MoneyRequestItem) => {
    setConfirmAction({ type: "cancel", item });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setActionLoading(true);

    if (confirmAction.type === "reject") {
      const result = await rejectRequest(
        CURRENT_USER_UID,
        confirmAction.item.fromUserId,
        confirmAction.item.id,
      );
      setActionLoading(false);
      setConfirmAction(null);
      if (result.success) setNotif({ type: "success", msg: s.success });
      else setNotif({ type: "error", msg: s.error });
      return;
    }

    try {
      const now = Date.now();
      await update(ref(db), {
        [`users/${CURRENT_USER_UID}/moneyRequests/${confirmAction.item.id}/status`]:
          "cancelled",
        [`users/${CURRENT_USER_UID}/moneyRequests/${confirmAction.item.id}/decidedAt`]:
          now,
        [`users/${confirmAction.item.toUserId}/moneyRequests/${confirmAction.item.id}/status`]:
          "cancelled",
        [`users/${confirmAction.item.toUserId}/moneyRequests/${confirmAction.item.id}/decidedAt`]:
          now,
      });
      setNotif({ type: "success", msg: s.success });
    } catch {
      setNotif({ type: "error", msg: s.error });
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const data = activeTab === "received" ? received : sent;
  const isEmpty = !loading && data.length === 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.root, isDark && styles.rootDark]}>
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
        <View style={[styles.contentContainer, isDark && styles.contentContainerDark]}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptySubText, isDark && styles.emptySubTextDark]}>Loading...</Text>
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconWrap, isDark && styles.emptyIconWrapDark]}>
                <Ionicons
                  name={activeTab === "received" ? "notifications-off-outline" : "paper-plane-outline"}
                  size={48}
                  color={isDark ? "#A78BFA" : "#C4B5FD"}
                />
              </View>
              <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
                {activeTab === "received" ? s.emptyReceived : s.emptySent}
              </Text>
              <Text style={[styles.emptySubText, isDark && styles.emptySubTextDark]}>
                {activeTab === "received" ? s.emptySubReceived : s.emptySubSent}
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
                    isDark={isDark}
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
        <ApproveRequestSheet
          visible={!!approveItem}
          item={approveItem}
          selectedSlot={selectedSlot}
          wallets={myWallets}
          walletsLoading={walletsLoading}
          loading={actionLoading}
          isRtl={isRtl}
          isDark={isDark}
          language={language as "en" | "ar"}
          strings={s}
          onSelect={setSelectedSlot}
          onConfirm={confirmApprove}
          onCancel={() => {
            setApproveItem(null);
            setSelectedSlot(null);
          }}
        />
      </View>

      <ActionConfirmModal
        visible={!!confirmAction}
        title={
          confirmAction?.type === "reject" ? s.rejectTitle : s.cancelTitle
        }
        message={
          confirmAction?.type === "reject"
            ? s.rejectMsg(confirmAction.item.otherPartyName ?? "")
            : s.cancelMsg
        }
        confirmLabel={
          confirmAction?.type === "reject" ? s.rejectConfirm : s.cancelConfirm
        }
        loading={actionLoading}
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeConfirmAction}
        language={language as "en" | "ar"}
      />

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

function ApproveRequestSheet({
  visible,
  item,
  selectedSlot,
  wallets,
  walletsLoading,
  loading,
  isRtl,
  isDark,
  language,
  strings,
  onSelect,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  item: MoneyRequestItem | null;
  selectedSlot: EnrichedWalletSlot | null;
  wallets: EnrichedWalletSlot[];
  walletsLoading: boolean;
  loading: boolean;
  isRtl: boolean;
  isDark: boolean;
  language: "en" | "ar";
  strings: (typeof STRINGS)["en"];
  onSelect: (slot: EnrichedWalletSlot) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (visible) bottomSheetRef.current?.expand();
    else bottomSheetRef.current?.close();
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={onCancel}
      />
    ),
    [onCancel],
  );

  if (!visible || !item) return null;

  const symbol = CURRENCY_SYMBOLS[item.currancy] ?? item.currancy.toUpperCase();
  const balance = selectedSlot?.wallet?.currancies?.[item.currancy] ?? 0;
  const hasEnough = balance >= item.amount;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enableDynamicSizing
      enablePanDownToClose
      onClose={onCancel}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={[
        styles.handleIndicator,
        isDark && styles.handleIndicatorDark,
      ]}
      backgroundStyle={[styles.sheetBg, isDark && styles.sheetBgDark]}
    >
      <BottomSheetView style={styles.sheetContainer}>
        <Text style={[styles.approveTitle, isDark && styles.approveTitleDark]}>
          {strings.approveTitle}
        </Text>

        <View style={[styles.amountCard, isDark && styles.amountCardDark]}>
          <Ionicons name="arrow-up-circle" size={28} color="#7C3AED" />
          <Text style={styles.amountText}>
            {symbol}
            {item.amount.toFixed(2)}
          </Text>
          <Text
            style={[styles.currencyLabel, isDark && styles.currencyLabelDark]}
          >
            {item.currancy.toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <SheetRow
            label={strings.requester}
            value={item.otherPartyName ?? "—"}
            sub={item.otherPartyNumber}
            icon="person-outline"
            isRtl={isRtl}
            isDark={isDark}
          />
          {selectedSlot && (
            <SheetRow
              label={strings.from}
              value={selectedSlot.slotName}
              icon="wallet-outline"
              isRtl={isRtl}
              isDark={isDark}
            />
          )}
          <SheetRow
            label={strings.category}
            value={item.category}
            icon="grid-outline"
            isRtl={isRtl}
            isDark={isDark}
          />
          <SheetRow
            label={strings.note}
            value={item.note.trim() || strings.noNote}
            muted={!item.note.trim()}
            icon="chatbubble-outline"
            isRtl={isRtl}
            isDark={isDark}
          />
        </View>

        <Text style={[styles.walletLabel, isDark && styles.walletLabelDark]}>
          {strings.selectWallet}
        </Text>
        <WalletPicker
          label={strings.selectWallet}
          placeholder={strings.selectWallet}
          selectedSlot={selectedSlot}
          wallets={wallets}
          loading={walletsLoading}
          onSelect={onSelect}
          isRtl={isRtl}
        />

        {selectedSlot && (
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
                  {strings.balance}
                </Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: hasEnough ? "#059669" : "#DC2626" },
                  ]}
                >
                  {symbol}
                  {balance.toFixed(2)}
                </Text>
              </View>
              <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
                <Text
                  style={[
                    styles.balanceLabel,
                    { color: hasEnough ? "#059669" : "#DC2626" },
                  ]}
                >
                  {strings.required}
                </Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    { color: hasEnough ? "#059669" : "#DC2626" },
                  ]}
                >
                  {symbol}
                  {item.amount.toFixed(2)}
                </Text>
              </View>
            </View>
            {!hasEnough && (
              <Text style={styles.insufficientText}>
                {strings.insufficientBalance}
              </Text>
            )}
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            style={[styles.cancelBtn, isDark && styles.cancelBtnDark]}
          >
            <Text
              style={[
                styles.cancelBtnText,
                isDark && styles.cancelBtnTextDark,
              ]}
            >
              {strings.cancel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading || !selectedSlot || !hasEnough}
            style={[
              styles.confirmBtnOuter,
              { opacity: loading || !selectedSlot || !hasEnough ? 0.5 : 1 },
            ]}
          >
            <LinearGradient
              colors={["#7C3AED", "#6D28D9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtnGradient}
            >
              {loading ? (
                <Text style={styles.confirmBtnText}>{strings.processing}</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.confirmBtnText}>{strings.confirm}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

function SheetRow({
  label,
  value,
  sub,
  isRtl,
  muted,
  icon,
  isDark,
}: {
  label: string;
  value: string;
  sub?: string;
  isRtl: boolean;
  muted?: boolean;
  icon?: string;
  isDark: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        isDark && styles.rowDark,
        { flexDirection: isRtl ? "row-reverse" : "row" },
      ]}
    >
      <View
        style={[
          styles.rowLeft,
          { flexDirection: isRtl ? "row-reverse" : "row" },
        ]}
      >
        {icon && (
          <View style={[styles.rowIcon, isDark && styles.rowIconDark]}>
            <Ionicons name={icon as any} size={16} color="#7C3AED" />
          </View>
        )}
        <Text style={[styles.rowLabel, isDark && styles.rowLabelDark]}>
          {label}
        </Text>
      </View>
      <View style={{ alignItems: isRtl ? "flex-start" : "flex-end", flex: 1 }}>
        <Text
          style={[
            styles.rowValue,
            isDark && styles.rowValueDark,
            muted && styles.rowValueMuted,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        {sub && <Text style={[styles.rowSub, isDark && styles.rowSubDark]}>{sub}</Text>}
      </View>
    </View>
  );
}

function ActionConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  loading,
  onCancel,
  onConfirm,
  language,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  language: "en" | "ar";
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useThemeMode();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [opacityAnim, scaleAnim, visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <Animated.View
          style={[
            styles.modalCard,
            isDark && styles.modalCardDark,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <Ionicons
            name="help-circle"
            size={72}
            color="#7C3AED"
            style={styles.modalIcon}
          />
          <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
            {title}
          </Text>
          <Text
            style={[
              styles.modalMessage,
              isDark && styles.modalMessageDark,
              { textAlign: language === "ar" ? "right" : "center" },
            ]}
          >
            {message}
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={[styles.modalCancelBtn, isDark && styles.modalCancelBtnDark]}
            >
              <Text
                style={[
                  styles.modalCancelText,
                  isDark && styles.modalCancelTextDark,
                ]}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={loading}
              style={[
                styles.modalConfirmOuter,
                { opacity: loading ? 0.6 : 1 },
              ]}
            >
              <LinearGradient
                colors={["#7C3AED", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>
                  {loading ? "..." : confirmLabel}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
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
  handleIndicator: { backgroundColor: "#DDD6FE", width: 40 },
  handleIndicatorDark: { backgroundColor: "rgba(255,255,255,0.2)" },
  sheetBg: { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetBgDark: { backgroundColor: "#1C1F2A" },
  sheetContainer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 36 },
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
  amountCard: {
    backgroundColor: "#F5F3FF",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  amountCardDark: {
    backgroundColor: "rgba(124,58,237,0.15)",
    borderColor: "rgba(124,58,237,0.3)",
  },
  amountText: {
    color: "#7C3AED",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 4,
  },
  currencyLabel: { color: "#9CA3AF", fontSize: 13 },
  currencyLabelDark: { color: "rgba(255,255,255,0.4)" },
  detailsContainer: { gap: 4, marginBottom: 20 },
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  rowDark: { borderBottomColor: "rgba(255,255,255,0.07)" },
  rowLeft: { alignItems: "center", gap: 8 },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIconDark: { backgroundColor: "rgba(124,58,237,0.2)" },
  rowLabel: { color: "#9CA3AF", fontSize: 13 },
  rowLabelDark: { color: "rgba(255,255,255,0.4)" },
  rowValue: { color: "#1F2937", fontWeight: "600", fontSize: 14 },
  rowValueDark: { color: "#E0E0E0" },
  rowValueMuted: { color: "#9CA3AF", fontStyle: "italic" },
  rowSub: { color: "#9CA3AF", fontSize: 12, marginTop: 1 },
  rowSubDark: { color: "rgba(255,255,255,0.35)" },
  walletLabel: {
    color: "#7C3AED",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 13,
  },
  walletLabelDark: { color: "#A78BFA" },
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
  actions: { flexDirection: "row", gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { color: "#6B7280", fontWeight: "600", fontSize: 16 },
  confirmBtnOuter: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  confirmBtnGradient: {
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalCardDark: { backgroundColor: "#1C1F2A" },
  modalIcon: { marginBottom: 16 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    textAlign: "center",
  },
  modalTitleDark: { color: "#E0E0E0" },
  modalMessage: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 28,
    textAlign: "center",
  },
  modalMessageDark: { color: "#E0E0E0" },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnDark: { backgroundColor: "rgba(255,255,255,0.08)" },
  modalCancelText: { color: "#6B7280", fontWeight: "600", fontSize: 16 },
  modalCancelTextDark: { color: "rgba(255,255,255,0.6)" },
  modalConfirmOuter: { flex: 1.4, borderRadius: 16, overflow: "hidden" },
  modalConfirmBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  modalConfirmText: { color: "white", fontWeight: "bold", fontSize: 16 },
  // ── Dark variants ──────────────────────────────────────────────────────────
  rootDark: { backgroundColor: "#0E1118" },
  contentContainerDark: { backgroundColor: "#0E1118" },
  emptyIconWrapDark: { backgroundColor: "rgba(139,92,246,0.15)" },
  emptyTitleDark: { color: "#E0E0E0" },
  emptySubTextDark: { color: "rgba(255,255,255,0.35)" },
  approveTitleDark: { color: "#E0E0E0" },
  approveMsgDark: { color: "rgba(255,255,255,0.5)" },
  cancelBtnDark: { backgroundColor: "rgba(255,255,255,0.08)" },
  cancelBtnTextDark: { color: "rgba(255,255,255,0.6)" },
});
