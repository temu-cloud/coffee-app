'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

interface ImageUploadProps {
  currentUrl?: string | null
  onUpload: (file: File) => void
  disabled?: boolean
}

export default function ImageUpload({ currentUrl, onUpload, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onUpload(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative w-32 h-32 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 flex items-center justify-center overflow-hidden ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-amber-500 hover:bg-amber-100 transition-colors'
        }`}
      >
        {preview ? (
          <Image src={preview} alt="Product" fill className="object-cover" unoptimized />
        ) : (
          <div className="text-center text-amber-400">
            <div className="text-3xl mb-1">📷</div>
            <div className="text-xs">Click to upload</div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      {preview && !disabled && (
        <button
          type="button"
          onClick={() => {
            setPreview(null)
            if (inputRef.current) inputRef.current.value = ''
          }}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Remove image
        </button>
      )}
    </div>
  )
}
