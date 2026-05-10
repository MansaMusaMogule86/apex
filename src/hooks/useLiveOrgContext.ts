"use client";

import { useMemo } from "react";

const DEV_ORG_FALLBACK = "00000000-0000-4000-8000-000000000001";

export function useLiveOrgContext() {
  const organizationId = useMemo(
    () => process.env.NEXT_PUBLIC_APEX_ORGANIZATION_ID ?? DEV_ORG_FALLBACK,
    [],
  );

  const workspaceByDomain = useMemo(
    () => ({
      home: process.env.NEXT_PUBLIC_APEX_WORKSPACE_HOME,
      market: process.env.NEXT_PUBLIC_APEX_WORKSPACE_MARKET,
      lead: process.env.NEXT_PUBLIC_APEX_WORKSPACE_LEAD,
      founder: process.env.NEXT_PUBLIC_APEX_WORKSPACE_FOUNDER,
      influence: process.env.NEXT_PUBLIC_APEX_WORKSPACE_INFLUENCE,
      reports: process.env.NEXT_PUBLIC_APEX_WORKSPACE_REPORTS,
      scenario: process.env.NEXT_PUBLIC_APEX_WORKSPACE_SCENARIO,
      recommendation: process.env.NEXT_PUBLIC_APEX_WORKSPACE_RECOMMENDATION,
    }),
    [],
  );

  return {
    organizationId,
    workspaceByDomain,
  };
}
