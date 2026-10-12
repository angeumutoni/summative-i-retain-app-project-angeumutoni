import {
    Card,
    CardContent,
    Chip,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
  } from '@mui/material';
  import { useTheme } from '@mui/material/styles';
  import { PAYMENT_METHOD_LABELS } from '../types';
  import type { Expense } from '../types';
  import { formatCurrency, formatDate } from '../utils/format';
  
  interface ExpenseListProps {
    expenses: Expense[];
  }
  
  export default function ExpenseList({ expenses }: ExpenseListProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
    if (isMobile) {
      return (
        <Stack spacing={1.5}>
          {expenses.map((expense) => (
            <Card key={expense._id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {expense.title}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {formatCurrency(expense.amount)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
                </Typography>
                <Chip label={expense.category.name} size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      );
    }
  
    return (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Payment method</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense._id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(expense.date)}</TableCell>
                <TableCell>{expense.title}</TableCell>
                <TableCell>
                  <Chip label={expense.category.name} size="small" />
                </TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[expense.paymentMethod]}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(expense.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }