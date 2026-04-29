import { Card, CardContent, Typography, Grid, Chip, Box, Rating } from '@mui/material'
import type { Supplier } from '../../api/types'

interface Props {
  supplier: Supplier
}

export function SupplierInfo({ supplier }: Props) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ mb: 0.25 }}>{supplier.name}</Typography>
            <Typography variant="body2" color="text.secondary">{supplier.email}</Typography>
          </Box>
          <Chip label={supplier.active ? 'Active' : 'Inactive'} color={supplier.active ? 'success' : 'default'} />
        </Box>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>Country</Typography>
              <Typography sx={{ fontWeight: 500, mt: 0.25 }}>{supplier.country}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>Rating</Typography>
              <Box sx={{ mt: 0.25 }}><Rating value={supplier.rating} max={5} precision={0.5} size="small" readOnly /></Box>
            </Grid>
            {supplier.order_count !== undefined && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>Total Orders</Typography>
                <Typography
                  sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, fontSize: '1rem', mt: 0.25 }}
                >
                  {supplier.order_count.toLocaleString()}
                </Typography>
              </Grid>
            )}
            {supplier.total_revenue !== undefined && (
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}>Total Revenue</Typography>
                <Typography
                  sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 500, fontSize: '1rem', mt: 0.25, color: 'secondary.main' }}
                >
                  ${Number(supplier.total_revenue).toLocaleString()}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
