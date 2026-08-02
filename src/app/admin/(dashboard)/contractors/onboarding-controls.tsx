"use client";

import { useTransition } from "react";
import {
  updateOnboardingStatus,
  updateContractorTier,
  toggleLicenseVerified,
  toggleInsuranceVerified,
} from "@/app/actions/admin";
import {
  ONBOARDING_STATUSES,
  ONBOARDING_STATUS_LABELS,
  ONBOARDING_STATUS_COLORS,
  CONTRACTOR_TIERS,
  TIER_COLORS,
  type OnboardingStatus,
  type ContractorTier,
} from "@/lib/constants";

export function OnboardingStatusSelect({
  contractorId,
  status,
}: {
  contractorId: string;
  status: OnboardingStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => startTransition(() => updateOnboardingStatus(contractorId, e.target.value))}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${ONBOARDING_STATUS_COLORS[status]} disabled:opacity-60`}
    >
      {ONBOARDING_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ONBOARDING_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

export function TierSelect({ contractorId, tier }: { contractorId: string; tier: ContractorTier }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={tier}
      disabled={pending}
      onChange={(e) => startTransition(() => updateContractorTier(contractorId, e.target.value))}
      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${TIER_COLORS[tier]} disabled:opacity-60`}
    >
      {CONTRACTOR_TIERS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

export function VerifiedCheckbox({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-xs text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(e) => startTransition(() => onToggle(e.target.checked))}
        className="h-3.5 w-3.5 rounded border-slate-300"
      />
      {label}
    </label>
  );
}

export function LicenseVerifiedCheckbox({
  contractorId,
  verified,
}: {
  contractorId: string;
  verified: boolean;
}) {
  return (
    <VerifiedCheckbox
      label="License verified"
      checked={verified}
      onToggle={(next) => toggleLicenseVerified(contractorId, next)}
    />
  );
}

export function InsuranceVerifiedCheckbox({
  contractorId,
  verified,
}: {
  contractorId: string;
  verified: boolean;
}) {
  return (
    <VerifiedCheckbox
      label="Insurance verified"
      checked={verified}
      onToggle={(next) => toggleInsuranceVerified(contractorId, next)}
    />
  );
}
