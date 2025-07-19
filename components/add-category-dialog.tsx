"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createCategoryToken } from "@/services/api/CategorysTokenService"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "react-toastify"
import { useLang } from "@/lang/useLang"

export function AddCategoryDialog() {
  const { t } = useLang()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createCategoryToken({
        slct_name: name,
        slct_slug: slug
      })
      
      // Invalidate and refetch the categories query
      await queryClient.invalidateQueries({ queryKey: ["category-token"] })
      toast.success(t('categories-token.table.categoryAdded'))
      
      // Reset form and close dialog
      setName("")
      setSlug("")
      setOpen(false)
    } catch (error) {
      console.error("Error creating category:", error)
      toast.error(t('categories-token.table.addFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button className="flex items-center gap-1" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        <span>{t('categories-token.table.addNew')}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('categories-token.table.addCategory')}</DialogTitle>
              <DialogDescription>{t('categories-token.table.addDescription')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('categories-token.table.nameLabel')}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. NFT Collection"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  {t('categories-token.table.slugLabel')}
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. nft-collection"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('categories-token.table.loading') : t('categories-token.table.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
