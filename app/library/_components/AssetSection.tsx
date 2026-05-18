import { readdir } from 'node:fs/promises'
import path from 'node:path'
import Image from 'next/image'
import { AssetCopyButton } from './AssetCopyButton'

type AssetCategory = 'videos' | 'lottie' | 'png' | 'illustrations'

interface AssetItem {
  name: string
  path: string
  category: AssetCategory
  ext: string
}

const CATEGORIES: AssetCategory[] = ['videos', 'lottie', 'png', 'illustrations']

const CATEGORY_LABEL: Record<AssetCategory, string> = {
  videos:        'Videos (.mp4 / .webm)',
  lottie:        'Lottie (.json)',
  png:           'Imagens (.png)',
  illustrations: 'Ilustracoes (.svg)',
}

async function loadAssets(): Promise<AssetItem[]> {
  const assetsRoot = path.join(process.cwd(), 'public', 'assets')
  const items: AssetItem[] = []

  for (const cat of CATEGORIES) {
    const dir = path.join(assetsRoot, cat)
    try {
      const files = await readdir(dir)
      for (const file of files) {
        if (file.startsWith('.')) continue
        items.push({
          name:     file,
          path:     `/assets/${cat}/${file}`,
          category: cat,
          ext:      path.extname(file).toLowerCase(),
        })
      }
    } catch {
      // Diretorio vazio ou inexistente — ignora
    }
  }

  return items
}

/**
 * AssetSection — Server Component que lista todos os assets de public/assets/.
 * Agrupa por categoria com previews inline.
 */
export async function AssetSection() {
  const assets = await loadAssets()

  if (assets.length === 0) {
    return (
      <div
        className="rounded-xl border p-8 text-center"
        style={{
          borderColor:     'rgba(242, 239, 234, 0.07)',
          backgroundColor: 'hsl(200 11% 9%)',
        }}
      >
        <p className="text-sm" style={{ color: 'hsl(40 12% 71%)' }}>
          Nenhum asset encontrado em <code className="text-xs">public/assets/</code>.
        </p>
        <p className="mt-1 text-xs" style={{ color: 'hsl(38 7% 51%)' }}>
          Adicione arquivos nas subpastas videos/, lottie/, png/, illustrations/ e recarregue a pagina.
        </p>
      </div>
    )
  }

  const grouped = CATEGORIES.reduce<Record<AssetCategory, AssetItem[]>>(
    (acc, cat) => {
      acc[cat] = assets.filter((a) => a.category === cat)
      return acc
    },
    { videos: [], lottie: [], png: [], illustrations: [] }
  )

  return (
    <div className="flex flex-col gap-10">
      {CATEGORIES.map((cat) => {
        const items = grouped[cat]
        if (items.length === 0) return null

        return (
          <div key={cat}>
            <h3
              className="mb-4 text-xs font-mono uppercase tracking-widest"
              style={{ color: 'hsl(40 12% 71%)' }}
            >
              {CATEGORY_LABEL[cat]} ({items.length})
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <AssetCard key={item.path} item={item} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function AssetCard({ item }: { item: AssetItem }) {
  const isImage  = item.ext === '.png' || item.ext === '.jpg' || item.ext === '.jpeg'
  const isSvg    = item.ext === '.svg'
  const isVideo  = item.ext === '.mp4' || item.ext === '.webm'

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: 'hsl(200 11% 9%)',
        border: '1px solid rgba(242, 239, 234, 0.07)',
      }}
    >
      {/* Preview area */}
      <div
        className="flex h-28 items-center justify-center overflow-hidden"
        style={{ background: 'hsl(200 11% 6%)' }}
      >
        {isImage && (
          <Image
            src={item.path}
            alt={item.name}
            width={160}
            height={100}
            className="h-full w-full object-contain p-2"
          />
        )}
        {isSvg && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.path}
            alt={item.name}
            className="h-full w-full object-contain p-2"
          />
        )}
        {isVideo && (
          <video
            src={item.path}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            aria-label={`Preview de ${item.name}`}
          />
        )}
        {item.ext === '.json' && (
          <span style={{ color: 'hsl(40 12% 71%)' }} className="font-mono text-xs">
            JSON Lottie
          </span>
        )}
        {!isImage && !isSvg && !isVideo && item.ext !== '.json' && (
          <span style={{ color: 'hsl(40 12% 71%)' }} className="font-mono text-xs">
            {item.ext}
          </span>
        )}
      </div>

      {/* Info + copia */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <span
          className="truncate text-xs"
          style={{ color: 'hsl(40 21% 86%)', fontFamily: 'var(--font-mono)' }}
          title={item.path}
        >
          {item.name}
        </span>
        <AssetCopyButton path={item.path} />
      </div>
    </div>
  )
}
