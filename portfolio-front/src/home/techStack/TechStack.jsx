import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import "./TechStack.css";

const stacks = [
  { name: "Java", icon: "logos:java" },
  { name: "Spring", icon: "logos:spring-icon" },

  { name: "WebFlux", imgUrl: "/webflux-logo.png" },

  { name: "Redis", icon: "logos:redis" },
  { name: "MySQL", icon: "logos:mysql" },
  { name: "JPA", icon: "simple-icons:hibernate" },
  { name: "JUnit5", icon: "simple-icons:junit5" },
  { name: "Kafka", icon: "simple-icons:apachekafka" },
  { name: "AWS", icon: "logos:aws" },
];

export default function TechStack() {
  return (
      <section className="section" id="tech">
        <div className="sectionHead">
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <h2 className="h2" style={{ margin: 0 }}>Tech Stack</h2>

            {/* /projects 로 이동 */}
            <Link to="/projects" className="projectCtaBtn">
              Project 보기 →
            </Link>
          </div>
        </div>

        <div className="techGrid">
          {stacks.map((s) => (
              <div className="techCard" key={s.name}>
            <span className="techIcon">
              {s.imgUrl ? (
                  <img className="techImg" src={s.imgUrl} alt={s.name} />
              ) : (
                  <Icon icon={s.icon} width="38" height="38" />
              )}
            </span>
                <span className="techName">{s.name}</span>
              </div>
          ))}
        </div>
      </section>
  );
}