export function euro(n){
  try{
    return new Intl.NumberFormat("nl-BE", { style:"currency", currency:"EUR" }).format(n);
  } catch {
    return `€ ${Number(n).toFixed(2)}`;
  }
}
