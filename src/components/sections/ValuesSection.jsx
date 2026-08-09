import { values } from "../../data/values";
import { Icon } from "../ui/Icon";
import { SectionTitle } from "../ui/SectionTitle";

export function ValuesSection({ light = false }) {
  return (
    <section className={`section values-section ${light ? "values-section-light" : ""}`}>
      <div className="container">
        <SectionTitle eyebrow="Our Values" title="What guides every interaction" light={!light} />
        <div className="values-grid">
          {values.map((value) => (
            <article className="value-card reveal" key={value.title}>
              <div><Icon name={value.icon} size={28} /></div>
              <h3>{value.title}</h3>
              <p>“{value.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

