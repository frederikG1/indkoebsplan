import { examplePlan } from "../data/examplePlan";
import PlanView from "./PlanView";

const HomePage = () => {
  return (
    <div>
      <header className="header">
        <h1>Indkøbsplan</h1>
        <p>Velkommen til min Indkøbsplan</p>
      </header>
      <PlanView plan={examplePlan} />
    </div>
  );
};

export default HomePage;
