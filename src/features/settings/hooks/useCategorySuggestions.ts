import { useMemo } from "react";

import { useI18n } from "@/hooks/use-i18n";
import { getLocalizedSuggestions } from "@/src/features/settings/components/category-suggestions/data";
import { useAuth } from "@/src/providers/AuthProvider";
import { useSignupFlow } from "@/src/providers/SignupFlowProvider";
import { updateUserProfile } from "@/src/services/user.service";

import { getInitialSelectedCategories } from "../utils/categorySuggestions";

const EMPTY_CATEGORIES: string[] = [];

export function useCategorySuggestions() {
  const { language } = useI18n();
  const { user, profile, initializing, profileLoaded } = useAuth();
  const signup = useSignupFlow();

  const isSettingsMode = Boolean(user);
  const profileCategories = profile?.categories ?? EMPTY_CATEGORIES;
  const signupCategories = signup.categories;
  const localizedDefaults = useMemo(() => getLocalizedSuggestions(language), [language]);

  const initialSelected = useMemo(() => {
    return getInitialSelectedCategories({
      isSettingsMode,
      language,
      profileCategories,
      signupCategories,
    });
  }, [isSettingsMode, language, profileCategories, signupCategories]);

  const persistCategories = async (
    nextCategories: string[],
    options?: { silent?: boolean },
  ) => {
    if (!user) {
      signup.setCategories(nextCategories);
      return;
    }

    try {
      await updateUserProfile(user.uid, { categories: nextCategories });
    } catch (error) {
      if (options?.silent) {
        console.error("Failed to save categories:", error);
        return;
      }

      throw error;
    }
  };

  return {
    initialSelected,
    initializing,
    isSettingsMode,
    localizedDefaults,
    persistCategories,
    profileCategories,
    profileLoaded,
    signupCategories,
    signupDetails: signup.details,
  };
}