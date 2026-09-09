import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Stylised placeholder package illustration.
 * Used until authentic product photography is available — never implies real packaging.
 */
export function ProductVisual({
  product,
  className,
  label = true,
}: {
  product: Product;
  className?: string;
  label?: boolean;
}) {
  const { tint, pack, accent, visual, weight, brand } = product;

  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ backgroundColor: tint }}
      role="img"
      aria-label={product.name.en}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        {/* soft ground shadow */}
        <ellipse cx="60" cy="108" rx="30" ry="5" fill="#17242A" opacity="0.08" />
        {visual === "bottle" && (
          <g>
            <rect x="52" y="8" width="16" height="10" rx="2.5" fill={accent} />
            <rect x="54" y="17" width="12" height="9" fill={pack} opacity="0.85" />
            <path
              d="M44 34c0-6 6-8 8-10h16c2 2 8 4 8 10v66a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8Z"
              fill={pack}
            />
            <path d="M44 40c4 3 28 3 32 0v-6c0-6-6-8-8-10H52c-2 2-8 4-8 10Z" fill="#FFFFFF" opacity="0.22" />
            {label && (
              <g>
                <rect x="48" y="52" width="24" height="30" rx="3" fill="#FFFFFF" />
                <rect x="51" y="57" width="18" height="3" rx="1.5" fill={accent} />
                <rect x="51" y="63" width="14" height="2" rx="1" fill="#66777D" opacity="0.6" />
                <rect x="51" y="68" width="16" height="2" rx="1" fill="#66777D" opacity="0.4" />
                <rect x="51" y="74" width="10" height="2" rx="1" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "jug" && (
          <g>
            <rect x="46" y="10" width="22" height="12" rx="3" fill={accent} />
            <path d="M38 32a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v68a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8Z" fill={pack} />
            <path d="M82 44h6a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8h-6" fill="none" stroke={pack} strokeWidth="7" />
            <path d="M38 36c6 4 38 4 44 0" stroke="#FFFFFF" strokeWidth="3" opacity="0.25" fill="none" />
            {label && (
              <g>
                <rect x="44" y="52" width="32" height="34" rx="4" fill="#FFFFFF" />
                <rect x="48" y="58" width="24" height="4" rx="2" fill={accent} />
                <rect x="48" y="66" width="18" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="48" y="72" width="20" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
                <rect x="48" y="78" width="12" height="2.5" rx="1.25" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "bag" && (
          <g>
            <path d="M34 30h52l6 72a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6Z" fill={pack} />
            <rect x="32" y="22" width="56" height="11" rx="3" fill={accent} />
            <path d="M34 30h52l1.5 18c-10 4-45 4-55 0Z" fill="#FFFFFF" opacity="0.18" />
            {label && (
              <g>
                <rect x="40" y="56" width="40" height="34" rx="4" fill="#FFFFFF" />
                <rect x="45" y="62" width="30" height="4" rx="2" fill={accent} />
                <rect x="45" y="70" width="22" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="45" y="76" width="26" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
                <rect x="45" y="82" width="14" height="2.5" rx="1.25" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "pouch" && (
          <g>
            <path d="M40 26l6-6 6 6 6-6 6 6 6-6 6 6 4 4v72a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V30Z" fill={pack} />
            <path d="M36 34c8 4 40 4 48 0" stroke="#FFFFFF" strokeWidth="3" opacity="0.25" fill="none" />
            {label && (
              <g>
                <rect x="44" y="50" width="32" height="36" rx="4" fill="#FFFFFF" />
                <rect x="48" y="56" width="24" height="4" rx="2" fill={accent} />
                <rect x="48" y="64" width="18" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="48" y="70" width="20" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
                <rect x="48" y="76" width="12" height="2.5" rx="1.25" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "can" && (
          <g>
            <ellipse cx="60" cy="26" rx="19" ry="6" fill={accent} />
            <path d="M41 26v74a8 8 0 0 0 8 8h22a8 8 0 0 0 8-8V26" fill={pack} />
            <ellipse cx="60" cy="26" rx="12" ry="3.5" fill="#FFFFFF" opacity="0.35" />
            {label && (
              <g>
                <rect x="45" y="48" width="30" height="38" rx="4" fill="#FFFFFF" />
                <rect x="49" y="54" width="22" height="4" rx="2" fill={accent} />
                <rect x="49" y="62" width="16" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="49" y="68" width="18" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
                <rect x="49" y="74" width="11" height="2.5" rx="1.25" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "spray" && (
          <g>
            <path d="M50 12h14v8H50z" fill={accent} />
            <path d="M64 14h10v5H64z" fill={accent} />
            <path d="M52 20h12v10H52z" fill={pack} opacity="0.8" />
            <path d="M46 38a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v62a8 8 0 0 1-8 8H54a8 8 0 0 1-8-8Z" fill={pack} />
            {label && (
              <g>
                <rect x="49" y="52" width="22" height="32" rx="3" fill="#FFFFFF" />
                <rect x="52" y="57" width="16" height="3.5" rx="1.75" fill={accent} />
                <rect x="52" y="64" width="12" height="2" rx="1" fill="#66777D" opacity="0.6" />
                <rect x="52" y="69" width="14" height="2" rx="1" fill="#66777D" opacity="0.4" />
                <rect x="52" y="75" width="9" height="2" rx="1" fill={pack} />
              </g>
            )}
          </g>
        )}
        {visual === "box" && (
          <g>
            <path d="M30 38l30-12 30 12v58a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" fill={pack} />
            <path d="M30 38l30 12 30-12-30-12Z" fill={accent} />
            <path d="M60 50v52" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
            {label && (
              <g>
                <rect x="40" y="60" width="40" height="28" rx="4" fill="#FFFFFF" />
                <rect x="45" y="65" width="30" height="4" rx="2" fill={accent} />
                <rect x="45" y="73" width="20" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="45" y="79" width="24" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
              </g>
            )}
          </g>
        )}
        {visual === "coil" && (
          <g>
            <rect x="32" y="30" width="56" height="66" rx="8" fill={pack} />
            <circle cx="60" cy="63" r="19" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.85" />
            <circle cx="60" cy="63" r="11" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.6" />
            <circle cx="60" cy="63" r="4" fill="#FFFFFF" opacity="0.9" />
            <rect x="40" y="36" width="26" height="5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
      </svg>
      {label ? (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#16339B]">
          {brand} • {weight}
        </span>
      ) : null}
    </div>
  );
}
