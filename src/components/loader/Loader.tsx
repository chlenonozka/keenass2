import './loader.css'

type Props = { inline?: boolean; full?: boolean }

export default function Loader({ inline, full }: Props) {
  if (inline) return <span className="spinner inline" aria-label="Загрузка" />
  if (full) return (
    <div className="loader-full">
      <span className="spinner" />
    </div>
  )
  return <div className="loader"><span className="spinner" /></div>
}
