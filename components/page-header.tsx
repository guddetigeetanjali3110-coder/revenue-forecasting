import { Badge } from "@/components/ui/badge"

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-3">
          {eyebrow && (
            <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
              {eyebrow}
            </Badge>
          )}
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
