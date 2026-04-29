import { Card, CardContent, Typography, Grid, Chip, Box, Rating } from '@mui/material'
import type { Supplier } from '../../api/types'

interface Props {
  supplier: Supplier
}

export function SupplierInfo({ supplier }: Props) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{supplier.name}</Typography>
            <Typography variant="body2" color="text.secondary">{supplier.email}</Typography>
          </Box>
          <Chip label={supplier.active ? 'Active' : 'Inactive'} color={supplier.active ? 'success' : 'default'} />
        </Box>

        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Country</Typography>
            <Typography fontWeight={500}>{supplier.country}</Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Rating</Typography>
            <Box><Rating value={supplier.rating} max={5} precision={0.5} size="small" readOnly /></Box>
          </Grid>
          {supplier.order_count !== undefined && (
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Total Orders</Typography>
              <Typography fontWeight={500}>{supplier.order_count.toLocaleString()}</Typography>
            </Grid>
          )}
          {supplier.total_revenue !== undefined && (
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
              <Typography fontWeight={500}>${Number(supplier.total_revenue).toLocaleString()}</Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  )
}
