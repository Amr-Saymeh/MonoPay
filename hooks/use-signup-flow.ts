import { useSignupFlow } from '@/src/providers/SignupFlowProvider';

export function useSignup() {
  return useSignupFlow();
}
