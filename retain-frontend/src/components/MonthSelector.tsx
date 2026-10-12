import { Button, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { currentMonthValue, formatMonth, shiftMonth } from '../utils/format';

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

export default function MonthSelector({ month, onChange }: MonthSelectorProps) {
  const isCurrent = month === currentMonthValue();

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <IconButton aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" component="span" sx={{ minWidth: 150, textAlign: 'center' }}>
        {formatMonth(month)}
      </Typography>
      <IconButton aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRightIcon />
      </IconButton>
      {!isCurrent && (
        <Button size="small" onClick={() => onChange(currentMonthValue())}>
          This month
        </Button>
      )}
    </Stack>
  );
}