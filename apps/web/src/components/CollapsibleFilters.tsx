import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function CollapsibleFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border rounded-xl p-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left"
      >
        {open ? (
          <ChevronDown className="w-5 h-5 transition-transform" />
        ) : (
          <ChevronRight className="w-5 h-5 transition-transform" />
        )}
        {open ? (
            <span className="text-sm text-muted-foreground">
              (Click to collapse)
            </span>
        ) : (
            <span className="text-sm text-muted-foreground">
              (Click to expand)
            </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mt-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
