import React, { useState } from 'react';
import { BillingView } from '../BillingView';
import { BillingReport } from './BillingReport';
import { UpgradeRequestPage } from './UpgradeRequestPage';

type PageState =
  | { page: 'billing' }
  | { page: 'upgrade'; planId: string }
  | { page: 'report' }; 

export const BillingContainer: React.FC = () => {
  const [state, setState] = useState<PageState>({ page: 'billing' });

  // UPGRADE PAGE
  if (state.page === 'upgrade') {
    return (
      <UpgradeRequestPage
        planId={state.planId}
        onBack={() => setState({ page: 'billing' })}
      />
    );
  }

  // BILLING REPORT PAGE
  if (state.page === 'report') {
    return <BillingReport onBack={() => setState({ page: 'billing' })} />;
  }

  // BILLING VIEW PAGE
  return (
    <BillingView
      onOpenReport={() => setState({ page: 'report' })} // navigate to BillingReport
      onRequestUpgrade={(planId: string) => setState({ page: 'upgrade', planId })}
    />
  );
};
