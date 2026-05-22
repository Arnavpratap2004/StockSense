"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Package, Loader2 } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/utils/stock-status";

interface SearchResult {
  sku: string;
  name: string;
  status: string;
  category?: { name: string } | null;
}

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stock?search=${encodeURIComponent(q)}&pageSize=8`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search inventory by name or SKU..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-[var(--text-secondary)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            <span className="text-[var(--text-muted)]">No results found.</span>
          )}
        </CommandEmpty>
        <CommandGroup heading="Inventory">
          {results.map((item) => {
            const statusConf = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
            return (
              <CommandItem
                key={item.sku}
                value={`${item.sku} ${item.name}`}
                onSelect={() => {
                  router.push(`/inventory/${item.sku}`);
                  onOpenChange(false);
                  setQuery("");
                }}
                className="cursor-pointer"
              >
                <Package className="w-4 h-4 mr-2 text-[var(--text-muted)]" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
                  <span className="text-xs text-[var(--brand-primary)] ml-2 font-mono">{item.sku}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.category && (
                    <span className="text-xs text-[var(--text-muted)]">{item.category.name}</span>
                  )}
                  {statusConf && (
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dotColor}`} />
                  )}
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
