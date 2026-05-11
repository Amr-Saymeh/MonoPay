import { useEffect, useMemo } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createIncomeSourceAndFundWallet,
  deleteIncomeSource,
  subscribeIncomeSources,
  subscribeUserWalletLinks,
  subscribeWalletsByIds,
  type CreateIncomeSourceParams,
  type IncomeSource,
  type UserWalletLink,
  type WalletRecord,
} from "../services/incomeSavings.service";

export const incomeSourcesQueryKey = (userUid?: string) =>
  ["incomeSources", userUid] as const;

export const walletLinksQueryKey = (userUid?: string) =>
  ["incomeSavingsWalletLinks", userUid] as const;

export const walletsQueryKey = (walletIds: number[]) =>
  ["incomeSavingsWallets", walletIds.join(",")] as const;

export function useIncomeSourcesQuery(userUid?: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => incomeSourcesQueryKey(userUid), [userUid]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<IncomeSource[]>(queryKey) ?? [],
      ),
    enabled: Boolean(userUid),
    initialData: [] as IncomeSource[],
  });

  useEffect(() => {
    if (!userUid) {
      queryClient.setQueryData(queryKey, []);
      return;
    }

    return subscribeIncomeSources(userUid, (sources) => {
      queryClient.setQueryData(queryKey, sources);
    });
  }, [queryClient, queryKey, userUid]);

  return query;
}

export function useUserWalletLinksQuery(userUid?: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => walletLinksQueryKey(userUid), [userUid]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<Record<string, UserWalletLink>>(queryKey) ?? {},
      ),
    enabled: Boolean(userUid),
    initialData: {} as Record<string, UserWalletLink>,
  });

  useEffect(() => {
    if (!userUid) {
      queryClient.setQueryData(queryKey, {});
      return;
    }

    return subscribeUserWalletLinks(userUid, (links) => {
      queryClient.setQueryData(queryKey, links);
    });
  }, [queryClient, queryKey, userUid]);

  return query;
}

export function useWalletsByIdsQuery(walletIds: number[]) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => walletsQueryKey(walletIds), [walletIds]);

  const query = useQuery({
    queryKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<Record<string, WalletRecord>>(queryKey) ?? {},
      ),
    initialData: {} as Record<string, WalletRecord>,
  });

  useEffect(() => {
    return subscribeWalletsByIds(walletIds, (wallets) => {
      queryClient.setQueryData(queryKey, wallets);
    });
  }, [queryClient, queryKey, walletIds]);

  return query;
}

export function useCreateIncomeSourceMutation(userUid?: string) {
  return useMutation({
    mutationFn: (params: Omit<CreateIncomeSourceParams, "userUid">) => {
      if (!userUid) throw new Error("Missing user session");
      return createIncomeSourceAndFundWallet({ userUid, ...params });
    },
  });
}

export function useDeleteIncomeSourceMutation(userUid?: string) {
  return useMutation({
    mutationFn: (sourceId: string) => {
      if (!userUid) throw new Error("Missing user session");
      return deleteIncomeSource(userUid, sourceId);
    },
  });
}
