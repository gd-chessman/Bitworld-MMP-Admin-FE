"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Edit, Trash2, Eye, EyeOff, ChevronLeft, Search, Image } from 'lucide-react'
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

// Image validation component
const TokenImage = ({ src, alt, name }: { src?: string; alt: string; name: string }) => {
    const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [imageUrl, setImageUrl] = useState<string | undefined>(src)

    useEffect(() => {
        if (!src) {
            setImageStatus('error')
            return
        }

        setImageStatus('loading')
        setImageUrl(src)

        const img = new window.Image()
        img.onload = () => {
            setImageStatus('success')
        }
        img.onerror = () => {
            setImageStatus('error')
        }
        img.src = src
    }, [src])

    if (!src || imageStatus === 'error') {
        return <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center" >{name.charAt(0).toUpperCase()}</div>
    }

    if (imageStatus === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        )
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className="w-8 h-8 rounded-full object-cover"
            onError={() => setImageStatus('error')}
        />
    )
}

export default function CreateTokenPage() {
    const { t } = useLang()
    const [tokens, setTokens] = useState<BittworldToken[]>([])
    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [search, setSearch] = useState('')
    const searchInputRef = useRef<HTMLInputElement>(null)
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
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
    })

    // Items per page options
    const itemsPerPageOptions = [10, 20, 50, 100]

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

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout
            return (searchTerm: string) => {
                clearTimeout(timeoutId)
                timeoutId = setTimeout(() => {
                    loadTokens(1, searchTerm)
                }, 500)
            }
        })(),
        []
    )

    // Clear search
    const clearSearch = () => {
        setSearch('')
        loadTokens(1, '')
    }

    // Load danh sách token
    const loadTokens = async (page: number = 1, searchTerm: string = search, limit: number = pagination.limit) => {
        try {
            setLoading(true)
            setSearchLoading(true)
            const response = await TokenBittWorldService.getTokens(searchTerm, page, limit)
            setTokens(response.data.tokens)
            setPagination(response.data.pagination)
            setCurrentPage(page)
        } catch (error: any) {
            toast.error(t('create-token.errors.loadTokensFailed', { message: error.response?.data?.message || error.message }))
        } finally {
            setLoading(false)
            setSearchLoading(false)
        }
    }

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        debouncedSearch(value)
    }

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                if (searchInputRef.current) {
                    searchInputRef.current.focus()
                }
            }
            // Escape to clear search
            if (e.key === 'Escape' && search) {
                clearSearch()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [search])

    // Pagination handlers
    const handleNextPage = () => {
        if (pagination.hasNext) {
            loadTokens(currentPage + 1, search)
        }
    }

    const handlePreviousPage = () => {
        if (pagination.hasPrev) {
            loadTokens(currentPage - 1, search)
        }
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= pagination.totalPages) {
            loadTokens(page, search)
        }
    }

    const handleItemsPerPageChange = (newLimit: number) => {
        setPagination(prev => ({ ...prev, limit: newLimit }))
        loadTokens(1, search, newLimit)
    }

    const handleGoToPage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const pageInput = formData.get('page') as string
        const page = parseInt(pageInput)
        
        if (page && page >= 1 && page <= pagination.totalPages) {
            loadTokens(page, search)
        }
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const totalPages = pagination.totalPages
        const current = currentPage
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Show pages around current page
            let start = Math.max(1, current - Math.floor(maxVisible / 2))
            let end = Math.min(totalPages, start + maxVisible - 1)

            // Adjust start if we're near the end
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
            }

            // Add first page and ellipsis if needed
            if (start > 1) {
                pages.push(1)
                if (start > 2) {
                    pages.push('...')
                }
            }

            // Add visible pages
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            // Add last page and ellipsis if needed
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pages.push('...')
                }
                pages.push(totalPages)
            }
        }

        return pages
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
            loadTokens(1, search)
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
            loadTokens(1, search)
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
            loadTokens(1, search)
        } catch (error: any) {
            toast.error(t('create-token.delete.error', { message: error.response?.data?.message || error.message }))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 pt-0 space-y-6 flex flex-col">
            <div className="sticky top-16 pb-4 dark:bg-background bg-white z-40 backdrop-blur-sm flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('create-token.title')}</h1>
                    <p className="text-muted-foreground">{t('create-token.description')}</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} modal={true}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('create-token.createNewToken')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
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

            <Card className='mt-0 flex-1'>
                <CardHeader>
                    <CardTitle>{t('create-token.tokenList')}</CardTitle>
                    <div className='flex justify-between items-center'>
                        <CardDescription>
                            {t('create-token.tokenListDescription', { total: pagination.total })}
                        </CardDescription>
                        <div className="relative w-80">
                            {searchLoading ? (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            )}
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder={t('create-token.searchPlaceholder')}
                                value={search}
                                onChange={handleSearchChange}
                                className="pl-10 pr-10"
                                disabled={searchLoading}
                            />
                            {search && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearSearch}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                                >
                                    <span className="sr-only">Clear search</span>
                                    ×
                                </Button>
                            )}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                    <span className="text-xs">Ctrl</span>K
                                </kbd>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {search && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                {t('create-token.searchResults', { 
                                    count: pagination.total, 
                                    search,
                                    page: currentPage,
                                    totalPages: pagination.totalPages 
                                })}
                            </p>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-background">
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
                                            {search ? t('create-token.noSearchResults', { search }) : t('create-token.noTokens')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tokens.map((token) => (
                                        <TableRow key={token.bt_id}>
                                            <TableCell className="py-2">
                                                <TokenImage src={token.bt_logo_url} alt={token.bt_name} name={token.bt_name} />
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

                                {/* Enhanced Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-4 pb-4 px-4">
                    {/* Items per page selector */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                            {t('create-token.pagination.itemsPerPage')}:
                        </span>
                        <select
                            value={pagination.limit}
                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                            className="border border-input bg-background px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {itemsPerPageOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pagination info */}
                    <div className="text-sm text-muted-foreground">
                        {t('create-token.pagination.showing', {
                            from: ((currentPage - 1) * pagination.limit) + 1,
                            to: Math.min(currentPage * pagination.limit, pagination.total),
                            total: pagination.total
                        })}
                    </div>

                    {/* Pagination controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={!pagination.hasPrev}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('create-token.pagination.previous')}
                            </Button>
                            
                            {getPageNumbers().map((page, index) => (
                                <React.Fragment key={index}>
                                    {page === '...' ? (
                                        <span className="text-sm text-muted-foreground px-2">...</span>
                                    ) : (
                                        <Button
                                            variant={page === currentPage ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page as number)}
                                            className="min-w-[40px]"
                                        >
                                            {page}
                                        </Button>
                                    )}
                                </React.Fragment>
                            ))}
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={!pagination.hasNext}
                            >
                                {t('create-token.pagination.next')}
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </Button>

                            {/* Go to page input */}
                            <div className="flex items-center space-x-2 ml-4">
                                <span className="text-sm text-muted-foreground">
                                    {t('create-token.pagination.goToPage')}:
                                </span>
                                <form onSubmit={handleGoToPage} className="flex items-center space-x-1">
                                    <Input
                                        name="page"
                                        type="number"
                                        min={1}
                                        max={pagination.totalPages}
                                        placeholder={currentPage.toString()}
                                        className="w-16 h-8 text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-2"
                                    >
                                        {t('create-token.pagination.go')}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
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