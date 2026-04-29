import { Box, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

interface Props {
  message?: string
}

export function EmptyState({ message = 'No data found.' }: Props) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8} gap={1} color="text.secondary">
      <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
      <Typography variant="body1">{message}</Typography>
    </Box>
  )
}
