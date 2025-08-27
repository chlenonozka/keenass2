import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../stores/root.store'
import {
  Alert, IconButton, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, Tooltip, Typography, Select, MenuItem, TableRow, Stack
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Loader from '../components/loader/Loader'
import { Row } from './AdminPage.styles'
import type { UserRole } from '../types'

const AdminPage = observer(() => {
  const { users, auth } = useRootStore()

  useEffect(() => {
    if (auth.isAdmin) users.fetch()
  }, [auth.isAdmin])

  if (!auth.isAdmin) return <Alert severity="warning">Эта страница только для администраторов</Alert>

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>Пользователи</Typography>

      {users.isLoading ? <Loader/> : users.error ? (
        <Alert severity="error">{users.error}</Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Заблокирован</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.list.map(u => {
                const self = auth.user?.id === u.id
                const disabled = users.isProcessing(u.id) || self
                return (
                  <Row key={u.id} hover $deleted={!!u.isDeleted}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>

                    <TableCell>
                      <Select<UserRole>
                        size="small"
                        value={u.role}
                        disabled={disabled || !!u.isDeleted}
                        onChange={(e) => users.setRole(u.id, e.target.value as UserRole)}
                      >
                        <MenuItem value="user">user</MenuItem>
                        <MenuItem value="moderator">moderator</MenuItem>
                        <MenuItem value="admin">admin</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>{u.isBlocked ? 'Да' : 'Нет'}</TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {!u.isDeleted && (
                          u.isBlocked ? (
                            <Tooltip title="Разблокировать">
                              <span>
                                <IconButton
                                  color="success"
                                  disabled={disabled}
                                  onClick={() => users.setBlocked(u.id, false)}
                                >
                                  <CheckIcon/>
                                </IconButton>
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Заблокировать">
                              <span>
                                <IconButton
                                  color="warning"
                                  disabled={disabled}
                                  onClick={() => users.setBlocked(u.id, true)}
                                >
                                  <BlockIcon/>
                                </IconButton>
                              </span>
                            </Tooltip>
                          )
                        )}

                        {!u.isDeleted ? (
                          <Tooltip title={self ? 'Нельзя удалить себя' : 'Удалить (мягко)'}>
                            <span>
                              <IconButton
                                color="warning"
                                disabled={disabled}
                                onClick={() => users.softDelete(u.id)}
                              >
                                <DeleteOutlineIcon/>
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="Восстановить">
                              <span>
                                <IconButton
                                  color="primary"
                                  disabled={users.isProcessing(u.id)}
                                  onClick={() => users.restore(u.id)}
                                >
                                  <RestoreFromTrashIcon/>
                                </IconButton>
                              </span>
                            </Tooltip>

                            <Tooltip title={self ? 'Нельзя удалить себя' : 'Удалить навсегда'}>
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={users.isProcessing(u.id) || self}
                                  onClick={() => users.hardDelete(u.id)}
                                >
                                  <DeleteForeverIcon/>
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </Row>
                )
              })}
              {users.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">Нет данных</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
})

export default AdminPage
