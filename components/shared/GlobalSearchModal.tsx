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
import { Package, Search } from "lucide-react";

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
            <div className="flex items-center justify-center gap-2 py-4">
              <Search className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          ) : (
            "No results found."
          )}
        </CommandEmpty>
        <CommandGroup heading="Inventory">
          {results.map((item) => (
            <CommandItem
              key={item.sku}
              value={`${item.sku} ${item.name}`}
              onSelect={() => {
                router.push(`/inventory/${item.sku}`);
                onOpenChange(false);
                setQuery("");
              }}
            >
              <Package className="w-4 h-4 mr-2 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{item.sku}</span>
              </div>
              {item.category && (
                <span className="text-xs text-muted-foreground">{item.category.name}</span>
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
