import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ContactUser, useContactUsers } from "../hooks/useContactUsers";
import { AppUser } from "../types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  label: string;
  placeholder: string;
  selectedUser: AppUser | null;
  currentUserUid: string;
  onSelect: (user: AppUser) => void;
  isRtl?: boolean;
  language?: "en" | "ar";
}

// ─── Strings ──────────────────────────────────────────────────────────────────
const S = {
  en: {
    onApp: "On MonoPay",
    notOnApp: "Not on MonoPay",
    searchPlaceholder: "Search name or enter phone number...",
    noResults: "No contacts found",
    notRegistered: "This number is not registered on MonoPay",
    searching: "Searching...",
    permissionDenied: "Contacts permission denied — showing all users",
    sendAnyway: "Send to all users",
    phoneHint: "Enter a phone number to search",
    notOnAppMsg: "is not on MonoPay yet",
    invite: "Invite",
  },
  ar: {
    onApp: "على MonoPay",
    notOnApp: "غير مسجلين",
    searchPlaceholder: "ابحث بالاسم أو أدخل رقم الهاتف...",
    noResults: "لا نتائج",
    notRegistered: "هذا الرقم غير مسجل في MonoPay",
    searching: "جاري البحث...",
    permissionDenied: "تم رفض إذن جهات الاتصال — عرض كل المستخدمين",
    sendAnyway: "عرض كل المستخدمين",
    phoneHint: "أدخل رقم هاتف للبحث",
    notOnAppMsg: "ليس على MonoPay بعد",
    invite: "دعوة",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function isPhoneNumber(text: string): boolean {
  return /^[\d\s\-().+]{7,}$/.test(text.trim());
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  name,
  isOnApp,
  size = 40,
}: {
  name: string;
  isOnApp: boolean;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: isOnApp ? "#EDE9FE" : "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: isOnApp ? "#7C3AED" : "#9CA3AF",
          fontWeight: "bold",
          fontSize: size * 0.35,
        }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

// ─── UserRow ──────────────────────────────────────────────────────────────────
function UserRow({
  user,
  isSelected,
  onPress,
  isRtl,
}: {
  user: ContactUser | AppUser;
  isSelected: boolean;
  onPress: () => void;
  isRtl: boolean;
}) {
  const isContact = "isOnApp" in user;
  const isOnApp = isContact ? (user as ContactUser).isOnApp : true;
  const displayName = isContact
    ? (user as ContactUser).contactName
    : user.name;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isOnApp}
      activeOpacity={0.7}
      style={{
        flexDirection: isRtl ? "row-reverse" : "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        marginBottom: 4,
        backgroundColor: isSelected
          ? "#EDE9FE"
          : isOnApp
          ? "white"
          : "#F9FAFB",
        borderWidth: isSelected ? 1 : 0,
        borderColor: "#DDD6FE",
        opacity: isOnApp ? 1 : 0.5,
      }}
    >
      <Avatar name={displayName} isOnApp={isOnApp} />

      <View
        style={{
          flex: 1,
          marginLeft: isRtl ? 0 : 12,
          marginRight: isRtl ? 12 : 0,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            fontSize: 15,
            color: "#1F2937",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {displayName}
        </Text>
        {user.number ? (
          <Text
            style={{
              color: "#9CA3AF",
              fontSize: 12,
              textAlign: isRtl ? "right" : "left",
            }}
          >
            {String(user.number)}
          </Text>
        ) : null}
      </View>

      {/* Badge */}
      {isOnApp && (
        <View
          style={{
            backgroundColor: isSelected ? "#7C3AED" : "#F3F0FF",
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: isSelected ? "white" : "#7C3AED",
            }}
          >
            ✓
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function UserPicker({
  label,
  placeholder,
  selectedUser,
  currentUserUid,
  onSelect,
  isRtl = false,
  language = "en",
}: Props) {
  const s = S[language];
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [phoneSearchResult, setPhoneSearchResult] = useState<
    AppUser | "not_found" | "searching" | null
  >(null);

  const {
    onAppContacts,
    offAppContacts,
    loading,
    permissionDenied,
    searchByPhone,
  } = useContactUsers(currentUserUid);

  // ─── Search logic ──────────────────────────────────────────────────────────
  const handleSearchChange = async (text: string) => {
    setSearch(text);
    setPhoneSearchResult(null);

    if (!text.trim()) return;

    if (isPhoneNumber(text) && text.replace(/\D/g, "").length >= 7) {
      // بحث برقم هاتف
      setPhoneSearchResult("searching");
      const result = await searchByPhone(text);
      if (result && result.uid !== currentUserUid) {
        setPhoneSearchResult(result);
      } else {
        setPhoneSearchResult("not_found");
      }
    }
  };

  // ─── Filtered contacts ─────────────────────────────────────────────────────
  const filteredOnApp = search.trim() && !isPhoneNumber(search)
    ? onAppContacts.filter(
        (u) =>
          u.contactName.toLowerCase().includes(search.toLowerCase()) ||
          String(u.number ?? "").includes(search)
      )
    : onAppContacts;

  // ─── Select ────────────────────────────────────────────────────────────────
  const handleSelect = (user: AppUser) => {
    onSelect(user);
    setSearch("");
    setPhoneSearchResult(null);
    setVisible(false);
  };

  // ─── Render content ────────────────────────────────────────────────────────
  const renderContent = () => {
    if (loading) {
      return (
        <View style={{ paddingVertical: 40, alignItems: "center" }}>
          <ActivityIndicator color="#7C3AED" size="large" />
        </View>
      );
    }

    // حالة البحث برقم هاتف
    if (isPhoneNumber(search) && search.replace(/\D/g, "").length >= 7) {
      if (phoneSearchResult === "searching") {
        return (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}>
            <ActivityIndicator color="#7C3AED" />
            <Text style={{ color: "#9CA3AF" }}>{s.searching}</Text>
          </View>
        );
      }

      if (phoneSearchResult === "not_found") {
        return (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 40 }}>😕</Text>
            <Text
              style={{
                color: "#6B7280",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              {s.notRegistered}
            </Text>
            <Text style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
              {search}
            </Text>
          </View>
        );
      }

      if (phoneSearchResult && typeof phoneSearchResult === "object") {
        return (
          <View style={{ paddingTop: 8 }}>
            <SectionHeader text={s.onApp} />
            <UserRow
              user={{
                ...phoneSearchResult,
                contactName: phoneSearchResult.name,
                isOnApp: true,
              }}
              isSelected={selectedUser?.uid === phoneSearchResult.uid}
              onPress={() => handleSelect(phoneSearchResult as AppUser)}
              isRtl={isRtl}
            />
          </View>
        );
      }
    }

    // حالة إذن مرفوض
    if (permissionDenied) {
      return (
        <View>
          <View
            style={{
              backgroundColor: "#FEF3C7",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Text>⚠️</Text>
            <Text style={{ color: "#92400E", fontSize: 12, flex: 1 }}>
              {s.permissionDenied}
            </Text>
          </View>
          <FlatList
            data={onAppContacts}
            keyExtractor={(item) => item.uid}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <UserRow
                user={item}
                isSelected={selectedUser?.uid === item.uid}
                onPress={() => handleSelect(item)}
                isRtl={isRtl}
              />
            )}
          />
        </View>
      );
    }

    // قائمة جهات الاتصال الطبيعية
    return (
      <View>
        {/* على التطبيق */}
        {filteredOnApp.length > 0 && (
          <View>
            <SectionHeader text={s.onApp} />
            {filteredOnApp.map((user) => (
              <UserRow
                key={user.uid}
                user={user}
                isSelected={selectedUser?.uid === user.uid}
                onPress={() => handleSelect(user)}
                isRtl={isRtl}
              />
            ))}
          </View>
        )}

        {/* غير مسجلين */}
        {!search && offAppContacts.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <SectionHeader text={s.notOnApp} />
            {offAppContacts.slice(0, 5).map((user) => (
              <UserRow
                key={user.uid}
                user={user}
                isSelected={false}
                onPress={() => {}}
                isRtl={isRtl}
              />
            ))}
          </View>
        )}

        {/* مش لاقي نتائج */}
        {filteredOnApp.length === 0 && !isPhoneNumber(search) && search.trim() && (
          <View style={{ paddingVertical: 40, alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ color: "#9CA3AF" }}>{s.noResults}</Text>
            <Text style={{ color: "#C4B5FD", fontSize: 12 }}>
              {s.phoneHint}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* ── Trigger ── */}
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={{
          backgroundColor: "white",
          borderRadius: 16,
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: 16,
          height: 64,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {selectedUser ? (
          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar name={selectedUser.name} isOnApp size={36} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: "#1F2937",
                  fontWeight: "600",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {selectedUser.name}
              </Text>
              {selectedUser.number ? (
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 12,
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  {String(selectedUser.number)}
                </Text>
              ) : null}
            </View>
            <Text style={{ color: "#9CA3AF" }}>▾</Text>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#9CA3AF", fontSize: 15 }}>{placeholder}</Text>
            <Text style={{ color: "#9CA3AF" }}>▾</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Modal ── */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={{ backgroundColor: "white", borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2 }} />
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 8, paddingTop: 12 }}>
              {/* Title */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1F2937",
                  marginBottom: 16,
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {label}
              </Text>

              {/* Search Input */}
              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: "#9CA3AF", marginRight: isRtl ? 0 : 8, marginLeft: isRtl ? 8 : 0 }}>
                  🔍
                </Text>
                <TextInput
                  value={search}
                  onChangeText={handleSearchChange}
                  placeholder={s.searchPlaceholder}
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                  keyboardType="default"
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    color: "#1F2937",
                    fontSize: 15,
                    textAlign: isRtl ? "right" : "left",
                  }}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearch(""); setPhoneSearchResult(null); }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Content */}
              <View style={{ maxHeight: 380 }}>
                <FlatList
                  data={[]}
                  ListHeaderComponent={renderContent}
                  keyExtractor={() => "header"}
                  showsVerticalScrollIndicator={false}
                  renderItem={null}
                />
              </View>

              <View style={{ height: 20 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ text }: { text: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: "#9CA3AF",
        letterSpacing: 0.8,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 4,
        marginLeft: 4,
      }}
    >
      {text}
    </Text>
  );
}
