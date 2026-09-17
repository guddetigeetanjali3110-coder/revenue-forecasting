"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-card px-3 py-1.5 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FilterBar({
  years,
  regions,
}: {
  years: number[]
  regions: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const year = params.get("year") ?? "all"
  const region = params.get("region") ?? "all"

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value === "all") next.delete(key)
      else next.set(key, value)
      router.push(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [params, pathname, router],
  )

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius)] border border-border bg-card px-4 py-3 shadow-sm">
      <Select
        label="Year"
        value={year}
        onChange={(v) => update("year", v)}
        options={[
          { value: "all", label: "All years" },
          ...years.map((y) => ({ value: String(y), label: String(y) })),
        ]}
      />
      <Select
        label="Region"
        value={region}
        onChange={(v) => update("region", v)}
        options={[
          { value: "all", label: "All regions" },
          ...regions.map((r) => ({ value: r, label: r })),
        ]}
      />
      {(year !== "all" || region !== "all") && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="ml-auto text-sm font-medium text-primary hover:underline"
        >
          Reset filters
        </button>
      )}
    </div>
  )
}
