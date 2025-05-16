import Link from "next/link"

interface CategoryCardProps {
  category: {
    id: string
    name: string
    image: string
    count: number
  }
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/plans?category=${category.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
          <p className="text-sm text-white/80">{category.count} Plans</p>
        </div>
      </div>
    </Link>
  )
}
