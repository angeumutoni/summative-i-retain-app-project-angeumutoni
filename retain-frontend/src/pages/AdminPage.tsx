import { useState } from 'react';
import { Stack, Tab, Tabs, Typography } from '@mui/material';
import AdminInsightsPanel from '../components/AdminInsightsPanel';
import CategoryManager from '../components/CategoryManager';

type AdminTab = 'insights' | 'categories';

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('insights');

  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        Admin dashboard
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, value: AdminTab) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Platform insights" value="insights" />
        <Tab label="Categories" value="categories" />
      </Tabs>

      {tab === 'insights' ? <AdminInsightsPanel /> : <CategoryManager />}
    </Stack>
  );
}