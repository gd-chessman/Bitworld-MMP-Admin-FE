"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import TokenBittWorldService, { BittworldToken, CreateTokenRequest, UpdateTokenRequest, TokensResponse } from '@/services/api/TokenBittWorldService'
import { useLang } from '@/lang/useLang'

// Schema validation cho form tạo token
const createTokenSchema = z.object({
  bt_name: z.string().min(1, 'Token name is required'),
  bt_symbol: z.string().min(1, 'Token symbol is required').max(10, 'Symbol maximum 10 characters'),
  bt_address: z.string().min(1, 'Token address is required'),
  bt_logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  bt_status: z.boolean().default(true)
})

type CreateTokenFormData = z.infer<typeof createTokenSchema>

export default function CreateTokenPage() {
  const { t } = useLang()
  const [tokens, setTokens] = useState<BittworldToken[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingToken, setEditingToken] = useState<BittworldToken | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  })

  const createForm = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      bt_name: '',
      bt_symbol: '',
      bt_address: '',
      bt_logo_url: '',
      bt_status: true
    }
  })

  const editForm = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      bt_name: '',
      bt_symbol: '',
      bt_address: '',
      bt_logo_url: '',
      bt_status: true
    }
  })

  // Load danh sách token
  const loadTokens = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await TokenBittWorldService.getTokens()
      setTokens(response.data.tokens)
      setPagination(response.data.pagination)
      setCurrentPage(page)
    } catch (error: any) {
      toast.error(t('create-token.errors.loadTokensFailed', { message: error.response?.data?.message || error.message }))
    } finally {
      setLoading(false)
    }
  }

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasNext) {
      loadTokens(currentPage + 1)
    }
  }

  const handlePreviousPage = () => {
    if (pagination.hasPrev) {
      loadTokens(currentPage - 1)
    }
  }

  useEffect(() => {
    loadTokens()
  }, [])

  // Tạo token mới
  const handleCreateToken = async (data: CreateTokenFormData) => {
    try {
      setLoading(true)
      const tokenData: CreateTokenRequest = {
        ...data,
        bt_logo_url: data.bt_logo_url || ''
      }
      
      await TokenBittWorldService.createToken(tokenData)
      toast.success(t('create-token.create.success'))
      setIsCreateDialogOpen(false)
      createForm.reset()
      loadTokens()
    } catch (error: any) {
      toast.error(t('create-token.create.error', { message: error.response?.data?.message || error.message }))
    } finally {
      setLoading(false)
    }
  }

  // Mở dialog edit
  const handleEditToken = (token: BittworldToken) => {
    setEditingToken(token)
    editForm.reset({
      bt_name: token.bt_name,
      bt_symbol: token.bt_symbol,
      bt_address: token.bt_address,
      bt_logo_url: token.bt_logo_url || '',
      bt_status: token.bt_status
    })
    setIsEditDialogOpen(true)
  }

  // Cập nhật token
  const handleUpdateToken = async (data: CreateTokenFormData) => {
    if (!editingToken) return

    try {
      setLoading(true)
      const tokenData: UpdateTokenRequest = {
        bt_name: data.bt_name,
        bt_symbol: data.bt_symbol,
        bt_logo_url: data.bt_logo_url || '',
        bt_status: data.bt_status
      }
      
      await TokenBittWorldService.updateToken(editingToken.bt_id, tokenData)
      toast.success(t('create-token.edit.success'))
      setIsEditDialogOpen(false)
      setEditingToken(null)
      loadTokens()
    } catch (error: any) {
      toast.error(t('create-token.edit.error', { message: error.response?.data?.message || error.message }))
    } finally {
      setLoading(false)
    }
  }

  // Xóa token
  const handleDeleteToken = async (tokenId: number) => {
    try {
      setLoading(true)
      await TokenBittWorldService.deleteToken(tokenId)
      toast.success(t('create-token.delete.success'))
      loadTokens()
    } catch (error: any) {
      toast.error(t('create-token.delete.error', { message: error.response?.data?.message || error.message }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('create-token.title')}</h1>
          <p className="text-muted-foreground">{t('create-token.description')}</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('create-token.createNewToken')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{t('create-token.create.title')}</DialogTitle>
              <DialogDescription>
                {t('create-token.create.description')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreateToken)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bt_name">{t('create-token.create.tokenName')}</Label>
                  <Input
                    id="bt_name"
                    {...createForm.register('bt_name')}
                    placeholder={t('create-token.create.tokenNamePlaceholder')}
                  />
                  {createForm.formState.errors.bt_name && (
                    <p className="text-sm text-red-500">{t('create-token.create.validation.tokenNameRequired')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bt_symbol">{t('create-token.create.symbol')}</Label>
                  <Input
                    id="bt_symbol"
                    {...createForm.register('bt_symbol')}
                    placeholder={t('create-token.create.symbolPlaceholder')}
                  />
                  {createForm.formState.errors.bt_symbol && (
                    <p className="text-sm text-red-500">{t('create-token.create.validation.symbolRequired')}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bt_address">{t('create-token.create.address')}</Label>
                <Input
                  id="bt_address"
                  {...createForm.register('bt_address')}
                  placeholder={t('create-token.create.addressPlaceholder')}
                />
                {createForm.formState.errors.bt_address && (
                  <p className="text-sm text-red-500">{t('create-token.create.validation.addressRequired')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bt_logo_url">{t('create-token.create.logoUrl')}</Label>
                <Input
                  id="bt_logo_url"
                  {...createForm.register('bt_logo_url')}
                  placeholder={t('create-token.create.logoUrlPlaceholder')}
                />
                {createForm.formState.errors.bt_logo_url && (
                  <p className="text-sm text-red-500">{t('create-token.create.validation.invalidLogoUrl')}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="bt_status"
                  checked={createForm.watch('bt_status')}
                  onCheckedChange={(checked) => createForm.setValue('bt_status', checked)}
                />
                <Label htmlFor="bt_status">{t('create-token.create.activateToken')}</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('create-token.create.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('create-token.create.creating') : t('create-token.create.create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>{t('create-token.tokenList')}</CardTitle>
          <CardDescription>
            {t('create-token.tokenListDescription', { total: pagination.total })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('create-token.table.logo')}</TableHead>
                  <TableHead>{t('create-token.table.name')}</TableHead>
                  <TableHead>{t('create-token.table.symbol')}</TableHead>
                  <TableHead>{t('create-token.table.address')}</TableHead>
                  <TableHead>{t('create-token.table.status')}</TableHead>
                  <TableHead>{t('create-token.table.createdAt')}</TableHead>
                  <TableHead className="text-right">{t('create-token.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('create-token.noTokens')}
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((token) => (
                    <TableRow key={token.bt_id}>
                      <TableCell>
                      <img 
                            src={token.bt_logo_url} 
                            alt={token.bt_name}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-logo.png'
                            }}
                          />
                      </TableCell>
                      <TableCell className="font-medium">{token.bt_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{token.bt_symbol}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-yellow-500 italic">
                        {token.bt_address.length > 20 
                          ? `${token.bt_address.substring(0, 4)}...${token.bt_address.substring(token.bt_address.length - 4)}`
                          : token.bt_address
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={token.bt_status ? "default" : "secondary"}>
                          {token.bt_status ? (
                            <>
                              <Eye className="mr-1 h-3 w-3" />
                              {t('create-token.table.active')}
                            </>
                          ) : (
                            <>
                              <EyeOff className="mr-1 h-3 w-3" />
                              {t('create-token.table.hidden')}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(token.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditToken(token)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('create-token.delete.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('create-token.delete.description', { name: token.bt_name })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('create-token.delete.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteToken(token.bt_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  {t('create-token.delete.confirm')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-4 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
              {t('create-token.pagination.previous')}
            </Button>
            <span className="text-sm text-muted-foreground">
              {t('create-token.pagination.page', { current: currentPage, total: pagination.totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNext}
            >
              {t('create-token.pagination.next')}
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </Card>

      {/* Dialog Edit Token */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('create-token.edit.title')}</DialogTitle>
            <DialogDescription>
              {t('create-token.edit.description')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdateToken)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_bt_name">{t('create-token.edit.tokenName')}</Label>
                <Input
                  id="edit_bt_name"
                  {...editForm.register('bt_name')}
                  placeholder={t('create-token.edit.tokenNamePlaceholder')}
                />
                {editForm.formState.errors.bt_name && (
                  <p className="text-sm text-red-500">{t('create-token.edit.validation.tokenNameRequired')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_bt_symbol">{t('create-token.edit.symbol')}</Label>
                <Input
                  id="edit_bt_symbol"
                  {...editForm.register('bt_symbol')}
                  placeholder={t('create-token.edit.symbolPlaceholder')}
                />
                {editForm.formState.errors.bt_symbol && (
                  <p className="text-sm text-red-500">{t('create-token.edit.validation.symbolRequired')}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_bt_address">{t('create-token.edit.address')}</Label>
              <Input
                id="edit_bt_address"
                {...editForm.register('bt_address')}
                placeholder={t('create-token.edit.addressPlaceholder')}
                disabled
              />
              <p className="text-xs text-muted-foreground">{t('create-token.edit.addressDisabled')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_bt_logo_url">{t('create-token.edit.logoUrl')}</Label>
              <Input
                id="edit_bt_logo_url"
                {...editForm.register('bt_logo_url')}
                placeholder={t('create-token.edit.logoUrlPlaceholder')}
              />
              {editForm.formState.errors.bt_logo_url && (
                <p className="text-sm text-red-500">{t('create-token.edit.validation.invalidLogoUrl')}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit_bt_status"
                checked={editForm.watch('bt_status')}
                onCheckedChange={(checked) => editForm.setValue('bt_status', checked)}
              />
              <Label htmlFor="edit_bt_status">{t('create-token.edit.activateToken')}</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('create-token.edit.cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('create-token.edit.updating') : t('create-token.edit.update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}