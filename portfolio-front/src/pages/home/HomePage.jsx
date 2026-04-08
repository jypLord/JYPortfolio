import Navbar from "../../common/components/navbar/Navbar.jsx";
import Hero from "./hero/Hero.jsx";
import TechStack from "./techStack/TechStack.jsx";
import Contact from "./contact/Contact.jsx";


export default function HomePage() {
  return (
      <div className="app">
        <Navbar />

        <main>
          <Hero />
          <TechStack />
          <Contact />
        </main>
      </div>
  );
}