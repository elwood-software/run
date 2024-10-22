export type CardProps = {
  content: string;
};

export function Card(props: CardProps) {
  return <div className="bg-card p-6 rounded-xl mb-12">{props.content}</div>;
}
