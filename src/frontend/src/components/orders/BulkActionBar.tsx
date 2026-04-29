import { useState } from 'react'
import {
  Box, Button, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, LinearProgress, Typography, Alert, Snackbar,
} from '@mui/material'
import { BULK_ACTIONS, JOB_POLL_INTERVAL_MS, SNACKBAR_DURATION_MS, type BulkAction } from '../../constants'
import { bulkAction } from '../../api/orders'
import { getJob } from '../../api/jobs'
import { useQueryClient } from '@tanstack/react-query'
import type { Job } from '../../api/types'

interface Props {
  selectedIds: string[]
  onDone: () => void
}

export function BulkActionBar({ selectedIds, onDone }: Props) {
  const [action, setAction] = useState<BulkAction>('approve')
  const [open, setOpen] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const confirm = async () => {
    setJob(null)
    setJobId(null)
    const { jobId: id } = await bulkAction(selectedIds, action, `Bulk ${action}`)
    setJobId(id)

    const poll = async () => {
      const j = await getJob(id)
      setJob(j)
      if (j.status === 'processing') {
        setTimeout(poll, JOB_POLL_INTERVAL_MS)
      } else {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['stats'] })
        setSnackbar(`Done: ${j.progress.completed} succeeded, ${j.progress.failed} failed`)
        setOpen(false)
        onDone()
      }
    }
    poll()
  }

  const progress = job ? Math.round(((job.progress.completed + job.progress.failed) / job.progress.total) * 100) : 0

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {selectedIds.length} selected
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select value={action} onChange={(e) => setAction(e.target.value as BulkAction)} label="Action">
            {BULK_ACTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>

        <Button variant="contained" size="small" onClick={() => setOpen(true)}>
          Apply
        </Button>
      </Box>

      <Dialog open={open} onClose={() => !jobId && setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Bulk Action</DialogTitle>
        <DialogContent>
          {!jobId ? (
            <Typography>
              {action.charAt(0).toUpperCase() + action.slice(1)} {selectedIds.length} orders?
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" gutterBottom>
                {job?.status === 'processing' ? 'Processing...' : 'Complete'}
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
              {job && (
                <Typography variant="caption" color="text.secondary">
                  {job.progress.completed + job.progress.failed} / {job.progress.total}&nbsp;
                  ({job.progress.failed} failed)
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!jobId && (
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={confirm}>Confirm</Button>
            </>
          )}
          {job?.status !== 'processing' && jobId && (
            <Button onClick={() => { setOpen(false); setJobId(null); setJob(null) }}>Close</Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={SNACKBAR_DURATION_MS} onClose={() => setSnackbar(null)}>
        <Alert severity="info" onClose={() => setSnackbar(null)}>{snackbar}</Alert>
      </Snackbar>
    </>
  )
}