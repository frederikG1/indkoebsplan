import type { Plan } from "../../../shared/types";
import { chainNames, itemNames } from "../data/examplePlan";

// Viser komponentens parametre, som er type Plan (props)
type PlanViewProps = {
  plan: Plan;
};

// Øre omregnes til -> "35,00 kr."
function formatKr(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " kr.";
}

const PlanView = ({ plan }: PlanViewProps) => {
  const storeNames = plan.chainIds.map((id) => chainNames[id]).join(" + ");

  return (
    <section>
      <h2>{storeNames}</h2>
      <p>
        I alt {formatKr(plan.totalCents)} - Du sparer{" "}
        {formatKr(plan.savingsCents)}
      </p>

      <table>
        <thead>
          <tr>
            <th>Vare</th>
            <th>Butik</th>
            <th>Pris</th>
          </tr>
        </thead>
        <tbody>
          {/* .map() laver én <tr> pr. linje. key skal være unik. */}
          {plan.lines.map((line) => (
            <tr key={line.itemId}>
              <td>{itemNames[line.itemId]}</td>
              {/* ? : vælger, hvad der vises. */}
              <td>{line.chainId !== null ? chainNames[line.chainId] : "–"}</td>
              <td>
                {line.priceCents !== null
                  ? formatKr(line.priceCents)
                  : "Intet tilbud"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default PlanView;
