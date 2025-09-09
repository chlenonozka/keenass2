import { LoaderContainer, Spinner } from "./Loader.styles";

type Props = { inline?: boolean; full?: boolean }

export default function Loader({ inline, full }: Props) {
  if (inline) {
    return (
      <Spinner inline={inline} aria-label="Загрузка" />
    )
  }
  
  return (
    <LoaderContainer full={full}>
      <Spinner inline={inline} />
      {/* Вы можете добавить сюда текст, если хотите */}
      {/* <LoaderText>Загрузка...</LoaderText> */}
    </LoaderContainer>
  )
}