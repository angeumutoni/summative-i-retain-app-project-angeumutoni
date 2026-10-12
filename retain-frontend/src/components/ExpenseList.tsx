import {
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
  } from '@mui/material';
  import { useTheme } from '@mui/material/styles';
  import DeleteIcon from '@mui/icons-material/Delete';
  import EditIcon from '@mui/icons-material/Edit';
  import VisibilityIcon from '@mui/icons-material/Visibility';
  import { PAYMENT_METHOD_LABELS } from '../types';
  import type { Expense } from '../types';
  import { formatCurrency, formatDate } from '../utils/format';
  
  interface ExpenseListProps {
    expenses: Expense[];
    onView: (expense: Expense) => void;
    onEdit: (expense: Expense) => void;
    onDelete: (expense: Expense) => void;
  }
  
  export default function ExpenseList({ expenses, onView, onEdit, onDelete }: ExpenseListProps) {
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
              <CardActions>
                <Button size="small" onClick={() => onView(expense)}>
                  View
                </Button>
                <Button size="small" onClick={() => onEdit(expense)}>
                  Edit
                </Button>
                <Button size="small" color="error" onClick={() => onDelete(expense)}>
                  Delete
                </Button>
              </CardActions>
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
              <TableCell align="right">Actions</TableCell>
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
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title="View details">
                    <IconButton aria-label={`View ${expense.title}`} onClick={() => onView(expense)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton aria-label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      aria-label={`Delete ${expense.title}`}
                      color="error"
                      onClick={() => onDelete(expense)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }