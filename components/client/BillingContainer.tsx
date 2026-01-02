// BillingContainer.tsx
import { PRICING_PLANS } from '@/constants';
import React, { useState } from 'react';
import { BillingView } from '../BillingView';
import { UpgradeRequestPage } from './UpgradeRequestPage';

type PageState =
  | { page: 'billing' }
  | { page: 'upgrade'; planId: string };

export const BillingContainer: React.FC = () => {
  const [state, setState] = useState<PageState>({ page: 'billing' });

  if (state.page === 'upgrade') {
    return (
      <UpgradeRequestPage
        planId={state.planId}       // <-- pass planId, not plan object
        onBack={() => setState({ page: 'billing' })}
      />
    );
  }

  return (
    <BillingView
      onOpenReport={() => {
        console.log('Open billing report');
      }}
      onRequestUpgrade={(planId: string) => {
        setState({ page: 'upgrade', planId }); // <-- only planId
      }}
    />
  );
};
