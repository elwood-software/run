export type CardProps = {
  content: string;
};

export function Card(props: CardProps) {
  return <div className="bg-card p-6 rounded-xl mb-12">{props.content}</div>;
}

export function PricePerMinute(props: {perHour: number}) {
  const basePrice = props.perHour / 60;
  const price = basePrice + basePrice * 0.25;

  return `$${Number(price).toPrecision(4)}`;
}
