import type React from "react"
interface SectionHeaderProps {
  title: string
  description?: string
  align?: "left" | "center" | "right"
  children?: React.ReactNode
}

export function SectionHeader({ title, description, align = "center", children }: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-col items-${
        align === "left" ? "start" : align === "right" ? "end" : "center"
      } justify-center space-y-4 ${align === "center" ? "text-center" : ""}`}
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title}</h2>
        {description && (
          <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
